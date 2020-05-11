# Paste Image

Paste image directly from clipboard to markdown/asciidoc(or other file)!

**Support Mac/Windows/Linux!** And support config destination folder.

![paste-image](https://raw.githubusercontent.com/mushanshitiancai/vscode-paste-image/master/res/vscode-paste-image.gif)

Now you can enable `pasteImage.showFilePathConfirmInputBox` to modify file path before save:

![confirm-inputbox](https://raw.githubusercontent.com/mushanshitiancai/vscode-paste-image/master/res/confirm-inputbox.png)

## Usage

1. capture screen to clipboard
2. Open the command palette: `Ctrl+Shift+P` (`Cmd+Shift+P` on Mac)
3. Type: "Paste Image" or you can use default keyboard binding: `Ctrl+Alt+V` (`Cmd+Alt+V` on Mac).
4. Image will be saved in the folder that contains current editing file
5. The relative path will be paste to current editing file 

## Config

- `pasteImage.defaultName`

    The default image file name.

    The value of this config will be pass to the 'format' function of moment library(a js time manipulation library), you can read document https://momentjs.com/docs/#/displaying/format/ for advanced usage.

    And you can use variable:

    - `${currentFileName}`: the current file name with ext.
    - `${currentFileNameWithoutExt}`: the current file name without ext.

    Default value is `Y-MM-DD-HH-mm-ss`.

- `pasteImage.path`

    The destination to save image file.
    
    You can use variable:
    
    - `${currentFileDir}`: the path of directory that contain current editing file. 
    - `${projectRoot}`: the path of the project opened in vscode.
    - `${currentFileName}`: the current file name with ext.
    - `${currentFileNameWithoutExt}`: the current file name without ext.

    Default value is `${currentFileDir}`.

- `pasteImage.basePath`

    The base path of image url.
    
    You can use variable:
    
    - `${currentFileDir}`: the path of directory that contain current editing file. 
    - `${projectRoot}`: the path of the project opened in vscode.
    - `${currentFileName}`: the current file name with ext.
    - `${currentFileNameWithoutExt}`: the current file name without ext.

    Default value is `${currentFileDir}`.

- `pasteImage.forceUnixStyleSeparator`

    Force set the file separator style to unix style. If set false, separator style will follow the system style. 
    
    Default is `true`.

- `pasteImage.prefix`

    The string prepend to the resolved image path before paste.

    Default is `""`.

- `pasteImage.suffix`

    The string append to the resolved image path before paste.

    Default is `""`.

- `pasteImage.encodePath`

    How to encode image path before insert to editor. Support options:

    - `none`: do nothing, just insert image path to text
    - `urlEncode`: url encode whole image path
    - `urlEncodeSpace`: url encode only space character(space to %20)

    Default is `urlEncodeSpace`.

- `pasteImage.namePrefix`

    The string prepend to the image file name.

    You can use variable:
    
    - `${currentFileDir}`: the path of directory that contain current editing file. 
    - `${projectRoot}`: the path of the project opened in vscode.
    - `${currentFileName}`: the current file name with ext.
    - `${currentFileNameWithoutExt}`: the current file name without ext.

    Default is `""`.

- `pasteImage.nameSuffix`

    The string append to the image name.

    You can use variable:
    
    - `${currentFileDir}`: the path of directory that contain current editing file. 
    - `${projectRoot}`: the path of the project opened in vscode.
    - `${currentFileName}`: the current file name with ext.
    - `${currentFileNameWithoutExt}`: the current file name without ext.

    Default is `""`.

- `pasteImage.insertPattern`

    The pattern of string that would be pasted to text.
    
    You can configure both the alt text and the file path.
    For example, `![${imageFileNameWithoutExt}](${imageFilePath})` would add the file name as the alt text instead of the default (blank).
    
    You can use the following variables:

    - `${imageFilePath}`: the image file path, with `pasteImage.prefix`, `pasteImage.suffix`, and url encoded.
    - `${imageOriginalFilePath}`: the image file path.
    - `${imageFileName}`:  the image file name with ext.
    - `${imageFileNameWithoutExt}`: the image file name without ext.
    - `${currentFileDir}`: the path of directory that contain current editing file. 
    - `${projectRoot}`: the path of the project opened in vscode.
    - `${currentFileName}`: the current file name with ext.
    - `${currentFileNameWithoutExt}`: the current file name without ext.
    - `${imageSyntaxPrefix}`: in markdown file it would be <code>![](</code>, in asciidoc file it would be <code>image::</code>, in other file it would be empty string
    - `${imageSyntaxSuffix}`: in markdown file it would be <code>)</code>, in asciidoc file it would be <code>[]</code>, in other file it would be empty string

    Default is `${imageSyntaxPrefix}${imageFilePath}${imageSyntaxSuffix}`.

- `pasteImage.showFilePathConfirmInputBox`

    Enabling this `boolean` setting will make Paste Image ask you to confirm the file path(or file name). This is useful if you want to change the file path of the image you are currently pasting. Default is `false`.

- `pasteImage.filePathConfirmInputBoxMode`

    - `fullPath`: show full path in inputBox, so you can change the path or name. Default value.
    - `onlyName`: show only file name in inputBox, so it's easy to change name.

## Config Example

I use vscode to edit my hexo blog. The folder struct like this:

```
blog/source/_posts  (articles)
blog/source/img     (images)
```

I want to save all image in `blog/source/img`, and insert image url to article. And hexo will generate `blog/source/` as the website root, so the image url should be like `/img/xxx.png`. So I can config pasteImage in `blog/.vscode/setting.json` like this:

```
"pasteImage.path": "${projectRoot}/source/img",
"pasteImage.basePath": "${projectRoot}/source",
"pasteImage.forceUnixStyleSeparator": true,
"pasteImage.prefix": "/"
```

If you want to save image in separate directory:

```
"pasteImage.path": "${projectRoot}/source/img/${currentFileNameWithoutExt}",
"pasteImage.basePath": "${projectRoot}/source",
"pasteImage.forceUnixStyleSeparator": true,
"pasteImage.prefix": "/"
```

If you want to save image with article name as prefix:

```
"pasteImage.namePrefix": "${currentFileNameWithoutExt}_",
"pasteImage.path": "${projectRoot}/source/img",
"pasteImage.basePath": "${projectRoot}/source",
"pasteImage.forceUnixStyleSeparator": true,
"pasteImage.prefix": "/"
```

If you want to use html in markdown:

```
"pasteImage.insertPattern": "<img>${imageFileName}</img>"
"pasteImage.path": "${projectRoot}/source/img",
"pasteImage.basePath": "${projectRoot}/source",
"pasteImage.forceUnixStyleSeparator": true,
"pasteImage.prefix": "/"
```

## Format

### File name format

If you selected some text in editor, then extension will use it as the image file name. **The selected text can be a sub path like `subFolder/subFolder2/nameYouWant`.**

If not the image will be saved in this format: "Y-MM-DD-HH-mm-ss.png". You can config default image file name by `pasteImage.defaultName`.

### File link format

When you editing a markdown, it will pasted as markdown image link format `![](imagePath)`.

When you editing a asciidoc, it will pasted as asciidoc image link format `image::imagePath[]`.

In other file, it just paste the image's path.

Now you can use configuration `pasteImage.insertPattern` to config the format of file link and the alt text.

## Contact

If you have some any question or advice, Welcome to [issue](https://github.com/mushanshitiancai/vscode-paste-image/issues)

## TODO

- [x] support win (by @kivle)
- [x] support linux
- [x] support use the selected text as the image name
- [x] support config (@ysknkd in #4)
- [x] support config relative/absolute path (@ysknkd in #4)
- [x] support asciidoc
- [x] support use variable ${projectRoot} and ${currentFileDir} in config
- [x] support config basePath
- [x] support config forceUnixStyleSeparator
- [x] support config prefix
- [x] support config suffix
- [x] support use variable ${currentFileName} and ${currentFileNameWithoutExt} in config
- [x] support check if the dest directory is a file
- [x] support select text as a sub path with multi new directory like `a/b/c/d/imageName` or `../a/b/c/d/imageName`
- [x] support config default image name pattern
- [x] support config the text format
- [x] support file path confirm box (by @DonMartin76)

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
