'use strict';
import * as vscode from 'vscode';
import * as path from 'path';
import {spawn} from 'child_process';
import * as moment from 'moment';
const electron = require('electron');
import * as child_process from 'child_process';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.pasteImage', () => {
        Paster.paste();
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
}

class Paster {

    public static paste() {
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
        this.saveClipboardImageToFileAndGetPath(imagePath,imagePath => {
            if(imagePath === 'no image'){
                vscode.window.showInformationMessage('There is not a image in clipboard.');
                return;
            }
            if(imagePath === 'save fail'){
                vscode.window.showInformationMessage('Save image fail.');
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

        if(process.platform !== 'darwin'){
            let scriptPath = path.join(__dirname, '../../res/mac.applescript');

            let ascript = spawn('osascript', [scriptPath, imagePath]);
            ascript.on('exit', function (code, signal) {
                // console.log('exit',code,signal);
            })

            ascript.stdout.on('data', function (data:Buffer) {
                cb(data.toString().trim());
            })
        }else{
            let electronAppPath = path.join(__dirname, '../../res/electron-app');
            var proc = child_process.spawn(electron,[electronAppPath,imagePath]);
            proc.stdout.on("data",function(data){
                cb(data.toString().trim());
            })
            proc.on("close",function(){});
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