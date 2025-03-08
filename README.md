# ATMAcronymHighLighter README

ATMAcronymHighLighter is a VS Code extension that highlights air traffic management (ATM) acronyms, provides quick definitions via a shortcut, and collects acronyms into a docstring.

## Features

- **Highlight Acronyms**: Automatically highlights ATM acronyms in your code.
- **Show Acronym Definition**: Quickly view the definition of an acronym using a keyboard shortcut.
- **Collect Acronyms**: Collect all acronyms in the current document and insert them into a docstring.

## Requirements

- Visual Studio Code version 1.98.0 or higher.

## Extension Settings

This extension contributes the following settings:

* `atmacronymhighlighter.enable`: Enable/disable this extension.
* `atmacronymhighlighter.showAcronymDefinition`: Show the definition of the selected acronym.
* `atmacronymhighlighter.collectAcronyms`: Collect all acronyms in the current document.

## Known Issues

- No known issues at this time.

## Release Notes

### 0.0.1

- Initial release of ATMAcronymHighLighter.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

## How to Run

To run this extension, follow these steps:

1. **Clone the repository**:
    ```sh
    git clone https://github.com/yourusername/atmacronymhighlighter.git
    cd atmacronymhighlighter
    ```

2. **Open the project in Visual Studio Code**:
    ```sh
    code .
    ```

3. **Install dependencies**:
    ```sh
    npm install
    ```

4. **Run the extension**:
    - Press `F5` to open a new VS Code window with the extension loaded.

5. **Use the extension**:
    - Open any text file, and the extension will automatically highlight ATM acronyms.
    - Use the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on macOS) to access the following commands:
        - `ATMAcronymHighLighter: Show Acronym Definition`
        - `ATMAcronymHighLighter: Collect Acronyms`

**Enjoy!**