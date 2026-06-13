const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  getDevices: () => ipcRenderer.invoke('get-devices'),
  updateLeds: (deviceId, colors) => ipcRenderer.invoke('update-leds', deviceId, colors),
  retryConnection: () => ipcRenderer.invoke('retry-connection'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  onInitComplete: (callback) => ipcRenderer.on('init-complete', (event, data) => callback(data)),
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners('init-complete')
  }
})
