import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import {getShellScript} from '../../shellscript';

describe('Extension Test Suite (shellscript)', () => {
	vscode.window.showInformationMessage('Start shellscript tests.');
	const conf = vscode.workspace.getConfiguration('pasteImage');
	let rootDir:vscode.Uri; 
	if(undefined !== vscode.workspace.workspaceFolders && 0 < vscode.workspace.workspaceFolders.length){
		rootDir = vscode.workspace.workspaceFolders[0] && vscode.workspace.workspaceFolders[0].uri;
	}
	const script = getShellScript();

	it('saveImage success', async () => {
		const base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjEuNWRHWFIAAAAMSURBVBhXY2BgYAAAAAQAAVzN/2kAAAAASUVORK5CYII="
		const sh = "../src/test/win32 _test_set_clipboard_image.ps1";
		await script.runScript(sh, [base64]);
		const file:vscode.Uri = vscode.Uri.joinPath(rootDir, "sample.png");
		await script.saveImage(file);
	}).timeout(10000);

	it('saveImage false', async () => {
		await vscode.env.clipboard.writeText('a');
		const file:vscode.Uri = vscode.Uri.joinPath(rootDir, "sample.png");
		try{
			await script.saveImage(file);
			assert.fail();
		}catch(err){
			assert.equal(""+err, 'Error: image of clipboard is empty');
		}
	}).timeout(10000);
});
