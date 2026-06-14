const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  getDevices: () => ipcRenderer.invoke('get-devices'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  updateLeds: (deviceId, colors) => ipcRenderer.invoke('update-leds', deviceId, colors),
  retryConnection: () => ipcRenderer.invoke('retry-connection'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  setEffect: (deviceId, ledCount, opts) => ipcRenderer.invoke('set-effect', deviceId, ledCount, opts),
  stopEffect: () => ipcRenderer.invoke('stop-effect'),
  exportProfile: (profile) => ipcRenderer.invoke('export-profile', profile),
  importProfile: () => ipcRenderer.invoke('import-profile'),
  onInitComplete: (callback) => ipcRenderer.on('init-complete', (event, data) => callback(data)),
  removeAllListeners: () => { ipcRenderer.removeAllListeners('init-complete') }
})
