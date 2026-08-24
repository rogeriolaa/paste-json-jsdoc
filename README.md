# Paste JSON as JSDoc

Convert clipboard JSON into clean JSDoc `@typedef` definitions — right inside VS Code.

![License](https://img.shields.io/badge/license-MIT-blue)

## What It Does

Stop writing JSDoc types manually. Copy a JSON object — from an API response, a config file, or a mock payload — run the command, and get a typed `@typedef` block inserted at your cursor.

Great for:

- Documenting API response shapes
- Adding IntelliSense to plain JavaScript projects
- Quickly annotating config and data objects

## Usage

1. Copy any JSON object to your clipboard:

   ```json
   {
     "id": 1,
     "name": "Rogerio",
     "active": true,
     "createdAt": "2024-01-15T10:30:00Z",
     "tags": ["javascript", "vscode"]
   }
   ```

2. Trigger the command using any of the methods below
3. Enter a name for the type (e.g. `User`)

**Result:**

```javascript
/**
 * @typedef {object} User
 * @property {number} id - e.g:1
 * @property {string} name - e.g:"Rogerio"
 * @property {boolean} active - e.g:true
 * @property {string} createdAt - e.g:"2024-01-15T10:30:00Z"
 * @property {Array<string>} tags - e.g:["javascript","vscode"]
 */
```

### Nested Objects and Arrays of Objects

Nested structures get their own `@typedef` blocks — every referenced type actually exists, so IntelliSense resolves everything:

```json
{
  "order": { "id": 7, "customer": { "name": "Ana" } },
  "items": [{ "sku": "X1", "qty": 2 }],
  "total": 49.9
}
```

**Result** (name it `OrderResponse`):

```javascript
/**
 * @typedef {object} OrderResponse
 * @property {OrderResponse_Order} order
 * @property {Array<OrderResponse_ItemsItem>} items
 * @property {number} total - e.g:49.9
 */
/**
 * @typedef {object} OrderResponse_Order
 * @property {number} id - e.g:7
 * @property {OrderResponse_Order_Customer} customer
 */
/**
 * @typedef {object} OrderResponse_Order_Customer
 * @property {string} name - e.g:"Ana"
 */
/**
 * @typedef {object} OrderResponse_ItemsItem
 * @property {string} sku - e.g:"X1"
 * @property {number} qty - e.g:2
 */
```

## How to Run the Command

### Command Palette

Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`), type **Paste JSON as JSDoc** and press Enter.

### Right-Click Context Menu

Right-click anywhere inside an editor and select **Paste JSON as JSDoc Typedef** from the context menu.

### Keyboard Shortcut

The default keybinding is `Ctrl+Alt+J` (Windows/Linux) or `Cmd+Alt+J` (Mac).

To customize it:

1. Open **File → Preferences → Keyboard Shortcuts** (`Ctrl+K Ctrl+S`)
2. Search for `pasteJsonAsJsdoc.generate`
3. Click the pencil icon next to the command
4. Press your desired key combination and hit Enter

## Compile and Install Locally

### Run in Development Mode

To test the extension locally without installing it permanently:

1. Open the project in VS Code
2. Run:

   ```bash
   npm install
   npm run compile
   ```

3. Press `F5`
4. A new **Extension Development Host** window will open with the extension loaded

This is the fastest way to test changes while developing.

### Build a VSIX Package

To package the extension into a `.vsix` file:

```bash
npm install
npm run compile
npx vsce package
```

This creates a `.vsix` file in the project root, for example:

```bash
paste-json-jsdoc-0.0.1.vsix
```

### Install the VSIX in VS Code

You can install the packaged extension in either of these ways:

- In VS Code, open the Extensions view, open the `...` menu, and choose **Install from VSIX...**
- Or run:

  ```bash
  code --install-extension paste-json-jsdoc-0.0.1.vsix
  ```

VS Code supports installing extensions directly from a `.vsix` file through the Extensions view or the `--install-extension` command [web:46][web:53].

## Features

- ✅ Detects `string`, `number`, `boolean`, and `null` types
- ✅ Generates real sub-typedefs for nested objects and arrays of objects
- ✅ Handles arrays of primitives and objects
- ✅ Inserts output at the current cursor position
- ✅ Works with any `.js`, `.ts`, or `.jsx` file

## Requirements

- VS Code `1.116.0` or higher
- No additional dependencies required

## Extension Settings

This extension has no configurable settings yet. Future versions may include options for:

- Custom property comment format
- Optional/required property markers

## Known Limitations

- JSON has no native `Date` type, so date-like values are treated as strings by default.
- Arrays with mixed item types are typed from the first element and may need manual adjustment.
- Property examples in comments are truncated to 50 characters.

## Release Notes

### 0.1.0

- **Fixed:** nested objects and arrays of objects now emit their referenced typedefs (previously generated references to types that did not exist)
- Type names are sanitized to valid identifiers
- Generator extracted to its own module; 14 tests run against the real code

### 0.0.1

Initial release:

- Command `Paste JSON as JSDoc Typedef`
- Command Palette support
- Right-click context menu support
- Default keybinding `Ctrl+Alt+J` / `Cmd+Alt+J`
- Primitive type inference
- Nested object and array support

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests on [GitHub](https://github.com/rogeriolaa/paste-json-jsdoc).

## License

MIT
