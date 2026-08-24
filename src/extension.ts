import * as vscode from "vscode";
import { generateJsdoc } from "./generator";

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
      let parsed: unknown;
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
      if (!typeName) {return;}

      // 4. Generate JSDoc
      const jsdoc = generateJsdoc(parsed, sanitizeTypeName(typeName));

      // 5. Insert at cursor
      await editor.edit((editBuilder) => {
        editBuilder.insert(editor.selection.active, jsdoc);
      });
    },
  );

  context.subscriptions.push(disposable);
}

/** Type names end up inside `{...}` annotations — keep them identifier-safe. */
function sanitizeTypeName(name: string): string {
  const clean = name.trim().replace(/[^a-zA-Z0-9_$]/g, "");
  return clean.length > 0 ? clean : "GeneratedType";
}

export function deactivate() {}
