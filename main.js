const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const url = require('url');
const ipc = electron.ipcMain;
const notifier = require('node-notifier');

let mainWindow;

app.on('ready', function() {
    mainWindow = new BrowserWindow({
        width: 345,
        height: 110,
        // resizable: false, // TODO: Set true when ready.
        frame: false,
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'app/index.html'),
        protocol: 'file:',
        slashes: true
    }));

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

// IPC Listeners.
ipc.on('song-changed', function(event, args){
    var albumName = args.body.album.name;
    var songName = args.body.name;
    var artistName = args.body.artists[0].name;
    var albumCoverUrl = args.body.album.images[0].url;

    notifier.notify({
        title: songName,
        message: artistName + ' - ' + albumName,
        // icon: albumCoverUrl, // TODO: Add app icon later.
        contentImage: albumCoverUrl
    });
});
