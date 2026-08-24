import * as assert from "assert";
import * as vscode from "vscode";
// Import the REAL generator — no copies. If extension code changes, these
// tests exercise the shipped logic.
import { generateJsdoc, inferType } from "../generator";

suite("Generator — unit (real module)", () => {
  test("simple object produces object typedef with typed properties", () => {
    const jsdoc = generateJsdoc({ id: 1, name: "Ana", active: true }, "User");
    assert.ok(jsdoc.includes("/**"));
    assert.ok(jsdoc.includes("@typedef {object} User"));
    assert.ok(jsdoc.includes("@property {number} id - e.g:1"));
    assert.ok(jsdoc.includes('@property {string} name - e.g:"Ana"'));
    assert.ok(jsdoc.includes("@property {boolean} active - e.g:true"));
  });

  test("nested objects emit BOTH the reference and the nested typedef", () => {
    const jsdoc = generateJsdoc(
      { user: { profile: { age: 25 } } },
      "Payload",
    );
    assert.ok(jsdoc.includes("@property {Payload_User} user"));
    // The referenced typedef must exist — this was the ghost-type bug.
    assert.ok(jsdoc.includes("@typedef {object} Payload_User"));
    assert.ok(jsdoc.includes("@property {Payload_User_Profile} profile"));
    assert.ok(jsdoc.includes("@typedef {object} Payload_User_Profile"));
    assert.ok(jsdoc.includes("@property {number} age"));
  });

  test("arrays of objects emit the item typedef", () => {
    const jsdoc = generateJsdoc({ items: [{ id: 1 }, { id: 2 }] }, "List");
    assert.ok(jsdoc.includes("@property {Array<List_ItemsItem>} items"));
    assert.ok(jsdoc.includes("@typedef {object} List_ItemsItem"));
    assert.ok(jsdoc.includes("@property {number} id"));
  });

  test("empty array becomes Array<any>", () => {
    const jsdoc = generateJsdoc({ tags: [] }, "T");
    assert.ok(jsdoc.includes("@property {Array<any>} tags"));
  });

  test("null property becomes any", () => {
    const jsdoc = generateJsdoc({ data: null }, "NullableTest");
    assert.ok(jsdoc.includes("@property {any} data"));
  });

  test("root-level null does not crash", () => {
    const jsdoc = generateJsdoc(null, "Nothing");
    assert.ok(jsdoc.includes("@typedef {any} Nothing"));
  });

  test("array of primitives stays inline", () => {
    const jsdoc = generateJsdoc({ tags: ["a", "b"] }, "TagList");
    assert.ok(jsdoc.includes("@property {Array<string>} tags"));
  });

  test("example values are truncated to 50 chars", () => {
    const longText = "x".repeat(200);
    const jsdoc = generateJsdoc({ text: longText }, "Long");
    const example = jsdoc.match(/e\.g:"(x+)"/)?.[1].length ?? 0;
    assert.ok(example <= 50, `example should be truncated, got ${example}`);
  });

  test("weird property keys produce valid typedef names", () => {
    const jsdoc = generateJsdoc({ "user-name": { age: 1 } }, "P");
    assert.ok(jsdoc.includes("@property {P_Username} user-name"));
    assert.ok(jsdoc.includes("@typedef {object} P_Username"));
  });

  test("inferType basics", () => {
    assert.strictEqual(inferType(null), "any");
    assert.strictEqual(inferType([]), "Array<any>");
    assert.strictEqual(inferType(["a"]), "Array<string>");
    assert.strictEqual(inferType({}), "object");
    assert.strictEqual(inferType(42), "number");
  });
});

suite("Extension Activation", () => {
  test("Extension should be present and activate", async () => {
    const extension = vscode.extensions.getExtension(
      "n0n3br.paste-json-jsdoc",
    );
    assert.ok(extension, "Extension should be installed");
    await extension!.activate();
    assert.strictEqual(extension!.isActive, true);
  });

  test("Command should be registered", async () => {
    const commands = await vscode.commands.getCommands(true);
    assert.ok(commands.includes("pasteJsonAsJsdoc.generate"));
  });
});

suite("Editor Integration (real command, real clipboard)", () => {
  let doc: vscode.TextDocument;

  setup(async () => {
    doc = await vscode.workspace.openTextDocument({
      language: "javascript",
      content: "",
    });
    await vscode.window.showTextDocument(doc);
  });

  teardown(async () => {
    await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });

  test("invalid JSON shows error and leaves document untouched", async () => {
    await vscode.env.clipboard.writeText("{ invalid json");
    await vscode.commands.executeCommand("pasteJsonAsJsdoc.generate");
    assert.strictEqual(doc.getText(), "", "document should stay empty");
  });

  test("empty clipboard shows error and leaves document untouched", async () => {
    await vscode.env.clipboard.writeText("   ");
    await vscode.commands.executeCommand("pasteJsonAsJsdoc.generate");
    assert.strictEqual(doc.getText(), "");
  });
});
