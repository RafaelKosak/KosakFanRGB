const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  getDevices: () => ipcRenderer.invoke('get-devices'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  updateLeds: (deviceId, colors, zoneId) => ipcRenderer.invoke('update-leds', deviceId, colors, zoneId),
  retryConnection: () => ipcRenderer.invoke('retry-connection'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  setEffect: (deviceId, ledCount, opts, zoneId) => ipcRenderer.invoke('set-effect', deviceId, ledCount, opts, zoneId),
  stopEffect: () => ipcRenderer.invoke('stop-effect'),
  exportProfile: (profile) => ipcRenderer.invoke('export-profile', profile),
  importProfile: () => ipcRenderer.invoke('import-profile'),
  onInitComplete: (callback) => ipcRenderer.on('init-complete', (event, data) => callback(data)),
  removeAllListeners: () => { ipcRenderer.removeAllListeners('init-complete') }
})
