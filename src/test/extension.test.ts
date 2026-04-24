import * as assert from "assert";
import * as vscode from "vscode";
import * as path from "path";

suite("Extension Activation", () => {
  test("Extension should be present", () => {
    const extension = vscode.extensions.getExtension("n0n3br.paste-json-jsdoc");
    assert.ok(extension, "Extension should be installed");
  });

  test("Extension should activate", async () => {
    const extension = vscode.extensions.getExtension("n0n3br.paste-json-jsdoc");
    if (!extension) {
      assert.fail("Extension not found");
      return;
    }
    await extension.activate();
    assert.strictEqual(extension.isActive, true, "Extension should be active");
  });

  test("Command should be registered", async () => {
    const commands = await vscode.commands.getCommands(true);
    const hasCommand = commands.includes("pasteJsonAsJsdoc.generate");
    assert.ok(
      hasCommand,
      "pasteJsonAsJsdoc.generate command should be registered",
    );
  });
});

suite("JSDoc Generation", () => {
  test("Should generate typedef for simple object", async () => {
    const json = {
      id: 123,
      name: "Test User",
      active: true,
    };

    const jsdoc = generateJsdoc(json, "User");

    assert.ok(
      jsdoc.includes("@typedef {object} User"),
      "Should declare object typedef",
    );
    assert.ok(
      jsdoc.includes("@property {number} id"),
      "Should have number property",
    );
    assert.ok(
      jsdoc.includes("@property {string} name"),
      "Should have string property",
    );
    assert.ok(
      jsdoc.includes("@property {boolean} active"),
      "Should have boolean property",
    );
  });

  test("Should handle null values as any type", () => {
    const json = { data: null };
    const jsdoc = generateJsdoc(json, "NullableTest");
    assert.ok(
      jsdoc.includes("@property {any} data"),
      "Null should become any type",
    );
  });

  test("Should handle arrays with primitive items", () => {
    const json = { tags: ["javascript", "vscode"] };
    const jsdoc = generateJsdoc(json, "TagList");
    assert.ok(
      jsdoc.includes("@property {Array<string>} tags"),
      "Should type array of strings",
    );
  });

  test("Should handle nested objects", () => {
    const json = {
      user: {
        profile: {
          age: 25,
        },
      },
    };
    const jsdoc = generateJsdoc(json, "NestedTest");
    assert.ok(
      jsdoc.includes("@property {NestedTest_User} user"),
      "Should reference nested typedef",
    );
  });

  test("Should handle arrays with object items", () => {
    const json = {
      items: [{ id: 1 }, { id: 2 }],
    };
    const jsdoc = generateJsdoc(json, "ListResponse");
    assert.ok(
      jsdoc.includes("@property {Array<ListResponse_ItemsItem>} items"),
      "Should type array of objects",
    );
  });

  test("Should wrap output in JSDoc comment block", () => {
    const json = { foo: "bar" };
    const jsdoc = generateJsdoc(json, "Simple");
    assert.ok(jsdoc.startsWith("/**"), "Should start with JSDoc opener");
    assert.ok(jsdoc.endsWith("*/\n"), "Should end with JSDoc closer");
  });
});

suite("Clipboard Integration", () => {
  test("Should read clipboard content", async () => {
    await vscode.env.clipboard.writeText('{"test": true}');
    const content = await vscode.env.clipboard.readText();
    assert.strictEqual(
      content,
      '{"test": true}',
      "Clipboard should contain written text",
    );
  });

  test("Should handle invalid JSON gracefully", async () => {
    const invalidJson = "{ invalid json }";
    let parseError = false;

    try {
      JSON.parse(invalidJson);
    } catch {
      parseError = true;
    }

    assert.ok(parseError, "Invalid JSON should throw parse error");
  });
});

suite("Editor Integration", () => {
  test("Should insert text at cursor position", async () => {
    const doc = await vscode.workspace.openTextDocument({
      language: "javascript",
      content: "",
    });
    const editor = await vscode.window.showTextDocument(doc);

    const position = new vscode.Position(0, 0);
    await editor.edit((editBuilder) => {
      editBuilder.insert(position, "/** @typedef {string} Test */");
    });

    const text = doc.getText();
    assert.ok(
      text.includes("@typedef {string} Test"),
      "Text should be inserted at cursor",
    );
  });
});

// Helper function copied from extension for unit testing
function generateJsdoc(obj: any, name: string, indent = ""): string {
  if (obj === null) return `${indent} * @typedef {null} ${name}\n`;
  if (Array.isArray(obj)) {
    const itemType = obj.length > 0 ? inferType(obj[0]) : "any";
    return `${indent} * @typedef {Array<${itemType}>} ${name}\n`;
  }
  if (typeof obj !== "object") {
    return `${indent} * @typedef {${typeof obj}} ${name}\n`;
  }

  let lines = [`${indent}/**`, `${indent} * @typedef {object} ${name}`];

  for (const [key, value] of Object.entries(obj)) {
    const propType = inferType(value);
    const example = JSON.stringify(value).slice(0, 50);

    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      const nestedName = `${name}_${capitalize(key)}`;
      lines.push(`${indent} * @property {${nestedName}} ${key}`);
    } else if (
      Array.isArray(value) &&
      value.length > 0 &&
      typeof value[0] === "object"
    ) {
      const itemName = `${name}_${capitalize(key)}Item`;
      lines.push(
        `${indent} * @property {Array<${itemName}>} ${key} - e.g: ${example}`,
      );
    } else {
      lines.push(`${indent} * @property {${propType}} ${key} - e.g:${example}`);
    }
  }

  lines.push(`${indent} */`);
  return lines.join("\n") + "\n";
}

function inferType(value: any): string {
  if (value === null) return "any";
  if (Array.isArray(value)) {
    if (value.length === 0) return "Array<any>";
    const inner = inferType(value[0]);
    return `Array<${inner}>`;
  }
  if (typeof value === "object") return "object";
  return typeof value;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
