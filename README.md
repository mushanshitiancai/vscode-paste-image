# Paste Image

Paste image directly from clipboard to markdown(or other file)!

Support Mac/Windows/Linux!

![paste-image](https://raw.githubusercontent.com/mushanshitiancai/vscode-paste-image/master/res/vscode-paste-image.gif)

## Usage

1. capture screen to clipboard
2. Open the command palette: `Ctrl+Shift+P` (`Cmd+Shift+P` on Mac)
3. Type: "Paste Image" or you can use default keyboard binding: `Cmd+Alt+V`.
4. Image will be saved in the folder that contains current editing file
5. The relative path will be paste to current editing file 

## Format

### File name format

The image is saved in this format: "Y-MM-DD-HH-mm-ss.png".It will be configurable in future version. 

### File link format

When you editing a markdown, it will pasted as markdown image link format `![](imagePath)`, in other file, it just paste the image's path.

## Contact

If you have some any question or advice, Welcome to [issue](https://github.com/mushanshitiancai/vscode-paste-image/issues)

## TODO

- [x] support win(by @kivle)
- [x] support linux
- [ ] support use the selected text as the image name
- [ ] support config
- [ ] support config relative/absolute path
- [ ] support config image name pattern


## License

The extension and source are licensed under the [MIT license](LICENSE.txt).
