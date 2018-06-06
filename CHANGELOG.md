# Change Log

## 1.0.2 (June 6, 2018)

- Fix: `pasteImage.namePrefix` and `pasteImage.nameSuffix` not work when there is no text selected.

## 1.0.1 (May 31, 2018)

- Update readme

## 1.0.0 (May 31, 2018)

- Feature: Add `pasteImage.insertPattren` configuration. Support config the format of text would be pasted.
- Feature: Add `pasteImage.defaultName` configuration. Support config default image file name.
- Feature: Add `pasteImage.encodePath` configuration. Support url encode image file path.
- Feature: Add `pasteImage.namePrefix` configuration.
- Feature: Add `pasteImage.nameSuffix` configuration.

## 0.9.5 (December 16, 2017)

- Fix: Support select non-ascii text as file name

## 0.9.4 (July 7, 2017)

- Feature: Print log to "PasteImage" channel, and show in output panel.
- Fix: Paste fail when powershell not in PATH on windows. (from @ELBe7ery)

## 0.9.3 (July 5, 2017)

- Feature: Support select text as a sub path with multi new directory like `a/b/c/d/imageName` or `../a/b/c/d/imageName`
- Fix: Error when dest directory is not existed. (from @WindnBike)

## 0.9.2 (July 3, 2017)

- Improvement: Check if the dest directory is a file.

## 0.9.1 (July 3, 2017)

- Feature: `pasteImage.path` and `pasteImage.basePath` support `${currentFileName}` and `${currentFileNameWithoutExt}` variable.

## 0.9.0 (July 3, 2017)

- Feature: Add `pasteImage.basePath` configuration.
- Feature: `pasteImage.path` and `pasteImage.basePath` support `${currentFileDir}` and `${projectRoot}` variable.
- Feature: Add `pasteImage.forceUnixStyleSeparator` configuration.
- Feature: Add `pasteImage.prefix` configuration.
- Feature: Add `pasteImage.suffix` configuration.
- Feature: Support selected path as a sub path.

## 0.4.0 (July 3, 2017)

- Feature: Support AsciiDoc image markup

## 0.3.0 (December 31, 2016)

- Feature: Support config the path(absolute or relative) to save image.(@ysknkd in #4)

## 0.2.0 (November 13, 2016)

- Feature: Add linux support by xclip
- Feature: Support use the selected text as the image name

## 0.1.0 (November 12, 2016)

- Feature: Add windows support by powershell(@kivle in #2)

## 0.0.1

- Finish first publish. Only support macos.