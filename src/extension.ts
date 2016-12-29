'use strict';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import {spawn} from 'child_process';
import * as moment from 'moment';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "vscode-paste-image" is now active!');

    let disposable = vscode.commands.registerCommand('extension.pasteImage', () => {
        Paster.paste();
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
}

class Paster {

    public static paste() {
        // get current edit file path
        let editor = vscode.window.activeTextEditor;
        if (!editor) return;

        let fileUri = editor.document.uri;
        if (!fileUri) return;
        if (fileUri.scheme === 'untitled') {
            vscode.window.showInformationMessage('Before paste image, you need to save current edit file first.');
            return;
        }

        // get selection as image file name, need check
        var selection = editor.selection;
        var selectText = editor.document.getText(selection);
        if(selectText && !/^[\w\-.]+$/.test(selectText)){
            vscode.window.showInformationMessage('Your selection is not a valid file name!');
            return;
        }

        // get image destination path
        let filePath = fileUri.fsPath;
        let imagePath = this.getImagePath(filePath, selectText);

        let imageDir = path.dirname(imagePath);
        fs.exists(imageDir, (exists) => {
            if (! exists) {
                fs.mkdir(imageDir);
            }

            // save image and insert to current edit file
            this.saveClipboardImageToFileAndGetPath(imagePath, imagePath => {
                if(!imagePath) return;
                if(imagePath === 'no image'){
                    vscode.window.showInformationMessage('There is not a image in clipboard.');
                    return;
                }

                imagePath = this.renderFilePath(editor.document.languageId,filePath,imagePath);

                editor.edit(edit => {
                    let current = editor.selection;
                    
                    if(current.isEmpty){
                        edit.insert(current.start,imagePath);
                    }else{
                        edit.replace(current,imagePath);
                    }
                })
            });
        });
    }

    public static getImagePath(filePath:string, selectText:string): string {
        // image file name
        let imageFileName = "";
        if (! selectText) {
            imageFileName = moment().format("Y-MM-DD-HH-mm-ss") + ".png";
        } else {
            imageFileName = selectText + ".png";
        }

        // image output path
        let folderPath = path.dirname(filePath);
        let folderPathFromConfig = "";
        let imagePath = "";
        let pasteImageConfig = vscode.workspace.getConfiguration('pasteImage');
        if (pasteImageConfig && pasteImageConfig.hasOwnProperty('path')) {
            folderPathFromConfig = pasteImageConfig['path'];
        }

        // generate image path
        if (path.isAbsolute(folderPathFromConfig)) {
            imagePath = path.join(folderPathFromConfig, imageFileName);
        } else {
            imagePath = path.join(folderPath, folderPathFromConfig, imageFileName);
        }

        return imagePath;
    }

    /**
     * use applescript to save image from clipboard and get file path
     */
    private static saveClipboardImageToFileAndGetPath(imagePath,cb:(imagePath:string)=>void) {
        if (!imagePath) return;

        let platform = process.platform;
        if (platform === 'win32') {
            // Windows
            const scriptPath = path.join(__dirname, '../../res/pc.ps1');
            const powershell = spawn('powershell', [
                '-noprofile', 
                '-noninteractive',
                '-nologo',
                '-sta',
                '-executionpolicy','unrestricted',
                '-windowstyle', 'hidden',
                '-file', scriptPath,
                imagePath
            ]);
            powershell.on('exit', function(code, signal) {
                // console.log('exit', code, signal);
            });
            powershell.stdout.on('data', function (data: Buffer) {
                cb(data.toString().trim());
            });
        }
        else if(platform === 'darwin'){
            // Mac
            let scriptPath = path.join(__dirname, '../../res/mac.applescript');

            let ascript = spawn('osascript', [scriptPath, imagePath]);
            ascript.on('exit', function (code, signal) {
                // console.log('exit',code,signal);
            });

            ascript.stdout.on('data', function (data:Buffer) {
                cb(data.toString().trim());
            });
        } else {
            // Linux 

            let scriptPath = path.join(__dirname, '../../res/linux.sh');
            
            let ascript = spawn('sh', [scriptPath, imagePath]);
            ascript.on('exit', function (code, signal) {
                // console.log('exit',code,signal);
            });

            ascript.stdout.on('data', function (data:Buffer) {
                let result = data.toString().trim();
                if(result == "no xclip"){
                    vscode.window.showInformationMessage('You need to install xclip command first.');
                    return;
                }
                cb(result);
            });
        }
    }

    /**
     * render the image file path dependen on file type
     * e.g. in markdown image file path will render to ![](path)
     */
    public static renderFilePath(languageId:string,docPath:string,imageFilePath:string):string{
        imageFilePath = path.relative(path.dirname(docPath),imageFilePath);

        if(languageId === 'markdown'){
            return `![](${imageFilePath})`;
        }else{
            return imageFilePath;
        }
    }
}