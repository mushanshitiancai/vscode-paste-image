'use strict';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as fse from 'fs-extra';
import { spawn } from 'child_process';
import * as moment from 'moment';
import * as upath from 'upath';
import { BlobServiceClient } from '@azure/storage-blob';
import to from 'await-to-js'

class Logger {
    static channel: vscode.OutputChannel;

    static log(message: any) {
        if (this.channel) {
            let time = moment().format("MM-DD HH:mm:ss");
            this.channel.appendLine(`[${time}] ${message}`);
        }
    }

    static showInformationMessage(message: string, ...items: string[]): Thenable<string | undefined> {
        this.log(message);
        return vscode.window.showInformationMessage(message, ...items);
    }

    static showErrorMessage(message: string, ...items: string[]): Thenable<string | undefined> {
        this.log(message);
        return vscode.window.showErrorMessage(message, ...items);
    }
}

export function activate(context: vscode.ExtensionContext) {
    Logger.channel = vscode.window.createOutputChannel("PasteImage")
    context.subscriptions.push(Logger.channel);

    Logger.log('Congratulations, your extension "vscode-paste-image" is now active!');

    let disposable = vscode.commands.registerCommand('extension.pasteImage', () => {
        try {
            Logger.showErrorMessage('qqq');

            Paster.paste();
        } catch (e: any) {
            Logger.showErrorMessage(e)
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
}

class Paster {
    static PATH_VARIABLE_CURRNET_FILE_DIR = /\$\{currentFileDir\}/g;
    static PATH_VARIABLE_PROJECT_ROOT = /\$\{projectRoot\}/g;
    static PATH_VARIABLE_CURRNET_FILE_NAME = /\$\{currentFileName\}/g;
    static PATH_VARIABLE_CURRNET_FILE_NAME_WITHOUT_EXT = /\$\{currentFileNameWithoutExt\}/g;

    static PATH_VARIABLE_IMAGE_FILE_PATH = /\$\{imageFilePath\}/g;
    static PATH_VARIABLE_IMAGE_ORIGINAL_FILE_PATH = /\$\{imageOriginalFilePath\}/g;
    static PATH_VARIABLE_IMAGE_FILE_NAME = /\$\{imageFileName\}/g;
    static PATH_VARIABLE_IMAGE_FILE_NAME_WITHOUT_EXT = /\$\{imageFileNameWithoutExt\}/g;
    static PATH_VARIABLE_IMAGE_SYNTAX_PREFIX = /\$\{imageSyntaxPrefix\}/g;
    static PATH_VARIABLE_IMAGE_SYNTAX_SUFFIX = /\$\{imageSyntaxSuffix\}/g;

    static FILE_PATH_CONFIRM_INPUTBOX_MODE_ONLY_NAME = "onlyName";
    static FILE_PATH_CONFIRM_INPUTBOX_MODE_PULL_PATH = "fullPath";

    static defaultNameConfig: string;
    static folderPathConfig: string;
    static basePathConfig: string;
    static prefixConfig: string;
    static suffixConfig: string;
    static forceUnixStyleSeparatorConfig: boolean;
    static encodePathConfig: string;
    static namePrefixConfig: string;
    static nameSuffixConfig: string;
    static insertPatternConfig: string;
    static showFilePathConfirmInputBox: boolean;
    static filePathConfirmInputBoxMode: string;

    static azureIsUploadStorage: boolean;
    static azureStorageConnectionString: string;
    static azureStorageContainerName: string;

    public static paste() {
        Logger.showErrorMessage('eee');
		vscode.window.showInformationMessage('qqqeee');

        // get current edit file path
        let editor = vscode.window.activeTextEditor;
        if (!editor) return;

        let fileUri = editor.document.uri;
        if (!fileUri) return;
        if (fileUri.scheme === 'untitled') {
            Logger.showInformationMessage('Before pasting the image, you need to save current file first.');
            return;
        }
        let filePath = fileUri.fsPath;
        let folderPath = path.dirname(filePath);
        let projectPath = vscode.workspace.rootPath;

        // get selection as image file name, need check
        var selection = editor.selection;
        var selectText = editor.document.getText(selection);
        if (selectText && /[\\:*?<>|]/.test(selectText)) {
            Logger.showInformationMessage('Your selection is not a valid filename!');
            return;
        }

        // load config pasteImage.defaultName
        this.defaultNameConfig = vscode.workspace.getConfiguration('pasteImage')['defaultName'];
        if (!this.defaultNameConfig) {
            this.defaultNameConfig = "Y-MM-DD-HH-mm-ss"
        }

        // load config pasteImage.path
        this.folderPathConfig = vscode.workspace.getConfiguration('pasteImage')['path'];
        if (!this.folderPathConfig) {
            this.folderPathConfig = "${currentFileDir}";
        }
        if (this.folderPathConfig.length !== this.folderPathConfig.trim().length) {
            Logger.showErrorMessage(`The config pasteImage.path = '${this.folderPathConfig}' is invalid. please check your config.`);
            return;
        }
        // load config pasteImage.basePath
        this.basePathConfig = vscode.workspace.getConfiguration('pasteImage')['basePath'];
        if (!this.basePathConfig) {
            this.basePathConfig = "";
        }
        if (this.basePathConfig.length !== this.basePathConfig.trim().length) {
            Logger.showErrorMessage(`The config pasteImage.path = '${this.basePathConfig}' is invalid. please check your config.`);
            return;
        }

        // load azure config 
        this.azureIsUploadStorage = vscode.workspace.getConfiguration('pasteImage')['azureIsUploadStorage'];
        this.azureStorageConnectionString = vscode.workspace.getConfiguration('pasteImage')['azureStorageConnectionString'];
        this.azureStorageContainerName = vscode.workspace.getConfiguration('pasteImage')['azureStorageContainerName'];

        // if (this.azureIsUploadStorage === true) {
        //     if (!this.azureStorageContainerName || this.azureStorageContainerName.length !== this.azureStorageContainerName.trim().length) {
        //         Logger.showErrorMessage(`The config pasteImage.azureStorageContainerName = '${this.azureStorageContainerName}' is invalid. please check your config.`);
        //         return;
        //     }
        //     if (!this.azureStorageConnectionString || this.azureStorageConnectionString.length !== this.azureStorageConnectionString.trim().length) {
        //         Logger.showErrorMessage(`The config pasteImage.azureStorageConnectionString = '${this.azureStorageConnectionString}' is invalid. please check your config.`);
        //         return;
        //     }
        // }

        // load other config
        this.prefixConfig = vscode.workspace.getConfiguration('pasteImage')['prefix'];
        this.suffixConfig = vscode.workspace.getConfiguration('pasteImage')['suffix'];
        this.forceUnixStyleSeparatorConfig = vscode.workspace.getConfiguration('pasteImage')['forceUnixStyleSeparator'];
        this.forceUnixStyleSeparatorConfig = !!this.forceUnixStyleSeparatorConfig;
        this.encodePathConfig = vscode.workspace.getConfiguration('pasteImage')['encodePath'];
        this.namePrefixConfig = vscode.workspace.getConfiguration('pasteImage')['namePrefix'];
        this.nameSuffixConfig = vscode.workspace.getConfiguration('pasteImage')['nameSuffix'];
        this.insertPatternConfig = vscode.workspace.getConfiguration('pasteImage')['insertPattern'];
        this.showFilePathConfirmInputBox = vscode.workspace.getConfiguration('pasteImage')['showFilePathConfirmInputBox'] || false;
        this.filePathConfirmInputBoxMode = vscode.workspace.getConfiguration('pasteImage')['filePathConfirmInputBoxMode'];

        // replace variable in config
        this.defaultNameConfig = this.replacePathVariable(this.defaultNameConfig, projectPath as string, filePath, (x) => `[${x}]`);
        this.folderPathConfig = this.replacePathVariable(this.folderPathConfig, projectPath as string, filePath);
        this.basePathConfig = this.replacePathVariable(this.basePathConfig, projectPath as string, filePath);
        this.namePrefixConfig = this.replacePathVariable(this.namePrefixConfig, projectPath as string, filePath);
        this.nameSuffixConfig = this.replacePathVariable(this.nameSuffixConfig, projectPath as string, filePath);
        this.insertPatternConfig = this.replacePathVariable(this.insertPatternConfig, projectPath as string, filePath);

        // "this" is lost when coming back from the callback, thus we need to store it here.
        const instance = this;
        this.getImagePath(filePath, selectText, this.folderPathConfig, this.showFilePathConfirmInputBox, this.filePathConfirmInputBoxMode, function (err, imagePath) {
            if(instance.azureIsUploadStorage === true)
            {
                AzureStorage_BlobUpload.Upload(instance.azureStorageConnectionString, instance.azureStorageContainerName);
                return;
            }
return;
            try {
                // is the file existed?
                let existed = fs.existsSync(imagePath);
                if (existed) {
                    Logger.showInformationMessage(`File ${imagePath} existed.Would you want to replace?`, 'Replace', 'Cancel').then(choose => {
                        if (choose != 'Replace') return;

                        instance.saveAndPaste(editor as vscode.TextEditor, imagePath);
                    });
                } else {
                    instance.saveAndPaste(editor as vscode.TextEditor, imagePath);
                }
            } catch (err: any) {
                Logger.showErrorMessage(`fs.existsSync(${imagePath}) fail. message=${err.message}`);
                return;
            }
        });
    }

    public static saveAndPaste(editor: vscode.TextEditor, imagePath: string) {
        this.createImageDirWithImagePath(imagePath).then(imagePath => {
            // save image and insert to current edit file
            this.saveClipboardImageToFileAndGetPath(imagePath as string, (imagePath, imagePathReturnByScript) => {
                if (!imagePathReturnByScript) return;
                if (imagePathReturnByScript === 'no image') {
                    Logger.showInformationMessage('There is not an image in the clipboard.');
                    return;
                }
                imagePath = this.renderFilePath(editor.document.languageId, this.basePathConfig, imagePath, this.forceUnixStyleSeparatorConfig, this.prefixConfig, this.suffixConfig);

                editor.edit(edit => {
                    let current = editor.selection;

                    if (current.isEmpty) {
                        edit.insert(current.start, imagePath);
                    } else {
                        edit.replace(current, imagePath);
                    }
                });
            });
        }).catch(err => {
            if (err instanceof PluginError) {
                Logger.showErrorMessage(err.message as string);
            } else {
                Logger.showErrorMessage(`Failed make folder. message=${err.message}`);
            }
            return;
        });
    }

    public static getImagePath(filePath: string, selectText: string, folderPathFromConfig: string,
        showFilePathConfirmInputBox: boolean, filePathConfirmInputBoxMode: string,
        callback: (err: any, imagePath: string) => void) {
        // image file name
        let imageFileName = "";
        if (!selectText) {
            imageFileName = this.namePrefixConfig + moment().format(this.defaultNameConfig) + this.nameSuffixConfig + ".png";
        } else {
            imageFileName = this.namePrefixConfig + selectText + this.nameSuffixConfig + ".png";
        }

        let filePathOrName;
        if (filePathConfirmInputBoxMode == Paster.FILE_PATH_CONFIRM_INPUTBOX_MODE_PULL_PATH) {
            filePathOrName = makeImagePath(imageFileName);
        } else {
            filePathOrName = imageFileName;
        }

        if (showFilePathConfirmInputBox) {
            vscode.window.showInputBox({
                prompt: 'Please specify the filename of the image.',
                value: filePathOrName
            }).then((result) => {
                if (result) {
                    if (!result.endsWith('.png')) result += '.png';

                    if (filePathConfirmInputBoxMode == Paster.FILE_PATH_CONFIRM_INPUTBOX_MODE_ONLY_NAME) {
                        result = makeImagePath(result);
                    }

                    callback(null, result);
                }
                return;
            });
        } else {
            callback(null, makeImagePath(imageFileName));
            return;
        }

        function makeImagePath(fileName: string) {
            // image output path
            let folderPath = path.dirname(filePath);
            let imagePath = "";

            // generate image path
            if (path.isAbsolute(folderPathFromConfig)) {
                imagePath = path.join(folderPathFromConfig, fileName);
            } else {
                imagePath = path.join(folderPath, folderPathFromConfig, fileName);
            }

            return imagePath;
        }
    }

    /**
     * create directory for image when directory does not exist
     */
    private static createImageDirWithImagePath(imagePath: string) {
        return new Promise((resolve, reject) => {
            let imageDir = path.dirname(imagePath);

            fs.stat(imageDir, (err, stats) => {
                if (err == null) {
                    if (stats.isDirectory()) {
                        resolve(imagePath);
                    } else {
                        reject(new PluginError(`The image dest directory '${imageDir}' is a file. Please check your 'pasteImage.path' config.`))
                    }
                } else if (err.code == "ENOENT") {
                    fse.ensureDir(imageDir, (err: any) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(imagePath);
                    });
                } else {
                    reject(err);
                }
            });
        });
    }

    /**
     * use applescript to save image from clipboard and get file path
     */
    private static saveClipboardImageToFileAndGetPath(imagePath: string, cb: (imagePath: string, imagePathFromScript: string) => void) {
        if (!imagePath) return;

        let platform = process.platform;
        if (platform === 'win32') {
            // Windows
            const scriptPath = path.join(__dirname, '../../res/pc.ps1');

            let command = "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe";
            let powershellExisted = fs.existsSync(command)
            if (!powershellExisted) {
                command = "powershell"
            }

            const powershell = spawn(command, [
                '-noprofile',
                '-noninteractive',
                '-nologo',
                '-sta',
                '-executionpolicy', 'unrestricted',
                '-windowstyle', 'hidden',
                '-file', scriptPath,
                imagePath
            ]);
            powershell.on('error', function (e: any) {
                if (e.code == "ENOENT") {
                    Logger.showErrorMessage(`The powershell command is not in you PATH environment variables. Please add it and retry.`);
                } else {
                    Logger.showErrorMessage(e);
                }
            });
            powershell.on('exit', function (code, signal) {
                // console.log('exit', code, signal);
            });
            powershell.stdout.on('data', function (data: Buffer) {
                debugger
                cb(imagePath, data.toString().trim());
                Logger.showErrorMessage(`stdout: ${data}`);
            });
        }
        else if (platform === 'darwin') {
            // Mac
            let scriptPath = path.join(__dirname, '../../res/mac.applescript');

            let ascript = spawn('osascript', [scriptPath, imagePath]);
            ascript.on('error', function (e: any) {
                Logger.showErrorMessage(e);
            });
            ascript.on('exit', function (code, signal) {
                // console.log('exit',code,signal);
            });
            ascript.stdout.on('data', function (data: Buffer) {
                cb(imagePath, data.toString().trim());
            });
        } else {
            // Linux 

            let scriptPath = path.join(__dirname, '../../res/linux.sh');

            let ascript = spawn('sh', [scriptPath, imagePath]);
            ascript.on('error', function (e: any) {
                Logger.showErrorMessage(e);
            });
            ascript.on('exit', function (code, signal) {
                // console.log('exit',code,signal);
            });
            ascript.stdout.on('data', function (data: Buffer) {
                let result = data.toString().trim();
                if (result == "no xclip") {
                    Logger.showInformationMessage('You need to install xclip command first.');
                    return;
                }
                cb(imagePath, result);
            });
        }
    }

    /**
     * render the image file path dependen on file type
     * e.g. in markdown image file path will render to ![](path)
     */
    public static renderFilePath(languageId: string, basePath: string, imageFilePath: string, forceUnixStyleSeparator: boolean, prefix: string, suffix: string): string {
        if (basePath) {
            imageFilePath = path.relative(basePath, imageFilePath);
        }

        if (forceUnixStyleSeparator) {
            imageFilePath = upath.normalize(imageFilePath);
        }

        let originalImagePath = imageFilePath;
        let ext = path.extname(originalImagePath);
        let fileName = path.basename(originalImagePath);
        let fileNameWithoutExt = path.basename(originalImagePath, ext);

        imageFilePath = `${prefix}${imageFilePath}${suffix}`;

        if (this.encodePathConfig == "urlEncode") {
            imageFilePath = encodeURI(imageFilePath)
        } else if (this.encodePathConfig == "urlEncodeSpace") {
            imageFilePath = imageFilePath.replace(/ /g, "%20");
        }

        let imageSyntaxPrefix = "";
        let imageSyntaxSuffix = ""
        switch (languageId) {
            case "markdown":
                imageSyntaxPrefix = `![](`
                imageSyntaxSuffix = `)`
                break;
            case "asciidoc":
                imageSyntaxPrefix = `image::`
                imageSyntaxSuffix = `[]`
                break;
        }

        let result = this.insertPatternConfig
        result = result.replace(this.PATH_VARIABLE_IMAGE_SYNTAX_PREFIX, imageSyntaxPrefix);
        result = result.replace(this.PATH_VARIABLE_IMAGE_SYNTAX_SUFFIX, imageSyntaxSuffix);

        result = result.replace(this.PATH_VARIABLE_IMAGE_FILE_PATH, imageFilePath);
        result = result.replace(this.PATH_VARIABLE_IMAGE_ORIGINAL_FILE_PATH, originalImagePath);
        result = result.replace(this.PATH_VARIABLE_IMAGE_FILE_NAME, fileName);
        result = result.replace(this.PATH_VARIABLE_IMAGE_FILE_NAME_WITHOUT_EXT, fileNameWithoutExt);

        return result;
    }

    public static replacePathVariable(pathStr: string, projectRoot: string, curFilePath: string, postFunction: (arg0: string) => string = (x) => x): string {
        let currentFileDir = path.dirname(curFilePath);
        let ext = path.extname(curFilePath);
        let fileName = path.basename(curFilePath);
        let fileNameWithoutExt = path.basename(curFilePath, ext);

        pathStr = pathStr.replace(this.PATH_VARIABLE_PROJECT_ROOT, postFunction(projectRoot));
        pathStr = pathStr.replace(this.PATH_VARIABLE_CURRNET_FILE_DIR, postFunction(currentFileDir));
        pathStr = pathStr.replace(this.PATH_VARIABLE_CURRNET_FILE_NAME, postFunction(fileName));
        pathStr = pathStr.replace(this.PATH_VARIABLE_CURRNET_FILE_NAME_WITHOUT_EXT, postFunction(fileNameWithoutExt));
        return pathStr;
    }
}

class PluginError {
    constructor(public message?: string) {
    }
}

class AzureStorage_BlobUpload {

    public static async Upload(azure_Storage_Connection_String: string, containerName: string) {

        containerName = containerName.toLowerCase();
        const blobServiceClient = BlobServiceClient.fromConnectionString(azure_Storage_Connection_String);
        const container = blobServiceClient.getContainerClient(containerName);

        let [existContainerError, existContainerResult] = await to(container.exists());

        if (existContainerResult !== true) {
            let [createContainerError, createContainerResult] = await to(blobServiceClient.createContainer(containerName));

            if (createContainerError) {
                Logger.showErrorMessage('建立 Azure Container發生錯誤，Container名稱只可包含小寫字母、數字及連字號，且開頭必須是字母或數字。每個連字號前後都必須為非連字號的字元。名稱長度必須介於 3 到 63 個字元之間。');
                return;
            }
        }


        // List the blob(s) in the container.
        // for await (const blob of containerClient.listBlobsFlat()) {
        // 	console.log('\t', blob.name);
        // }
    }

}