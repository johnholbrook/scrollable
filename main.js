const { app, BrowserWindow } = require('electron')

global.displayWindow = null;
global.controllerWindow = null

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
    width: 600,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    }
  })

  controllerWindow.loadFile('controller/controller.html')
}

app.whenReady().then(() => {
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
