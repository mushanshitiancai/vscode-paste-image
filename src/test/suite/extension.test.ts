import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import {getShellScript} from '../../shellscript';
import { TextEncoder } from 'util';

describe('Extension Test Suite (command)', () => {
	vscode.window.showInformationMessage('Start command tests.');
	const conf = vscode.workspace.getConfiguration('pasteImage');
	let rootDir:vscode.Uri; 
	if(undefined !== vscode.workspace.workspaceFolders && 0 < vscode.workspace.workspaceFolders.length){
		rootDir = vscode.workspace.workspaceFolders[0] && vscode.workspace.workspaceFolders[0].uri;
	}
	const script = getShellScript();

	it('setup', async () => {
		await conf.update('showFilePathConfirmInputBox', false);
		const base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjEuNWRHWFIAAAAMSURBVBhXY2BgYAAAAAQAAVzN/2kAAAAASUVORK5CYII="
		const sh = "../src/test/win32 _test_set_clipboard_image.ps1";
		await script.runScript(sh, [base64]);
	}).timeout(10000);

	it('command vscode-paste-image.pasteImage test', async () => {
		const fpath = vscode.Uri.joinPath(rootDir, "sample.md");
		const buff = (new TextEncoder).encode('sample')
		await vscode.workspace.fs.writeFile(fpath, buff);
		const editor = await vscode.window.showTextDocument(fpath, { preview: false });
		await vscode.commands.executeCommand("vscode-paste-image.pasteImage");
		editor.document.save();
	}).timeout(10000);

	it('command vscode-paste-image.pasteBase64Image test', async () => {
		const fpath = vscode.Uri.joinPath(rootDir, "sample.md");
		const buff = (new TextEncoder).encode('sample')
		await vscode.workspace.fs.writeFile(fpath, buff);
		const editor = await vscode.window.showTextDocument(fpath, { preview: false });
		await vscode.commands.executeCommand("vscode-paste-image.pasteBase64Image");
		editor.document.save();
	}).timeout(10000);

	it('command vscode-paste-image.createImage test', async () => {
		await vscode.commands.executeCommand("vscode-paste-image.createImage", rootDir);
	}).timeout(10000);
});
