import * as vscode from 'vscode';

const acronyms: { [key: string]: string } = {
  "ATM": "Air Traffic Management",
  "ATC": "Air Traffic Control",
  "FAA": "Federal Aviation Administration",
  // Add more acronyms here
};

export function activate(context: vscode.ExtensionContext) {
  // Create a decoration type for highlighting
  const acronymDecorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(255, 255, 0, 0.3)', // Yellow highlight
  });

  // Function to highlight acronyms
  function highlightAcronyms(editor: vscode.TextEditor) {
    const text = editor.document.getText();
    const decorations: vscode.DecorationOptions[] = [];

    // Iterate through each acronym in the dictionary
    Object.keys(acronyms).forEach(acronym => {
      // Create a regex pattern to match the acronym in valid contexts
	  const regex = new RegExp(`(?<=^|\\s|[^A-Za-z])${acronym}(?=$|\\s|[^A-Za-z])|(?<=[a-z])${acronym}(?=$|\\s|[^a-z])|(?<=^|\\s|[^A-Za-z])${acronym}(?=[A-Z][a-z])`, 'gi');

      // Find all matches in the text
      let match;
      while ((match = regex.exec(text)) !== null) {
        const startPos = editor.document.positionAt(match.index);
        const endPos = editor.document.positionAt(match.index + acronym.length);
        const decoration = { range: new vscode.Range(startPos, endPos) };
        decorations.push(decoration);
      }
    });

    // Apply the decorations to the editor
    editor.setDecorations(acronymDecorationType, decorations);
  }

  // Highlight acronyms when the active editor changes
  vscode.window.onDidChangeActiveTextEditor(editor => {
    if (editor) {
      highlightAcronyms(editor);
    }
  });

  // Highlight acronyms in the current editor when the extension is activated
  if (vscode.window.activeTextEditor) {
    highlightAcronyms(vscode.window.activeTextEditor);
  }

  // Listen for text changes in the active editor
  vscode.workspace.onDidChangeTextDocument(event => {
    const editor = vscode.window.activeTextEditor;
    if (editor && event.document === editor.document) {
      highlightAcronyms(editor);
    }
  });

  // Register command to show acronym definition
  context.subscriptions.push(
    vscode.commands.registerCommand('atmacronymhighlighter.showAcronymDefinition', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);
        const definition = acronyms[selectedText];
        if (definition) {
          vscode.window.showInformationMessage(`${selectedText}: ${definition}`);
        } else {
          vscode.window.showInformationMessage(`No definition found for "${selectedText}"`);
        }
      }
    })
  );

  // Register command to collect acronyms
  context.subscriptions.push(
    vscode.commands.registerCommand('atmacronymhighlighter.collectAcronyms', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const text = editor.document.getText();
        const foundAcronyms: string[] = [];

        Object.keys(acronyms).forEach(acronym => {
			const regex = new RegExp(`(?<=^|\\s|[^A-Za-z])${acronym}(?=$|\\s|[^A-Za-z])|(?<=[a-z])${acronym}(?=$|\\s|[^a-z])|(?<=^|\\s|[^A-Za-z])${acronym}(?=[A-Z][a-z])`, 'gi');
          if (regex.test(text)) {
            foundAcronyms.push(`${acronym}: ${acronyms[acronym]}`);
          }
        });

        const docString = `/**\n * Acronyms:\n * ${foundAcronyms.join('\n * ')}\n */\n`;
        editor.edit(editBuilder => {
          editBuilder.insert(new vscode.Position(0, 0), docString);
        });
      }
    })
  );
}

export function deactivate() {}