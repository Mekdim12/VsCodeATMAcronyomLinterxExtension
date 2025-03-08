import * as vscode from 'vscode';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

let acronyms: { [key: string]: { description: string, basic_detail: string, detailed_detail: string, ai_suggestion?: string } } = {};

// Load acronyms from JSON file
const acronymsFilePath = path.join(__dirname, 'atm_acronyms.json');

function loadAcronyms(): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.readFile(acronymsFilePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading acronyms file:', err);
        reject(err);
        return;
      }
      acronyms = JSON.parse(data);
      resolve();
    });
  });
}

async function getAISuggestion(acronym: string): Promise<string> {
  const url = "http://192.168.0.112:11434/api/generate";
  const data = {
    model: "tinyllama", // Use the correct model
    prompt: `Provide a detailed explanation for the acronym ${acronym}`,
    stream: false
  };
  const headers = {
    "Content-Type": "application/json"
  };

  try {
    const response = await axios.post(url, data, { headers });
    console.log(response.data); // Print the response
    return response.data.response; // Adjust this based on the actual response structure
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error calling Ollama API:", error.response ? error.response.data : error.message);
    } else {
      console.error("Error calling Ollama API:2", error);
    }
    return `Error fetching AI suggestion: ${(error as any)?.message}`;
  }
}

export async function activate(context: vscode.ExtensionContext) {
  await loadAcronyms();

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
        const acronym = acronyms[selectedText];
        if (acronym) {
          vscode.window.showInformationMessage(`${selectedText}: ${acronym.description}`);
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
            foundAcronyms.push(`${acronym}: ${acronyms[acronym].description}`);
          }
        });

        const docString = `/**\n * Acronyms:\n * ${foundAcronyms.join('\n * ')}\n */\n`;
        editor.edit(editBuilder => {
          editBuilder.insert(new vscode.Position(0, 0), docString);
        });
      }
    })
  );

  // Register a completion provider for acronyms
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      [
        { scheme: 'file', language: 'plaintext' },
        { scheme: 'file', language: 'python' },
        { scheme: 'file', language: 'javascript' },
        { scheme: 'file', language: 'typescript' },
        { scheme: 'file', language: 'java' },
        { scheme: 'file', language: 'cpp' }
      ],
      {
        async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
          const completionItems: vscode.CompletionItem[] = [];
          for (const acronym of Object.keys(acronyms)) {
            const item = new vscode.CompletionItem(acronym, vscode.CompletionItemKind.Text);
            item.detail = acronyms[acronym].description;
            const aiSuggestion = await getAISuggestion(acronym);
            console.log(aiSuggestion);
            acronyms[acronym].ai_suggestion = aiSuggestion;

            item.documentation = new vscode.MarkdownString(`**Basic Detail:** ${acronyms[acronym].basic_detail}\n\n**Detailed Detail:** ${acronyms[acronym].detailed_detail}\n\n**AI Suggestion:** ${aiSuggestion}`);
            completionItems.push(item);
          }
          return completionItems;
        }
      }
    )
  );
}

export function deactivate() {}