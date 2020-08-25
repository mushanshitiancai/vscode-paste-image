import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import {PasterConfig, PredefinedVars} from '../../config';
import moment = require('moment');

function sleep(time:number) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}
describe('Extension Test Suite (config)', () => {
	vscode.window.showInformationMessage('Start config tests.');
	const conf = vscode.workspace.getConfiguration('pasteImage');
	let rootDir:vscode.Uri; 
	if(undefined !== vscode.workspace.workspaceFolders && 0 < vscode.workspace.workspaceFolders.length){
		rootDir = vscode.workspace.workspaceFolders[0] && vscode.workspace.workspaceFolders[0].uri;
	}

	it('setup', async () => {
		await conf.update('defaultName', "ss-mm-HH-Y-MM-DD");
	});

	it('getImageFileName test 1', () => {
		assert.equal("hoge.txt", PasterConfig.getImageFileName("hoge", ".txt"));
	});
	it('getImageFileName test 2', () => {
		assert.equal("hoge.png", PasterConfig.getImageFileName("hoge"));
	});
	it('getImageFileName test 3', () => {
		const actual = moment().format("ss-mm-HH-Y-MM-DD");
		assert.equal(actual+".txt", PasterConfig.getImageFileName("", ".txt"));
	});
	it('getImageFileName test 4', () => {
		const actual = moment().format("ss-mm-HH-Y-MM-DD");
		assert.equal(actual+".png", PasterConfig.getImageFileName(""));
	});

	it('useFilePathConfirm test', async () => {
		await conf.update('showFilePathConfirmInputBox', true);
		assert.equal(true, PasterConfig.useFilePathConfirm());
		await conf.update('showFilePathConfirmInputBox', false);
		assert.equal(false, PasterConfig.useFilePathConfirm());
	});

	it('getPasteTemplate test', async () => {
		assert.equal("![](${relativePath})", PasterConfig.getPasteTemplate("markdown"));
		assert.equal("image::${relativePath}[]", PasterConfig.getPasteTemplate("asciidoc"));
		assert.equal("${relativePath}", PasterConfig.getPasteTemplate("html"));
	});

	it('getBasePath test relative', async () => {
		const uri:vscode.Uri = vscode.Uri.joinPath(rootDir, "sample");
		await conf.update('path', './');
		assert.equal(""+uri+"/", ""+PasterConfig.getBasePath(uri));
	});

	it('getBasePath test absolute', async () => {
		const uri:vscode.Uri = vscode.Uri.joinPath(rootDir, "zzz/sample.abc");
		const actual:vscode.Uri = vscode.Uri.joinPath(uri, "../../../../../../../../../../../../../../../../../../../../../", "a/b/c");
		await conf.update('path', actual.fsPath);
		assert.equal(""+actual, ""+PasterConfig.getBasePath(uri));
	});

	it('getBasePath test workspaceRoot', async () => {
		const uri:vscode.Uri = vscode.Uri.joinPath(rootDir, "zzz/sample.abc");
		await conf.update('path', "${workspaceRoot}");
		assert.equal(""+rootDir, ""+PasterConfig.getBasePath(uri));
	});

	it('getBasePath test projectRoot', async () => {
		const uri:vscode.Uri = vscode.Uri.joinPath(rootDir, "zzz/sample.abc");
		await conf.update('path', "${projectRoot}");
		assert.equal(""+rootDir, ""+PasterConfig.getBasePath(uri));
	});

	it('getBasePath test currentFileDir', async () => {
		const uri:vscode.Uri = vscode.Uri.joinPath(rootDir, "zzz/sample.abc");
		await conf.update('path', "${currentFileDir}");
		assert.equal(""+uri, ""+PasterConfig.getBasePath(uri));
	});

	it('getBasePath test fileBasenameNoExtension', async () => {
		const uri:vscode.Uri = vscode.Uri.joinPath(rootDir, "zzz/sample.abc");
		await conf.update('path', "${fileBasenameNoExtension}");
		assert.equal(""+uri+"/sample", ""+PasterConfig.getBasePath(uri));
	});

	it('getBasePath test fileBasename', async () => {
		const uri:vscode.Uri = vscode.Uri.joinPath(rootDir, "zzz/sample.abc");
		await conf.update('path', "${fileBasename}");
		assert.equal(""+uri+"/sample.abc", ""+PasterConfig.getBasePath(uri));
	});

	it('getBasePath test fileDirname', async () => {
		const uri:vscode.Uri = vscode.Uri.joinPath(rootDir, "zzz/sample.abc");
		await conf.update('path', "${fileDirname}");
		assert.equal(""+vscode.Uri.joinPath(uri, '..'), ""+PasterConfig.getBasePath(uri));
	});

	it('getBasePath test projectRoot fileBasenameNoExtension', async () => {
		const uri:vscode.Uri = vscode.Uri.joinPath(rootDir, "zzz/sample.abc");
		await conf.update('path', "${projectRoot}/${fileBasenameNoExtension}");
		assert.equal(""+rootDir+"/sample", ""+PasterConfig.getBasePath(uri));
	});

});
