# Paste Image

Paste images directly from the clipboard to a markdown, asciidoc, or other file! Supports Mac, Windows, and Linux.

Supports configurable destination folders, file names, and paths.

![paste-image](https://raw.githubusercontent.com/mushanshitiancai/vscode-paste-image/master/res/vscode-paste-image.gif)

Enable `pasteImage.showFilePathConfirmInputBox` to modify the file path before saving:

![confirm-inputbox](https://raw.githubusercontent.com/mushanshitiancai/vscode-paste-image/master/res/confirm-inputbox.png)

## Usage

1. Capture screen to clipboard
2. Open the command palette: `Ctrl+Shift+P` (`Cmd+Shift+P` on Mac)
3. Type "Paste Image"
    > Alternatively, you can use the default keyboard shortcut:
    - Windows: `Ctrl+Alt+V`
    - Mac: `Cmd+Alt+V`

The image will will be saved, defulting to the folder containing the file currently being edited. A markdown image reference will be created with the relative path to the saved image.

## Configuration

- `pasteImage.defaultName`

    The default image file name format. Defaults to `Y-MM-DD-HH-mm-ss`.

    The value of this config will be passed to the 'format' function of the [moment javascript library](https://momentjs.com/docs/#/displaying/format/).

    Supports the use of variables, such as:

    - `${currentFileName}`: the current file name with ext.
    - `${currentFileNameWithoutExt}`: the current file name without ext.

- `pasteImage.path`

    The destination path of the image file. Defaults to `${currentFileDir}`.
    
    Supports the use of variables, such as:
    
    - `${currentFileDir}`: the path of directory that contain current editing file. 
    - `${projectRoot}`: the path of the project opened in vscode.
    - `${currentFileName}`: the current file name with ext.
    - `${currentFileNameWithoutExt}`: the current file name without ext.


- `pasteImage.basePath`

    The base path of the markdown image reference. Defaults to `${currentFileDir}`.
    
    Supports the use of variables, such as:
    
    - `${currentFileDir}`: the path of directory that contain current editing file. 
    - `${projectRoot}`: the path of the project opened in vscode.
    - `${currentFileName}`: the current file name with ext.
    - `${currentFileNameWithoutExt}`: the current file name without ext.

- `pasteImage.forceUnixStyleSeparator`

    Forces the file path separators to be unix style (/). Defaults to `true`. If set to false, the file path separators will follow the system style.

- `pasteImage.prefix`

    The string to prepend on image paths before pasting. Defaults to empty string (`""`).

- `pasteImage.suffix`

    The string to append on image paths before pasting. Defaults to empty string (`""`).

- `pasteImage.encodePath`

    Determines how the image path will be encoded before inserting to the editor. Defaults to `urlEncodeSpace`.
    
    Values inclue:

    - `none`: Does nothing, simply inserts the image path to text.
    - `urlEncode`: Url encodes the entire image path.
    - `urlEncodeSpace`: Url encodes just the space character (" " &rarr; "%20%")

- `pasteImage.namePrefix`

    The string to prepend on image file name before pasting. Defaults to empty string (`""`).

    Supports the use of variables, such as:
    
    - `${currentFileDir}`: the path of directory that contain current editing file. 
    - `${projectRoot}`: the path of the project opened in vscode.
    - `${currentFileName}`: the current file name with ext.
    - `${currentFileNameWithoutExt}`: the current file name without ext.

- `pasteImage.nameSuffix`

    The string to append on image file name before pasting. Defaults to empty string (`""`).

    Supports the use of variables, such as:
    
    - `${currentFileDir}`: the path of directory that contain current editing file. 
    - `${projectRoot}`: the path of the project opened in vscode.
    - `${currentFileName}`: the current file name with ext.
    - `${currentFileNameWithoutExt}`: the current file name without ext.

    Default is `""`.

- `pasteImage.insertPattern`

    The pattern that is used when creating the markdown image reference. Defaults to `${imageSyntaxPrefix}${imageFilePath}${imageSyntaxSuffix}`.
    
    Both the alt text and file path are configurable. For example, `![${imageFileNameWithoutExt}](${imageFilePath})` would add the file name as the alt text instead of the default (blank).
    
    Supports the use of variables, such as:

    - `${imageFilePath}`: the image file path after applying any `pasteImage.prefix`, `pasteImage.suffix`, and `pasteImage.encodePath` configurations.
    - `${imageOriginalFilePath}`: the original image file path.
    - `${imageFileName}`:  the image file name with extension.
    - `${imageFileNameWithoutExt}`: the image file name without extension.
    - `${currentFileDir}`: the path containing the file currently being edited.
    - `${projectRoot}`: the path of the project opened in vscode.
    - `${currentFileName}`: the current file name with extension.
    - `${currentFileNameWithoutExt}`: the current file name without extension.
    - `${imageSyntaxPrefix}`: in a markdown file, this would be <code>![](</code>. In an asciidoc file, this would be <code>image::</code>. In any other file this would be an empty string ("").
    - `${imageSyntaxSuffix}`: in a markdown file, this would be <code>)</code>. In an asciidoc file, this would be <code>[]</code>. In any other file this would be an empty string ("").

- `pasteImage.showFilePathConfirmInputBox`

    `boolean` determining if the confirmation input box should be shown before saving the pasted file. Defaults to `false`.

- `pasteImage.filePathConfirmInputBoxMode`

    Determines if the full path of the file should be shown in the confirmation input box, or just the file name. Defaults to `fullPath`.

    Values inclue:

    - `fullPath`: shows the full path of the file so both the path and name can be changed.
    - `onlyName`: shows only the file name.

## Example Configuration

### Use Case: My Hexo Blog
I use vscode to edit my hexo blog. The folder structure is as follows:

```
blog/source/_posts  (articles)
blog/source/img     (images)
```

I want to save all images in `blog/source/img` and reference them from the article. Because hexo generates `blog/source` as the website root, the image paths need to be of the form `/img/xxx.png`. To achieve this, I use the following pasteImage configuration in `blog/.vscode/setting.json`:

``` json
"pasteImage.path": "${projectRoot}/source/img",
"pasteImage.basePath": "${projectRoot}/source",
"pasteImage.prefix": "/"
```

### Additional Examples 

1. To save images in a separate directory:

    ``` json
    "pasteImage.path": "${projectRoot}/source/img/${currentFileNameWithoutExt}",
    "pasteImage.basePath": "${projectRoot}/source",
    "pasteImage.prefix": "/"
    ```

1. To save images with the current file name as a prefix:

    ``` json
    "pasteImage.namePrefix": "${currentFileNameWithoutExt}_",
    "pasteImage.path": "${projectRoot}/source/img",
    "pasteImage.basePath": "${projectRoot}/source",
    "pasteImage.prefix": "/"
    ```

1. To use html in markdown to reference the image:

    ``` json
    "pasteImage.insertPattern": "<img>${imageFileName}</img>"
    "pasteImage.path": "${projectRoot}/source/img",
    "pasteImage.basePath": "${projectRoot}/source",
    "pasteImage.prefix": "/"
    ```

## Contact

For questions or concerns, please visit [issues](https://github.com/mushanshitiancai/vscode-paste-image/issues).

## License

The extension and source are licensed under the [MIT license](LICENSE.txt).

## Donate

If you like this plugin, you can donate to me to support me develop it better, thank you!

PayPal:

<a href="https://www.paypal.me/mushanshitiancai"><img src="https://www.paypal.com/en_US/i/btn/btn_donate_LG.gif"></img></a>

支付宝:

![alipay](https://raw.githubusercontent.com/mushanshitiancai/vscode-paste-image/master/res/alipay.png)

微信支付:

![weixin](https://raw.githubusercontent.com/mushanshitiancai/vscode-paste-image/master/res/weixin.png)

Donator list：
- 白色咖啡
- Paul Egbert
- CallOnISS
- 亮亮
- Shahid Iqbal
