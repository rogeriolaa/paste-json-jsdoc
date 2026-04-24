# Paste JSON as JSDoc

Convert clipboard JSON into clean JSDoc `@typedef` definitions — right inside VS Code.

## What It Does

Stop writing JSDoc types manually. Copy a JSON object — from an API response, a config file, or a mock payload — run the command, and get a fully typed `@typedef` block inserted at your cursor.

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
 * @property {Date} createdAt - e.g:"2024-01-15T10:30:00Z"
 * @property {Array<string>} tags - e.g:["javascript","vscode"]
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

## Features

- ✅ Detects `string`, `number`, `boolean`, and `null` types
- ✅ Recognizes ISO date strings and types them as `Date`
- ✅ Handles nested objects with referenced sub-typedefs
- ✅ Handles arrays of primitives and objects
- ✅ Inserts output at the current cursor position
- ✅ Works with any `.js`, `.ts`, or `.jsx` file

## Requirements

- VS Code `1.74.0` or higher
- No additional dependencies required

## Extension Settings

This extension has no configurable settings yet. Future versions may include options for:

- Custom property comment format
- Optional/required property markers
- Automatic nested typedef generation

## Known Limitations

- Deeply nested objects reference sub-typedefs by name but do not auto-generate them
- JSON arrays with mixed types default to `Array<any>`

## Release Notes

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
