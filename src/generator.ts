/**
 * Pure JSDoc generation logic — no VS Code API here, so it can be unit-tested
 * directly and reused anywhere.
 */

export function generateJsdoc(
  obj: unknown,
  name: string,
  indent = "",
): string {
  const defs: string[] = [];
  const root = emitTypedef(obj, name, indent, defs);
  return defs.join("\n") + "\n";
}

/**
 * Emits the typedef for `value` into `defs` (nested ones first is not
 * required by JSDoc/TS — order does not matter) and returns the typedef line.
 */
function emitTypedef(
  value: unknown,
  name: string,
  indent: string,
  defs: string[],
): string {
  if (value === null) {
    // typeof null === "object" in JS; handle it before the object branch.
    defs.push(`${indent} * @typedef {any} ${name}`);
    return `${indent} * @typedef {any} ${name}`;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      const def = `${indent} * @typedef {Array<any>} ${name}`;
      defs.push(def);
      return def;
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
    if (
      propValue !== null &&
      typeof propValue === "object" &&
      !Array.isArray(propValue)
    ) {
      const nestedName = `${name}_${sanitize(key)}`;
      lines.push(`${indent} * @property {${nestedName}} ${key}`);
      // Recurse: the nested typedef actually gets emitted now.
      emitTypedef(propValue, nestedName, indent, defs);
    } else if (
      Array.isArray(propValue) &&
      propValue.length > 0 &&
      typeof propValue[0] === "object"
    ) {
      const itemName = `${name}_${sanitize(key)}Item`;
      lines.push(
        `${indent} * @property {Array<${itemName}>} ${key}`,
      );
      emitTypedef(propValue[0], itemName, indent, defs);
    } else {
      const example = JSON.stringify(propValue)?.slice(0, 50) ?? "";
      lines.push(
        `${indent} * @property {${inferType(propValue)}} ${key} - e.g:${example}`,
      );
    }
  }

  lines.push(`${indent} */`);
  // Object typedefs carry their own comment block; splice it in whole.
  defs.unshift(lines.join("\n"));
  return "";
}

export function inferType(value: unknown): string {
  if (value === null) {return "any";}
  if (Array.isArray(value)) {
    if (value.length === 0) {return "Array<any>";}
    return `Array<${inferType(value[0])}>`;
  }
  if (typeof value === "object") {return "object";}
  return typeof value;
}

function sanitize(key: string): string {
  const clean = key.replace(/[^a-zA-Z0-9]/g, "");
  return capitalize(clean.length > 0 ? clean : "Prop");
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
