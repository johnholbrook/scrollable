const { app, BrowserWindow, Menu } = require('electron')

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

  displayWindow.loadFile('display/display.html')
}

function createControllerWindow () {
  controllerWindow = new BrowserWindow({
    width: process.platform === "win32" ? 650 : 600,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    }
  })

  controllerWindow.loadFile('controller/controller.html')
}

const macMenuTemplate = [
  {role: "appMenu"}
];

app.whenReady().then(() => {
  if (!isDev){
    const winMenu = Menu.buildFromTemplate(isMac ? macMenuTemplate : []);
    Menu.setApplicationMenu(winMenu);
  }
  
  createDisplayWindow();
  createControllerWindow();

  controllerWindow.on('closed', function () {
    controllerWindow = null;
  });

  displayWindow.on('closed', function () {
    displayWindow = null;
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
