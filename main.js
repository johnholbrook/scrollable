const { app, BrowserWindow, Menu, ipcMain } = require('electron')

// start the server
require("./server/server.js")

global.displayWindow = null;
global.controllerWindow = null

var isDev = !app.isPackaged;
var isMac = process.platform === "darwin";

function createDisplayWindow () {
  displayWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    }
  })

  displayWindow.loadURL("http://localhost:8080");
}

function createControllerWindow () {
  controllerWindow = new BrowserWindow({
    width: 650,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    }
  })

  controllerWindow.loadFile('controller/controller.html')
}

const macMenuTemplate = [
  {role: "appMenu"},
  {role: "editMenu"}
];

app.whenReady().then(() => {
  if (!isDev){
    const winMenu = Menu.buildFromTemplate(isMac ? macMenuTemplate : []);
    Menu.setApplicationMenu(winMenu);
  }
  
  // createDisplayWindow();
  createControllerWindow();

  controllerWindow.on('closed', function () {
    controllerWindow = null;
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (controllerWindow === null) createControllerWindow();
  if (displayWindow === null) createDisplayWindow();
})

ipcMain.on("launch-disp-window", () => {
  if (displayWindow == null){
    createDisplayWindow();

    displayWindow.on('closed', function () {
      displayWindow = null;
    });
  }
});