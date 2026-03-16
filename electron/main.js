const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1366,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'installer', 'index.html'));

  ipcMain.removeHandler('installer:launch-simulator');
  ipcMain.removeHandler('installer:minimize');
  ipcMain.removeHandler('installer:toggle-maximize');
  ipcMain.removeHandler('installer:close');

  ipcMain.handle('installer:launch-simulator', async () => {
    await mainWindow.loadFile(path.join(__dirname, '..', 'logic', 'index.html'));
    return { ok: true };
  });

  ipcMain.handle('installer:minimize', () => {
    mainWindow.minimize();
    return { ok: true };
  });

  ipcMain.handle('installer:toggle-maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
      return { ok: true, maximized: false };
    }
    mainWindow.maximize();
    return { ok: true, maximized: true };
  });

  ipcMain.handle('installer:close', () => {
    mainWindow.close();
    return { ok: true };
  });
}

app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
