const path = require('path');
const fs = require('fs');
const { app, BrowserWindow, ipcMain } = require('electron');

let mainWindow = null;
let installerWindow = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    },
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'logic', 'index.html'));
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createInstallerWindow() {
  installerWindow = new BrowserWindow({
    width: 1160,
    height: 840,
    minWidth: 1024,
    minHeight: 800,
    frame: false,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    },
  });

  installerWindow.loadFile(path.join(__dirname, '..', 'installer', 'index.html'));
  
  installerWindow.on('closed', () => {
    installerWindow = null;
  });
}

app.whenReady().then(() => {
  const userDataPath = app.getPath('userData');
  const installedFlagPath = path.join(userDataPath, '.installed');
  
  ipcMain.handle('installer:launch-simulator', async () => {
    try {
      fs.writeFileSync(installedFlagPath, 'true', 'utf-8');
    } catch (e) {
      console.error('Failed to write .installed flag', e);
    }
    createMainWindow();
    if (installerWindow) {
      installerWindow.close();
    }
  });

  ipcMain.handle('installer:minimize', () => {
    if (installerWindow) installerWindow.minimize();
  });

  ipcMain.handle('installer:toggle-maximize', () => {
    if (installerWindow) {
      if (installerWindow.isMaximized()) {
        installerWindow.unmaximize();
        return { maximized: false };
      } else {
        installerWindow.maximize();
        return { maximized: true };
      }
    }
    return { maximized: false };
  });

  ipcMain.handle('installer:close', () => {
    if (installerWindow) installerWindow.close();
    else app.quit();
  });

  if (fs.existsSync(installedFlagPath)) {
    createMainWindow();
  } else {
    createInstallerWindow();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      if (fs.existsSync(installedFlagPath)) {
        createMainWindow();
      } else {
        createInstallerWindow();
      }
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
