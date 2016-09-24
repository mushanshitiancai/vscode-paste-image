const {app, clipboard, BrowserWindow} = require('electron')
const fs = require("fs");

app.on('ready', saveClipboard)

function saveClipboard(){
    var imagePath = process.argv[2];

    var image = clipboard.readImage();
    if(!image || image.isEmpty()) 
        return quitWithResult("no image");
    image = image.toPNG();

    fs.writeFile(imagePath,image,function(err){
        if(err){
            quitWithResult("save fail");
        }else{
            quitWithResult(imagePath);
        }
    });
}

function quitWithResult(msg){
    console.log(msg);
    app.quit();
}