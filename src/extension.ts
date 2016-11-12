'use strict';
import * as vscode from 'vscode';
import * as path from 'path';
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
        let platform = process.platform;        
        if(platform != 'win32' && platform != 'darwin'){
            vscode.window.showInformationMessage('Not support ' + platform + ' for now.');
            return;
        }

        let editor = vscode.window.activeTextEditor;
        if (!editor) return;

        let fileUri = editor.document.uri;
        if (!fileUri) return;
        if (fileUri.scheme === 'untitled') {
            vscode.window.showInformationMessage('Before paste image, you need to save current edit file first.');
        }

        let filePath = fileUri.fsPath;
        let imagePath = this.getImagePath(filePath);

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
    }

    public static getImagePath(filePath): string {
        let folderPath = path.dirname(filePath);
        let imageFileName = moment().format("Y-MM-DD-HH-mm-ss") + ".png";
        let imageFilePath = path.join(folderPath, imageFileName);

        return imageFilePath;
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