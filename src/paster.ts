
'use strict';
import * as path from 'path';
import * as vscode from 'vscode';
import {PasterConfig, PredefinedVars} from './config';
import {getShellScript} from './shellscript';

function getRelativePath(docPath: vscode.Uri, imageFilePath: vscode.Uri): string {
    return encodeURI(path.relative(docPath.fsPath, imageFilePath.fsPath).replace(/\\/g, '/'));
}

class Paster {
    public static async pasteImageOnWorkspace(output:vscode.Uri) {
        const script = getShellScript();
        try {
            const stat = await vscode.workspace.fs.stat(output);
            const predefinedVars = new PredefinedVars(output);
            if(2 !== stat.type){
                output = vscode.Uri.joinPath(output, "../");
            }
            let filename:string = PasterConfig.getImageFileName("");
            filename = predefinedVars.replace(filename);
            const saveFile:vscode.Uri = vscode.Uri.joinPath(output, filename);
            const imageData = await script.getBase64Image();
            await this.saveImage(saveFile, imageData);
            console.debug("save image: "+saveFile);
        } catch(err){
            vscode.window.showErrorMessage(""+err);
        }
    }

    public static async pasteImageOnEditor() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {return;}
        const target = new PasteTarget(editor);
        const script = getShellScript();

        try {
            let imageUri = target.getImagePath();
            if(PasterConfig.useFilePathConfirm()){
                const newPath = await this.confirmImagePath(imageUri);
                if(!newPath){return;}
                imageUri = newPath;
            }
            const imageData = await script.getBase64Image();
            await this.saveImage(imageUri, imageData);
            const context = target.getPasteImageText(imageUri);
            target.pasteText(context);
            console.debug("save image: "+imageUri);
        } catch(err){
            vscode.window.showErrorMessage(""+err);
        }
    }

    public static async pasteBase64ImageOnEditor() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {return;}
        const target = new PasteTarget(editor);
        const script = getShellScript();

        try {
            const imageUri = target.getImagePath();
            const imageData = await script.getBase64Image();
            const context = target.getPasteBase64ImageText(imageUri, imageData);
            await target.pasteText(context[0]);
            target.pasteEnd(context[1])
            console.debug("paste base64 image");
        } catch(err){
            vscode.window.showErrorMessage(""+err);
        }
    }

    private static async confirmImagePath(imageUri:vscode.Uri): Promise<vscode.Uri | undefined>{
        const imagePath:string = imageUri.fsPath;
        const filename:string = path.basename(imagePath);
        const options: vscode.InputBoxOptions = {
            prompt: "You can change the filename. The existing file will be overwritten!.",
            value: imagePath,
            placeHolder: "(e.g:../test/myimage.png)",
            valueSelection: [imagePath.length - filename.length, imagePath.length - 4],
        };
        const inputVal = await vscode.window.showInputBox(options);
        return inputVal ? vscode.Uri.file(inputVal) : undefined;
    }

    private static async saveImage(saveFile:vscode.Uri, base64:string){
        try {
            const buff:Uint8Array = Buffer.from(base64, 'base64');
            await vscode.workspace.fs.writeFile(saveFile, buff);
        } catch(err){
            throw new Error('faild save image of clipboard');
        }
    }
}

class PasteTarget {
    private editor:vscode.TextEditor;

    constructor(editor:vscode.TextEditor){
        this.editor = editor;
    }

    public getPasteImageText(imageUri:vscode.Uri):string {
        const baseUri = this.getBaseUri();
        const lang = this.editor.document.languageId;
        const tpl = PasterConfig.getPasteTemplate(lang);
 
        const filePath:string = getRelativePath(baseUri, imageUri);
        const predefinedVars = new PredefinedVars(baseUri);
        predefinedVars.set("relativePath", filePath);

        return predefinedVars.replace(tpl);
    }

    public getPasteBase64ImageText(imageUri:vscode.Uri, base64:string):string[] {
        const baseUri = this.getBaseUri();
        const lang = this.editor.document.languageId;
        const tpls = PasterConfig.getPasteBase64Template(lang);
        
        const filePath:string = path.basename(imageUri.fsPath);
        const predefinedVars = new PredefinedVars(baseUri);
        predefinedVars.set("relativePath", filePath);
        predefinedVars.set("base64", base64);

        return tpls.map(t => predefinedVars.replace(t));
    }
    
    public getImagePath():vscode.Uri {
        let baseUri = this.getBaseUri();
        baseUri = PasterConfig.getBasePath(baseUri);

        const content = this.getSelectText();
        const predefinedVars = new PredefinedVars(this.editor.document.uri);
        let filename = PasterConfig.getImageFileName(content);
        filename = predefinedVars.replace(filename);

        return vscode.Uri.joinPath(baseUri, filename);
    }

    public getBaseUri():vscode.Uri {
        const baseUri = this.editor.document.uri;
        if (!baseUri || baseUri.scheme === 'untitled') {
            throw new Error('Before pasting an image, you need to save the current edited file first.');
        }
        return vscode.Uri.joinPath(baseUri, "../");
    }

    public getSelectText():string {
        const selection = this.editor.selection;
        const selectText = this.editor.document.getText(selection);

        if (selectText && !/^[^\\/:\*\?""<>|]{1,120}$/.test(selectText)) {
            throw new Error('Your selection is not a valid file name!');
        }
        return selectText;
    }

    public pasteText(context:string){
        return this.editor.edit(edit => {
            const current = this.editor.selection;

            if (current.isEmpty) {
                edit.insert(current.start, context);
            } else {
                edit.replace(current, context);
            }
        });
    }
    
    public pasteEnd(context:string){
        return this.editor.edit(edit => {
            const pt = new vscode.Position(this.editor.document.lineCount, 0);
            edit.insert(pt, context);
        });
    }
}

export {Paster};