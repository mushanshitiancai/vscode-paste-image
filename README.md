# Paste Image

Paste image directly from clipboard to markdown/asciidoc(or other file)!

**Support Mac/Windows/Linux!** And support config destination folder.

![paste-image](https://raw.githubusercontent.com/mushanshitiancai/vscode-paste-image/master/res/vscode-paste-image.gif)

## Usage

1. capture screen to clipboard
2. Open the command palette: `Ctrl+Shift+P` (`Cmd+Shift+P` on Mac)
3. Type: "Paste Image" or you can use default keyboard binding: `Ctrl+Alt+V` (`Cmd+Alt+V` on Mac).
4. Image will be saved in the folder that contains current editing file
5. The relative path will be paste to current editing file 

## Config

- `pasteImage.path`

    The destination to save image file.
    
    You can use variable `${currentFileDir}`, `${projectRoot}`, `${currentFileName}` and `${currentFileNameWithoutExt}`. 
    
    - `${currentFileDir}` will be replace by the path of directory that contain current editing file. 
    - `${projectRoot}` will be replace by path of the project opened in vscode.
    - `${currentFileName}` will be replace by current file name with ext.
    - `${currentFileNameWithoutExt}` will be replace by current file name without ext.

    Default value is `${currentFileDir}`.

- `pasteImage.basePath`

    The base path of image url.
    
    You can use variable `${currentFileDir}`, `${projectRoot}`, `${currentFileName}` and `${currentFileNameWithoutExt}`. 
    
    - `${currentFileDir}` will be replace by the path of directory that contain current editing file. 
    - `${projectRoot}` will be replace by path of the project opened in vscode.
    - `${currentFileName}` will be replace by current file name with ext.
    - `${currentFileNameWithoutExt}` will be replace by current file name without ext.

    Default value is `${currentFileDir}`.

- `pasteImage.forceUnixStyleSeparator`

    Force set the file separator styel to unix style. If set false, separator styel will follow the system style. 
    
    Default is `true`.

- `pasteImage.prefix`

    The string prepend to the resolved image path before paste.

    Default is `""`.

- `pasteImage.suffix`

    The string append to the resolved image path before paste.

    Default is `""`.

## Config Example

I use vscode to edit my hexo blog. The folder struct like this:

```
blog/source/_posts  (articles)
blog/source/img     (images)
```

I want to save all image in `blog/source/img`, and insert image url to article. And hexo will generate `blog/source/` as the website root, so the image url shoud be like `/img/xxx.png`. So I can config pasteImage in `blog/.vscode/setting.json` like this:

```
"pasteImage.path": "${projectRoot}/source/img",
"pasteImage.basePath": "${projectRoot}/source",
"pasteImage.forceUnixStyleSeparator": true,
"pasteImage.prefix": "/"
```

## Format

### File name format

If you selected some text in editor, then extension will use it as the image file name. **The selected text can be a sub path like `subFolder/subFolder2/nameYouWant`.**

If not the image will be saved in this format: "Y-MM-DD-HH-mm-ss.png". 

### File link format

When you editing a markdown, it will pasted as markdown image link format `![](imagePath)`.

When you editing a asciidoc, it will pasted as asciidoc image link format `image::imagePath[]`.

In other file, it just paste the image's path.

## Contact

If you have some any question or advice, Welcome to [issue](https://github.com/mushanshitiancai/vscode-paste-image/issues)

## TODO

- [x] support win (by @kivle)
- [x] support linux
- [x] support use the selected text as the image name
- [x] support config (@ysknkd in #4)
- [x] support config relative/absolute path (@ysknkd in #4)
- [x] support asciidoc
- [x] supoort use variable ${projectRoot} and ${currentFileDir} in config
- [x] support config basePath
- [x] support config forceUnixStyleSeparator
- [x] support config prefix
- [x] support config suffix
- [x] supoort use variable ${currentFileName} and ${currentFileNameWithoutExt} in config
- [x] support check if the dest directory is a file
- [x] support select text as a sub path with multi new directory like `a/b/c/d/imageName` or `../a/b/c/d/imageName`
- [ ] support config default image name pattern

## License

The extension and source are licensed under the [MIT license](LICENSE.txt).

## Donate

If you like this plugin, you can donate to me to support me develop it better, thank you!

PayPal:

<form action="https://www.paypal.me/mushanshitiancai" method="get">
<input type="image" src="https://www.paypal.com/en_US/i/btn/btn_donate_LG.gif" border="0"  style="border:0px;background:none;" name="submit" alt="PayPal - The safer, easier way to pay online">
</form>

AliPay:

![alipay](https://raw.githubusercontent.com/mushanshitiancai/vscode-paste-image/master/res/alipay.png)
