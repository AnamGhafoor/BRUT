"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
let diagnosticCollection;
function activate(context) {
    diagnosticCollection = vscode.languages.createDiagnosticCollection("brat");
    const runCommand = vscode.commands.registerCommand("brat.runFile", async () => {
        await runBratFile(context, "--run");
    });
    const checkCommand = vscode.commands.registerCommand("brat.checkFile", async () => {
        await runBratFile(context, "--check --json");
    });
    context.subscriptions.push(runCommand, checkCommand, diagnosticCollection);
}
function deactivate() {
    if (diagnosticCollection) {
        diagnosticCollection.dispose();
    }
}
function getActiveBratDocument() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage("No active file is open.");
        return undefined;
    }
    const document = editor.document;
    if (document.languageId !== "brat" && !document.fileName.endsWith(".brt")) {
        vscode.window.showErrorMessage("This is not a BRAT .brt file.");
        return undefined;
    }
    return document;
}
function getPythonPath() {
    const config = vscode.workspace.getConfiguration("brat");
    return config.get("pythonPath") || "python";
}
function getCompilerModule() {
    const config = vscode.workspace.getConfiguration("brat");
    return config.get("compilerModule") || "compiler.main";
}
function quote(value) {
    return `"${value.replace(/"/g, '\\"')}"`;
}
async function runBratFile(context, mode) {
    const document = getActiveBratDocument();
    if (!document) {
        return;
    }
    if (document.isDirty) {
        await document.save();
    }
    const pythonPath = getPythonPath();
    const compilerModule = getCompilerModule();
    const filePath = document.fileName;
    const runtimeRoot = context.asAbsolutePath("brut-runtime");
    const terminal = vscode.window.createTerminal({
        name: "BRUT Compiler",
        cwd: runtimeRoot
    });
    terminal.show();
    const command = `${pythonPath} -m ${compilerModule} ${quote(filePath)} ${mode}`;
    terminal.sendText(`Clear-Host; Write-Host "BRUT Compiler" -ForegroundColor Cyan; Write-Host "Running your BRAT file..." -ForegroundColor Green; ${command}`);
}
//# sourceMappingURL=extension.js.map