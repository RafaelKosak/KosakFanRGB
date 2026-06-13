import { app, BrowserWindow, ipcMain, Menu, Tray } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { Client } from 'openrgb-sdk'
import { spawn, execSync } from 'child_process'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
let mainWindow = null
let tray = null
let openRgbProcess = null
let rgbClient = null
let isConnected = false
let isQuitting = false

// Single Instance Lock to prevent multiple zombie processes
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    }
  })

  app.whenReady().then(async () => {
    createWindow()
    createTray()

    // Kill any existing OpenRGB instance first to avoid port conflicts and ensure fresh start
    killExistingOpenRGB()

    const started = await spawnOpenRGB()
    if (started) {
      const connected = await connectToOpenRGB()
      if (connected) {
        await applySavedSettingsToHardware()
      }
    }

    // Tell the renderer we're done initializing
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('init-complete', {
        connected: isConnected,
        openrgbStarted: started
      })
    }

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
}

// Settings file path
const getSettingsPath = () => path.join(app.getPath('userData'), 'settings.json')

// Load settings from JSON
const loadSettings = () => {
  try {
    const sPath = getSettingsPath()
    if (fs.existsSync(sPath)) {
      return JSON.parse(fs.readFileSync(sPath, 'utf8'))
    }
  } catch (e) {
    console.error('[Settings] Error loading settings:', e)
  }
  return {
    color: '#aa3bff',
    brightness: 100,
    startWithWindows: false,
    startHidden: false
  }
}

// Save settings to JSON and update autostart
const saveSettings = (settings) => {
  try {
    const sPath = getSettingsPath()
    fs.writeFileSync(sPath, JSON.stringify(settings, null, 2))
    
    // Configure system autostart
    const exePath = app.getPath('exe')
    app.setLoginItemSettings({
      openAtLogin: !!settings.startWithWindows,
      path: exePath,
      args: settings.startHidden ? ['--hidden'] : []
    })
    console.log('[Settings] Saved settings and updated login item settings:', settings)
  } catch (e) {
    console.error('[Settings] Error saving settings:', e)
  }
}

// Helper: Convert hex color to RGB object
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    red: parseInt(result[1], 16),
    green: parseInt(result[2], 16),
    blue: parseInt(result[3], 16)
  } : { red: 170, green: 59, blue: 255 }; // Default purple
}

// Apply settings to hardware controllers
async function applySavedSettingsToHardware() {
  if (!isConnected || !rgbClient) return

  try {
    const settings = loadSettings()
    const baseRgb = hexToRgb(settings.color)
    const brightness = settings.brightness ?? 100
    const finalRgb = {
      red: Math.floor(baseRgb.red * (brightness / 100)),
      green: Math.floor(baseRgb.green * (brightness / 100)),
      blue: Math.floor(baseRgb.blue * (brightness / 100)),
    }

    const controllerCount = await rgbClient.getControllerCount()
    console.log('[SDK] Auto-applying saved settings to', controllerCount, 'devices')

    for (let i = 0; i < controllerCount; i++) {
      let data = await rgbClient.getControllerData(i)
      
      // Auto-resize resizable ARGB zones if 0 LEDs
      let didResize = false
      for (const zone of data.zones) {
        if (zone.resizable && zone.ledsCount === 0) {
          console.log(`[SDK] Auto-resizing device ${i} zone ${zone.id} (${zone.name}) from 0 to 80 LEDs`)
          try {
            await rgbClient.resizeZone(i, zone.id, 80)
            didResize = true
          } catch (resizeErr) {
            console.error(`[SDK] Failed to resize zone ${zone.id} on device ${i}:`, resizeErr.message)
          }
        }
      }

      if (didResize) {
        await new Promise(r => setTimeout(r, 500))
        data = await rgbClient.getControllerData(i)
      }

      // Set to Direct/Static/Custom mode
      try {
        const targetMode = data.modes.find(m => 
          m.name.toLowerCase() === 'direct' || 
          m.name.toLowerCase() === 'static' || 
          m.name.toLowerCase() === 'custom'
        )
        if (targetMode) {
          await rgbClient.updateMode(i, targetMode.name)
        } else {
          await rgbClient.setCustomMode(i)
        }
      } catch (modeErr) {
        console.warn(`[SDK] Failed to set mode for device ${i}:`, modeErr.message)
      }

      // Update LEDs
      const colors = new Array(data.colors.length).fill(finalRgb)
      await rgbClient.updateLeds(i, colors)
    }
    console.log('[SDK] Saved settings applied to hardware successfully!')
  } catch (err) {
    console.error('[SDK] Error auto-applying saved settings:', err)
  }
}

// Find path to icon for System Tray
const getIconPath = () => {
  const devPath = path.join(__dirname, '../public/icon.png')
  const prodPath = path.join(__dirname, '../dist/icon.png')
  return fs.existsSync(prodPath) ? prodPath : devPath
}

// Determine the path to OpenRGB.exe
const getOpenRgbPath = () => {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'bin', 'OpenRGB', 'OpenRGB.exe')
  } else {
    return path.join(__dirname, '..', 'bin', 'OpenRGB', 'OpenRGB.exe')
  }
}

// Force kill any OpenRGB.exe running in the background
const killExistingOpenRGB = () => {
  try {
    console.log('[System] Killing any running OpenRGB instances...')
    execSync('taskkill /F /IM OpenRGB.exe 2>nul', { windowsHide: true })
  } catch (e) {
    // Process not running, which is expected
  }
}

// Spawn OpenRGB in the background
const spawnOpenRGB = () => {
  return new Promise((resolve) => {
    try {
      const exePath = getOpenRgbPath()
      const exeDir = path.dirname(exePath)

      if (!fs.existsSync(exePath)) {
        console.error('[OpenRGB] EXE NOT FOUND:', exePath)
        resolve(false)
        return
      }

      console.log('[OpenRGB] Starting background process from:', exePath)

      // Start OpenRGB
      openRgbProcess = spawn(exePath, ['--server', '--server-port', '6742'], {
        cwd: exeDir,
        windowsHide: true,
        detached: false,
        stdio: ['ignore', 'pipe', 'pipe']
      })

      openRgbProcess.stdout.on('data', (d) => console.log('[OpenRGB]', d.toString().trim()))
      openRgbProcess.stderr.on('data', (d) => console.log('[OpenRGB ERR]', d.toString().trim()))

      openRgbProcess.on('error', (err) => {
        console.error('[OpenRGB] Spawn error:', err.message)
        resolve(false)
      })

      openRgbProcess.on('exit', (code) => {
        console.log('[OpenRGB] Exited with code:', code)
        openRgbProcess = null
      })

      // Wait 4 seconds for OpenRGB to initialize and bind the port
      setTimeout(() => resolve(true), 4000)

    } catch (err) {
      console.error('[OpenRGB] Error spawning:', err)
      resolve(false)
    }
  })
}

// Connect to OpenRGB SDK with retries
async function connectToOpenRGB(retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`[SDK] Connection attempt ${i + 1}/${retries}...`)
      rgbClient = new Client('Kosak Fan Rgb', 6742, '127.0.0.1')
      
      // Handle socket errors to prevent unhandled exceptions like ECONNRESET
      rgbClient.on('error', (err) => {
        console.error('[SDK Client Error]', err.message)
        isConnected = false
      })

      await rgbClient.connect()
      isConnected = true
      console.log('[SDK] Connected successfully!')
      return true
    } catch (err) {
      console.error(`[SDK] Attempt ${i + 1} failed:`, err.message)
      isConnected = false
      rgbClient = null
      await new Promise(r => setTimeout(r, 2000))
    }
  }
  return false
}

// System Tray setup
const createTray = () => {
  const iconPath = getIconPath()
  console.log('[Tray] Creating tray icon with path:', iconPath)
  tray = new Tray(iconPath)
  
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Abrir Kosak Fan Rgb', 
      click: () => {
        if (mainWindow) {
          mainWindow.show()
          mainWindow.focus()
        }
      }
    },
    { type: 'separator' },
    { 
      label: 'Sair', 
      click: () => {
        isQuitting = true
        app.quit()
      }
    }
  ])
  
  tray.setToolTip('Kosak Fan Rgb')
  tray.setContextMenu(contextMenu)
  
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show()
      mainWindow.focus()
    }
  })
}

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    show: false, // Don't show immediately (allows start minimized)
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#121212',
      symbolColor: '#ffffff'
    },
    autoHideMenuBar: true,
  })

  // Check if we should start hidden
  const shouldStartHidden = process.argv.includes('--hidden')
  console.log('[Window] Should start hidden:', shouldStartHidden)

  mainWindow.once('ready-to-show', () => {
    if (!shouldStartHidden) {
      mainWindow.show()
    }
  })

  // Capture and output renderer logs to assist debugging
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer] ${message} (${path.basename(sourceId)}:${line})`)
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // Intercept window close to minimize to system tray instead
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      mainWindow.hide()
    }
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('quit', () => {
  if (openRgbProcess && !openRgbProcess.killed) {
    openRgbProcess.kill()
  }
  killExistingOpenRGB()
})

// IPC Handlers
ipcMain.handle('get-settings', () => {
  return loadSettings()
})

ipcMain.handle('save-settings', (event, settings) => {
  saveSettings(settings)
  return { success: true }
})

ipcMain.handle('get-devices', async () => {
  if (!isConnected) {
    await connectToOpenRGB(3)
  }

  if (!isConnected) {
    return { error: 'Não foi possível conectar ao motor de hardware.\nCertifique-se de aceitar a permissão de Administrador ao abrir o programa.' }
  }

  try {
    const controllerCount = await rgbClient.getControllerCount()
    console.log('[SDK] Found', controllerCount, 'device(s)')
    const devices = []

    for (let i = 0; i < controllerCount; i++) {
      let data = await rgbClient.getControllerData(i)
      
      // Auto-resize resizable ARGB zones that are configured to 0 LEDs
      let didResize = false
      for (const zone of data.zones) {
        if (zone.resizable && zone.ledsCount === 0) {
          console.log(`[SDK] Auto-resizing device ${i} zone ${zone.id} (${zone.name}) from 0 to 80 LEDs`)
          try {
            await rgbClient.resizeZone(i, zone.id, 80)
            didResize = true
          } catch (resizeErr) {
            console.error(`[SDK] Failed to resize zone ${zone.id} on device ${i}:`, resizeErr.message)
          }
        }
      }

      // If we resized any zones, we must fetch the data again to get the updated LED counts
      if (didResize) {
        await new Promise(r => setTimeout(r, 500))
        data = await rgbClient.getControllerData(i)
      }

      devices.push({
        index: i,
        name: data.name,
        type: data.type,
        vendor: data.vendor,
        description: data.description,
        colors: data.colors,
        leds: data.leds,
      })
    }

    return devices
  } catch (err) {
    console.error('[SDK] Error fetching devices:', err)
    return { error: err.message }
  }
})

ipcMain.handle('update-leds', async (event, deviceId, colors) => {
  if (!isConnected || !rgbClient) return { error: 'Não conectado' }

  try {
    // Attempt to set device to Direct/Static mode so custom colors can be applied
    try {
      const deviceData = await rgbClient.getControllerData(deviceId)
      const targetMode = deviceData.modes.find(m => 
        m.name.toLowerCase() === 'direct' || 
        m.name.toLowerCase() === 'static' || 
        m.name.toLowerCase() === 'custom'
      )
      if (targetMode) {
        console.log(`[SDK] Setting device ${deviceId} mode to: ${targetMode.name}`)
        await rgbClient.updateMode(deviceId, targetMode.name)
      } else {
        await rgbClient.setCustomMode(deviceId)
      }
    } catch (modeErr) {
      console.warn(`[SDK] Failed to set mode for device ${deviceId}:`, modeErr.message)
    }

    await rgbClient.updateLeds(deviceId, colors)
    return { success: true }
  } catch (err) {
    console.error('[SDK] Error updating leds:', err)
    return { error: err.message }
  }
})

ipcMain.handle('retry-connection', async () => {
  killExistingOpenRGB()
  const started = await spawnOpenRGB()
  if (started) {
    const connected = await connectToOpenRGB()
    if (connected) {
      await applySavedSettingsToHardware()
    }
    return { connected }
  }
  return { connected: false }
})
