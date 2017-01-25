'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const url = require('url');
const ipc = electron.ipcMain;

let mainWindow

function createWindow () {
    mainWindow = new BrowserWindow({
        width: 345,
        height: 110,
        // resizable: false,
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
}

app.on('ready', function(){
    createWindow();
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
    console.log('IPC-MAIN-SONG-CHANGED');
    mainWindow.webContents.send('song-changed', 'IPC-RENDERER-SONG-CHANGED');
});
