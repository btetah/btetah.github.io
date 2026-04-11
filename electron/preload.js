const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('installerApp', {
  launchSimulator: () => ipcRenderer.invoke('installer:launch-simulator'),
  minimize: () => ipcRenderer.invoke('installer:minimize'),
  toggleMaximize: () => ipcRenderer.invoke('installer:toggle-maximize'),
  close: () => ipcRenderer.invoke('installer:close'),
});
