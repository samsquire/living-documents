'use strict';

const electron = require('electron');
const async = require('async');
const fs = require('fs');
const shelljs = require('shelljs');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;



// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

var shell = require('shelljs');

shell.cd();
var livingDocumentsHome = '.livingdocuments';
shell.mkdir(livingDocumentsHome);
shell.cd(livingDocumentsHome);
var repo = "git@github.com:samsquire/living-documents-library.git";
var folder = "living-documents-library";

if (shell.test('-d', folder)) {
  shell.cd(folder);
  shell.exec('git pull', function (code, stdout, stderr) {
    if (code === 0) {
      console.log("library updates downloaded");
    } else {
      console.log("library failed to update");
    }
 });
} else { 
  shell.exec('git clone ' + repo, function (code, stdout, stderr) { 
    if (code === 0) { 
      console.log("library downloaded");
    } else {
      console.log("library failed download");
    }

  });
}

const ipcMain = require('electron').ipcMain;
ipcMain.on('get available repository knowledgebases', function(event, arg) {

  var available = shell.find('~/.livingdocuments/living-documents-library/')
      .filter(
  function (item) {
    return item.match(/livingdocument\.json/);
  });
  console.log(available);

  async.map(available, function (item, finishedItem) {
    console.log(item);  
    fs.readFile(item, function (err, data) {
      if (!err) {
        var metadata = JSON.parse(data);
        finishedItem(null, metadata);
        
      } else {
        finishedItem(err);
      }

    });

  }, function (err, results) {
    event.sender.send('available knowledgebases', results);
  });  

});

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600});


  console.log(__dirname);

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/electron.html');

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
