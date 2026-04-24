import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "pasteJsonAsJsdoc.generate",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No active editor");
        return;
      }

      // 1. Read clipboard
      const jsonText = await vscode.env.clipboard.readText();
      if (!jsonText.trim()) {
        vscode.window.showErrorMessage("Clipboard is empty");
        return;
      }

      // 2. Parse JSON
      let parsed: any;
      try {
        parsed = JSON.parse(jsonText);
      } catch {
        vscode.window.showErrorMessage("Invalid JSON in clipboard");
        return;
      }

      // 3. Ask for type name
      const typeName = await vscode.window.showInputBox({
        prompt: "Enter the typedef name",
        placeHolder: "e.g., IApiResponse",
      });
      if (!typeName) return;

      // 4. Generate JSDoc
      const jsdoc = generateJsdoc(parsed, typeName);

      // 5. Insert at cursor
      editor.edit((editBuilder) => {
        editBuilder.insert(editor.selection.active, jsdoc);
      });
    },
  );

  context.subscriptions.push(disposable);
}

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
      // Nested object — generate inline or recursive typedef
      const nestedName = `${name}_${capitalize(key)}`;
      lines.push(`${indent} * @property {${nestedName}} ${key}`);
      // You could also emit nested typedefs separately
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
