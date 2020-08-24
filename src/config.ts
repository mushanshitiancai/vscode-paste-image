'use strict';
import * as path from 'path';
import * as moment from 'moment';
import * as vscode from 'vscode';

class PasterConfig {
    public static useFilePathConfirm():boolean {
        return vscode.workspace.getConfiguration('pasteImage').showFilePathConfirmInputBox;
    }

    public static getImageFileName(selectText:string, extension: string = '.png'):string {
        if (!selectText) {
            let defaultName = vscode.workspace.getConfiguration('pasteImage').defaultName;
            return moment().format(defaultName) + extension;
        }
        return selectText + extension;
    }

    // get image destination path
    public static getBasePath(uri: vscode.Uri): vscode.Uri {
        let savefolder = vscode.workspace.getConfiguration('pasteImage').path;
        savefolder = (new PredefinedVars(uri)).replace(savefolder).trim();
        if (path.isAbsolute(savefolder)) {
            return vscode.Uri.file(savefolder);
        }
        return vscode.Uri.joinPath(uri, savefolder);
    }

    public static getPasteTemplate(languageId: string): string {
        let tpls:Map<string, string> = new Map();
        tpls.set("markdown", "![](${relativePath})");
        tpls.set("asciidoc", "image::${relativePath}[]");

        let tpl:string|undefined;
        tpls.forEach( (val, key) => {
            if(key == languageId){
                tpl = val;
            }
        });
        return tpl ? tpl : "${relativePath}";
    }
}

class PredefinedVars {
    private replaceMap:Map<string, string> = new Map();

    public constructor(current:vscode.Uri){
        this.replaceMap = new Map();
        if(undefined !== vscode.workspace.workspaceFolders && 0 < vscode.workspace.workspaceFolders.length){
            const rootDir = vscode.workspace.workspaceFolders[0].uri.fsPath;
            this.set("workspaceRoot", rootDir);
            this.set("projectRoot", rootDir);
        }
        
        const currPath = current && current.fsPath;

        if(currPath) {
            this.set("currentFileDir", currPath);
            this.set("fileExtname", path.extname(currPath));
            this.set("fileBasenameNoExtension" ,path.basename(currPath, this.replaceMap.get("${fileExtname}")));
            this.set("fileBasename", path.basename(currPath));
            this.set("fileDirname", path.dirname(currPath));
        }
    }
    
    public replace(str:String) {
        this.replaceMap.forEach( (val, key) =>{
            str = str.replace(key, val);
        });
        // User may be input a path with backward slashes (\), so need to replace all '\' to '/'.
        return str.replace(/\\/g, '/');
    }

    public set(key:string, val:string){
        this.replaceMap.set("${"+key+"}", val);
    }
}

export {PasterConfig, PredefinedVars};