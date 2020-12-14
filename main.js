const { app, BrowserWindow } = require('electron')

global.displayWindow = null;
global.controllerWindow = null

function createDisplayWindow () {
  displayWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  displayWindow.loadFile('display/display.html')
}

function createControllerWindow () {
  controllerWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  controllerWindow.loadFile('controller/controller.html')
}

app.whenReady().then(() => {
  createControllerWindow();
  createDisplayWindow();

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
