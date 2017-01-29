const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const url = require('url');
const ipc = electron.ipcMain;
const notifier = require('node-notifier');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 180, // used to be 345
        height: 50, // used to be 110
        // resizable: false, // TODO: Set true when ready.
        frame: false,
        alwaysOnTop: true,
        // background color of the page, this prevents any white flickering
        backgroundColor: "#111",
        // Don't show the window until it's ready, this prevents any white flickering
        show: false
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'app/index.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Show window when page is ready
    mainWindow.once('ready-to-show', function () {
        mainWindow.show()
    })

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.once('ready', createWindow);

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

ipc.on('resize-player', function(){
    // mainWindow.setSize(180, 50, true);
});
