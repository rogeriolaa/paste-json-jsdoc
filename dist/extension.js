"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode = __toESM(require("vscode"));

// src/generator.ts
function generateJsdoc(obj, name, indent = "") {
  const defs = [];
  const root = emitTypedef(obj, name, indent, defs);
  return defs.join("\n") + "\n";
}
function emitTypedef(value, name, indent, defs) {
  if (value === null) {
    defs.push(`${indent} * @typedef {any} ${name}`);
    return `${indent} * @typedef {any} ${name}`;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      const def2 = `${indent} * @typedef {Array<any>} ${name}`;
      defs.push(def2);
      return def2;
    }
    const itemName = `${name}Item`;
    emitTypedef(value[0], itemName, indent, defs);
    const def = `${indent} * @typedef {Array<${itemName}>} ${name}`;
    defs.push(def);
    return def;
  }
  if (typeof value !== "object") {
    const def = `${indent} * @typedef {${typeof value}} ${name}`;
    defs.push(def);
    return def;
  }
  const lines = [`${indent}/**`, `${indent} * @typedef {object} ${name}`];
  for (const [key, propValue] of Object.entries(value)) {
    if (propValue !== null && typeof propValue === "object" && !Array.isArray(propValue)) {
      const nestedName = `${name}_${sanitize(key)}`;
      lines.push(`${indent} * @property {${nestedName}} ${key}`);
      emitTypedef(propValue, nestedName, indent, defs);
    } else if (Array.isArray(propValue) && propValue.length > 0 && typeof propValue[0] === "object") {
      const itemName = `${name}_${sanitize(key)}Item`;
      lines.push(
        `${indent} * @property {Array<${itemName}>} ${key}`
      );
      emitTypedef(propValue[0], itemName, indent, defs);
    } else {
      const example = JSON.stringify(propValue)?.slice(0, 50) ?? "";
      lines.push(
        `${indent} * @property {${inferType(propValue)}} ${key} - e.g:${example}`
      );
    }
  }
  lines.push(`${indent} */`);
  defs.unshift(lines.join("\n"));
  return "";
}
function inferType(value) {
  if (value === null) {
    return "any";
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "Array<any>";
    }
    return `Array<${inferType(value[0])}>`;
  }
  if (typeof value === "object") {
    return "object";
  }
  return typeof value;
}
function sanitize(key) {
  const clean = key.replace(/[^a-zA-Z0-9]/g, "");
  return capitalize(clean.length > 0 ? clean : "Prop");
}
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// src/extension.ts
function activate(context) {
  const disposable = vscode.commands.registerCommand(
    "pasteJsonAsJsdoc.generate",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No active editor");
        return;
      }
      const jsonText = await vscode.env.clipboard.readText();
      if (!jsonText.trim()) {
        vscode.window.showErrorMessage("Clipboard is empty");
        return;
      }
      let parsed;
      try {
        parsed = JSON.parse(jsonText);
      } catch {
        vscode.window.showErrorMessage("Invalid JSON in clipboard");
        return;
      }
      const typeName = await vscode.window.showInputBox({
        prompt: "Enter the typedef name",
        placeHolder: "e.g., IApiResponse"
      });
      if (!typeName) {
        return;
      }
      const jsdoc = generateJsdoc(parsed, sanitizeTypeName(typeName));
      await editor.edit((editBuilder) => {
        editBuilder.insert(editor.selection.active, jsdoc);
      });
    }
  );
  context.subscriptions.push(disposable);
}
function sanitizeTypeName(name) {
  const clean = name.trim().replace(/[^a-zA-Z0-9_$]/g, "");
  return clean.length > 0 ? clean : "GeneratedType";
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
