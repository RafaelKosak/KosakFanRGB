import { app, BrowserWindow, ipcMain, Menu, Tray, dialog, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'openrgb-sdk';
import { spawn, execSync, exec } from 'child_process';
import fs from 'fs';
import { autoUpdater } from 'electron-updater';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let mainWindow = null;
let tray = null;
let openRgbProcess = null;
let rgbClient = null;
let isConnected = false;
let isQuitting = false;

// Effects engine state
let effectInterval = null;
let effectTick = 0;

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    createWindow();
    createTray();

    // Check for updates automatically in production
    if (app.isPackaged) {
      try {
        autoUpdater.checkForUpdatesAndNotify();
      } catch (err) {
        console.error('Failed to check for updates:', err);
      }
    }

    killExistingOpenRGB();

    const started = await spawnOpenRGB();
    if (started) {
      const connected = await connectToOpenRGB();
      if (connected) {
        await applySavedSettingsToHardware();
      }
    }

    if (mainWindow?.webContents) {
      mainWindow.webContents.send('init-complete', {
        connected: isConnected,
        openrgbStarted: started
      });
    }

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

// ── Settings ──

const getSettingsPath = () => path.join(app.getPath('userData'), 'settings.json');

const loadSettings = () => {
  try {
    const sPath = getSettingsPath();
    if (fs.existsSync(sPath)) {
      const settings = JSON.parse(fs.readFileSync(sPath, 'utf8'));
      if (!settings.profiles || !Array.isArray(settings.profiles)) {
        settings.profiles = [
          {
            id: 'default',
            name: 'Padrão',
            color: settings.color || '#aa3bff',
            brightness: settings.brightness ?? 100,
            effect: settings.effect || 'static',
            effectSpeed: settings.effectSpeed ?? 50,
            effectDirection: settings.effectDirection ?? 0,
            effectSmoothness: settings.effectSmoothness ?? 50
          }
        ];
        settings.activeProfileId = 'default';
      }
      if (!settings.theme) {
        settings.theme = 'dark';
      }
      return settings;
    }
  } catch (e) {
    console.error('Error loading settings:', e);
  }
  return {
    color: '#aa3bff',
    brightness: 100,
    startWithWindows: false,
    startHidden: false,
    favoriteColors: [],
    theme: 'dark',
    effect: 'static',
    effectSpeed: 50,
    effectDirection: 0,
    effectSmoothness: 50,
    profiles: [
      {
        id: 'default',
        name: 'Padrão',
        color: '#aa3bff',
        brightness: 100,
        effect: 'static',
        effectSpeed: 50,
        effectDirection: 0,
        effectSmoothness: 50
      }
    ],
    activeProfileId: 'default',
    cachedDevices: [],
    activeDeviceIndex: 0
  };
};

const saveSettings = (newSettings) => {
  try {
    const sPath = getSettingsPath();
    const current = loadSettings();
    
    const startWithWindowsChanged = newSettings.startWithWindows !== undefined && newSettings.startWithWindows !== current.startWithWindows;
    const startHiddenChanged = newSettings.startHidden !== undefined && newSettings.startHidden !== current.startHidden;
    
    const merged = { ...current, ...newSettings };
    fs.writeFileSync(sPath, JSON.stringify(merged, null, 2));

    if (process.platform === 'win32') {
      if (startWithWindowsChanged || startHiddenChanged) {
        const taskName = 'KosakFanRGB';
        if (merged.startWithWindows) {
          const appPath = app.getPath('exe');
          const args = merged.startHidden ? ' --hidden' : '';
          const cmd = `schtasks /create /tn "${taskName}" /tr "\\"${appPath}\\"${args}" /sc onlogon /rl highest /f`;
          exec(cmd, { windowsHide: true }, (err) => {
            if (err) {
              console.error('Error creating scheduled task, falling back to login settings:', err);
              app.setLoginItemSettings({
                openAtLogin: true,
                path: appPath,
                args: merged.startHidden ? ['--hidden'] : []
              });
            }
          });
        } else {
          const cmd = `schtasks /delete /tn "${taskName}" /f`;
          exec(cmd, { windowsHide: true }, () => {
            app.setLoginItemSettings({
              openAtLogin: false,
              path: app.getPath('exe')
            });
          });
        }
      }
    } else {
      if (startWithWindowsChanged || startHiddenChanged) {
        app.setLoginItemSettings({
          openAtLogin: !!merged.startWithWindows,
          path: app.getPath('exe'),
          args: merged.startHidden ? ['--hidden'] : []
        });
      }
    }
  } catch (e) {
    console.error('Error saving settings:', e);
  }
};

// ── Color Helpers ──

function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r
    ? { red: parseInt(r[1], 16), green: parseInt(r[2], 16), blue: parseInt(r[3], 16) }
    : { red: 170, green: 59, blue: 255 };
}

function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(1, s));
  l = Math.max(0, Math.min(1, l));
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r1, g1, b1;
  if (h < 60)       { r1 = c; g1 = x; b1 = 0; }
  else if (h < 120) { r1 = x; g1 = c; b1 = 0; }
  else if (h < 180) { r1 = 0; g1 = c; b1 = x; }
  else if (h < 240) { r1 = 0; g1 = x; b1 = c; }
  else if (h < 300) { r1 = x; g1 = 0; b1 = c; }
  else              { r1 = c; g1 = 0; b1 = x; }
  return {
    red: Math.round((r1 + m) * 255),
    green: Math.round((g1 + m) * 255),
    blue: Math.round((b1 + m) * 255)
  };
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
  }
  return { h, s, l };
}

function applyBrightness(rgb, brightness) {
  const f = brightness / 100;
  return {
    red: Math.floor(rgb.red * f),
    green: Math.floor(rgb.green * f),
    blue: Math.floor(rgb.blue * f)
  };
}

// ── Effects Engine ──

function stopEffect() {
  if (effectInterval) {
    clearInterval(effectInterval);
    effectInterval = null;
  }
  effectTick = 0;
}

async function setDeviceToDirectMode(deviceId) {
  if (!isConnected || !rgbClient) return;
  try {
    const data = await rgbClient.getControllerData(deviceId);
    const target = data.modes.find(m =>
      m.name.toLowerCase() === 'direct' ||
      m.name.toLowerCase() === 'static' ||
      m.name.toLowerCase() === 'custom'
    );
    if (target) await rgbClient.updateMode(deviceId, target.name);
    else await rgbClient.setCustomMode(deviceId);
  } catch (e) { /* ignore */ }
}

async function applyStaticColor(deviceId, ledCount, color, brightness) {
  if (!isConnected || !rgbClient) return;
  const rgb = applyBrightness(hexToRgb(color), brightness);
  const colors = new Array(ledCount).fill(rgb);
  await rgbClient.updateLeds(deviceId, colors);
}

function startEffect(deviceId, ledCount, opts) {
  stopEffect();

  const { effect, color, brightness, speed, direction, smoothness } = opts;
  const baseRgb = hexToRgb(color);
  const baseHsl = rgbToHsl(baseRgb.red, baseRgb.green, baseRgb.blue);

  // Speed maps: 0 = slow (200ms), 100 = fast (15ms)
  const intervalMs = Math.max(15, Math.round(200 - (speed / 100) * 185));

  if (effect === 'static') {
    setDeviceToDirectMode(deviceId).then(() =>
      applyStaticColor(deviceId, ledCount, color, brightness)
    );
    return;
  }

  if (effect === 'off') {
    setDeviceToDirectMode(deviceId).then(async () => {
      const black = new Array(ledCount).fill({ red: 0, green: 0, blue: 0 });
      await rgbClient.updateLeds(deviceId, black);
    });
    return;
  }

  setDeviceToDirectMode(deviceId).then(() => {
    effectTick = 0;
    effectInterval = setInterval(async () => {
      if (!isConnected || !rgbClient) return;
      try {
        const colors = computeFrame(effect, ledCount, effectTick, {
          baseRgb, baseHsl, brightness, direction, smoothness
        });
        await rgbClient.updateLeds(deviceId, colors);
        effectTick++;
      } catch (e) { /* skip frame */ }
    }, intervalMs);
  });
}

function computeFrame(effect, ledCount, tick, ctx) {
  const { baseRgb, baseHsl, brightness, direction, smoothness } = ctx;
  const dir = direction === 1 ? -1 : 1;
  const smooth = (smoothness ?? 50) / 100;
  const colors = [];

  switch (effect) {
    case 'breathing': {
      const phase = (Math.sin(tick * 0.06 * (1 + smooth)) + 1) / 2;
      const br = brightness * phase;
      const rgb = applyBrightness(baseRgb, br);
      for (let i = 0; i < ledCount; i++) colors.push(rgb);
      break;
    }

    case 'rainbow': {
      for (let i = 0; i < ledCount; i++) {
        const hue = (tick * 2 * dir + (i * 360 / Math.max(ledCount, 1))) % 360;
        const rgb = applyBrightness(hslToRgb(hue, 1, 0.5), brightness);
        colors.push(rgb);
      }
      break;
    }

    case 'wave': {
      for (let i = 0; i < ledCount; i++) {
        const wave = (Math.sin((i * 0.3 + tick * 0.08 * dir) * (1 + smooth)) + 1) / 2;
        const rgb = applyBrightness(baseRgb, brightness * wave);
        colors.push(rgb);
      }
      break;
    }

    case 'pulse': {
      const cycle = tick % 60;
      let intensity;
      if (cycle < 5) intensity = cycle / 5;
      else intensity = Math.max(0, 1 - (cycle - 5) / (25 + smooth * 30));
      const rgb = applyBrightness(baseRgb, brightness * intensity);
      for (let i = 0; i < ledCount; i++) colors.push(rgb);
      break;
    }

    case 'gradient': {
      for (let i = 0; i < ledCount; i++) {
        const pos = direction === 1 ? (ledCount - 1 - i) : i;
        const hue = (baseHsl.h + (pos / Math.max(ledCount, 1)) * 120) % 360;
        const rgb = applyBrightness(hslToRgb(hue, baseHsl.s, baseHsl.l), brightness);
        colors.push(rgb);
      }
      break;
    }

    case 'blink': {
      const on = (tick % 20) < 10;
      const rgb = on ? applyBrightness(baseRgb, brightness) : { red: 0, green: 0, blue: 0 };
      for (let i = 0; i < ledCount; i++) colors.push(rgb);
      break;
    }

    case 'colorcycle': {
      const hue = (tick * 1.5 * dir) % 360;
      const rgb = applyBrightness(hslToRgb(hue, 1, 0.5), brightness);
      for (let i = 0; i < ledCount; i++) colors.push(rgb);
      break;
    }

    default: {
      const rgb = applyBrightness(baseRgb, brightness);
      for (let i = 0; i < ledCount; i++) colors.push(rgb);
    }
  }

  return colors;
}

// ── Apply Saved Settings on Startup ──

async function applySavedSettingsToHardware() {
  if (!isConnected || !rgbClient) return;

  try {
    const settings = loadSettings();
    const controllerCount = await rgbClient.getControllerCount();
    
    // Find active profile
    const activeProfile = settings.profiles?.find(p => p.id === settings.activeProfileId)
      || settings.profiles?.[0]
      || {
        color: settings.color || '#aa3bff',
        brightness: settings.brightness ?? 100,
        effect: settings.effect || 'static',
        effectSpeed: settings.effectSpeed ?? 50,
        effectDirection: settings.effectDirection ?? 0,
        effectSmoothness: settings.effectSmoothness ?? 50
      };

    for (let i = 0; i < controllerCount; i++) {
      let data = await rgbClient.getControllerData(i);
      let didResize = false;

      for (const zone of data.zones) {
        if (zone.resizable && zone.ledsCount === 0) {
          try { await rgbClient.resizeZone(i, zone.id, 80); didResize = true; }
          catch (e) { /* ignore */ }
        }
      }

      if (didResize) {
        await new Promise(r => setTimeout(r, 500));
        data = await rgbClient.getControllerData(i);
      }

      // Apply active profile's effect to first device
      if (i === 0) {
        startEffect(i, data.colors.length, {
          effect: activeProfile.effect || 'static',
          color: activeProfile.color || '#aa3bff',
          brightness: activeProfile.brightness ?? 100,
          speed: activeProfile.effectSpeed ?? 50,
          direction: activeProfile.effectDirection ?? 0,
          smoothness: activeProfile.effectSmoothness ?? 50
        });
      } else {
        await setDeviceToDirectMode(i);
        await applyStaticColor(i, data.colors.length, activeProfile.color || '#aa3bff', activeProfile.brightness ?? 100);
      }
    }
  } catch (err) {
    console.error('Error auto-applying settings:', err);
  }
}

// ── OpenRGB Process Management ──

const getIconPath = () => {
  const devPath = path.join(__dirname, '../public/icon.png');
  const prodPath = path.join(__dirname, '../dist/icon.png');
  return fs.existsSync(prodPath) ? prodPath : devPath;
};

const getOpenRgbPath = () => {
  if (app.isPackaged) return path.join(process.resourcesPath, 'bin', 'OpenRGB', 'OpenRGB.exe');
  return path.join(__dirname, '..', 'bin', 'OpenRGB', 'OpenRGB.exe');
};

const killExistingOpenRGB = () => {
  try { execSync('taskkill /F /IM OpenRGB.exe 2>nul', { windowsHide: true }); }
  catch (e) { /* not running */ }
};

const spawnOpenRGB = () => {
  return new Promise((resolve) => {
    try {
      const exePath = getOpenRgbPath();
      if (!fs.existsSync(exePath)) { resolve(false); return; }

      openRgbProcess = spawn(exePath, ['--server', '--server-port', '6742'], {
        cwd: path.dirname(exePath),
        windowsHide: true,
        detached: false,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      openRgbProcess.on('error', () => resolve(false));
      openRgbProcess.on('exit', () => { openRgbProcess = null; });

      setTimeout(() => resolve(true), 4000);
    } catch (err) {
      resolve(false);
    }
  });
};

async function connectToOpenRGB(retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      rgbClient = new Client('Kosak Fan Rgb', 6742, '127.0.0.1');
      rgbClient.on('error', (err) => { isConnected = false; });
      await rgbClient.connect();
      isConnected = true;
      return true;
    } catch (err) {
      isConnected = false;
      rgbClient = null;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  return false;
}

// ── Tray & Window ──

const createTray = () => {
  tray = new Tray(getIconPath());
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Abrir Kosak Fan Rgb', click: () => mainWindow?.show() },
    { type: 'separator' },
    { label: 'Sair', click: () => { isQuitting = true; app.quit(); } }
  ]);
  tray.setToolTip('Kosak Fan Rgb');
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => mainWindow?.show());
};

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    show: false,
    icon: getIconPath(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: 'hidden',
    titleBarOverlay: { color: '#1a1a1a', symbolColor: '#ffffff' },
    autoHideMenuBar: true,
  });

  const shouldStartHidden = process.argv.includes('--hidden');
  mainWindow.once('ready-to-show', () => { if (!shouldStartHidden) mainWindow.show(); });

  const htmlPath = path.join(__dirname, '../dist/index.html');
  try {
    fs.writeFileSync(
      'c:\\Users\\kosak\\Desktop\\Development\\Kosak Fan\\debug-load.log',
      `__dirname: ${__dirname}\nhtmlPath: ${htmlPath}\nexists: ${fs.existsSync(htmlPath)}\n`
    );
  } catch (e) {}

  if (process.env.VITE_DEV_SERVER_URL) mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  else mainWindow.loadFile(htmlPath);

  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('close', (event) => {
    if (!isQuitting) { event.preventDefault(); mainWindow.hide(); }
  });
};

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

app.on('quit', () => {
  stopEffect();
  if (openRgbProcess && !openRgbProcess.killed) openRgbProcess.kill();
  killExistingOpenRGB();
});

// ── IPC Handlers ──

ipcMain.handle('get-app-version', () => {
  const ver = app.getVersion();
  try {
    fs.appendFileSync(
      'c:\\Users\\kosak\\Desktop\\Development\\Kosak Fan\\debug-load.log',
      `IPC get-app-version called. Returning: "${ver}"\n`
    );
  } catch (err) {}
  return ver;
});

ipcMain.handle('get-settings', () => loadSettings());

ipcMain.handle('save-settings', (event, settings) => {
  saveSettings(settings);
  return { success: true };
});

ipcMain.handle('get-devices', async () => {
  if (!isConnected) await connectToOpenRGB(3);
  if (!isConnected) {
    return { error: 'Não foi possível conectar ao hardware.\nCertifique-se de aceitar a permissão de Administrador.' };
  }

  try {
    const controllerCount = await rgbClient.getControllerCount();
    const devices = [];
    for (let i = 0; i < controllerCount; i++) {
      let data = await rgbClient.getControllerData(i);
      let didResize = false;
      for (const zone of data.zones) {
        if (zone.resizable && zone.ledsCount === 0) {
          try { await rgbClient.resizeZone(i, zone.id, 80); didResize = true; }
          catch (e) { /* ignore */ }
        }
      }
      if (didResize) {
        await new Promise(r => setTimeout(r, 500));
        data = await rgbClient.getControllerData(i);
      }
      devices.push({
        index: i, name: data.name, type: data.type,
        vendor: data.vendor, description: data.description,
        colors: data.colors, leds: data.leds,
      });
    }

    // Save fetched devices to settings cache
    const settings = loadSettings();
    settings.cachedDevices = devices;
    saveSettings(settings);

    return devices;
  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.handle('update-leds', async (event, deviceId, colors) => {
  if (!isConnected || !rgbClient) return { error: 'Não conectado' };
  try {
    await setDeviceToDirectMode(deviceId);
    await rgbClient.updateLeds(deviceId, colors);
    return { success: true };
  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.handle('set-effect', async (event, deviceId, ledCount, opts) => {
  if (!isConnected || !rgbClient) return { error: 'Não conectado' };
  try {
    startEffect(deviceId, ledCount, opts);
    return { success: true };
  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.handle('stop-effect', () => {
  stopEffect();
  return { success: true };
});

ipcMain.handle('export-profile', async (event, profile) => {
  const win = BrowserWindow.fromWebContents(event.webContents);
  const { filePath } = await dialog.showSaveDialog(win, {
    title: 'Exportar Perfil',
    defaultPath: `${profile.name}.json`,
    filters: [{ name: 'JSON Files', extensions: ['json'] }]
  });

  if (!filePath) return { cancelled: true };

  try {
    fs.writeFileSync(filePath, JSON.stringify(profile, null, 2), 'utf8');
    return { success: true };
  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.handle('import-profile', async (event) => {
  const win = BrowserWindow.fromWebContents(event.webContents);
  const { filePaths } = await dialog.showOpenDialog(win, {
    title: 'Importar Perfil',
    filters: [{ name: 'JSON Files', extensions: ['json'] }],
    properties: ['openFile']
  });

  if (!filePaths || filePaths.length === 0) return { cancelled: true };

  try {
    const content = fs.readFileSync(filePaths[0], 'utf8');
    const profile = JSON.parse(content);
    if (!profile.name || typeof profile.name !== 'string') {
      return { error: 'Arquivo inválido: o perfil deve ter um nome.' };
    }
    return {
      profile: {
        id: 'imported_' + Date.now(),
        name: profile.name,
        color: profile.color || '#aa3bff',
        brightness: profile.brightness ?? 100,
        effect: profile.effect || 'static',
        effectSpeed: profile.effectSpeed ?? 50,
        effectDirection: profile.effectDirection ?? 0,
        effectSmoothness: profile.effectSmoothness ?? 50
      }
    };
  } catch (err) {
    return { error: 'Falha ao ler arquivo: ' + err.message };
  }
});

ipcMain.handle('retry-connection', async () => {
  killExistingOpenRGB();
  const started = await spawnOpenRGB();
  if (started) {
    const connected = await connectToOpenRGB();
    if (connected) await applySavedSettingsToHardware();
    return { connected };
  }
  return { connected: false };
});

ipcMain.handle('open-external', async (event, url) => {
  try {
    await shell.openExternal(url);
  } catch (e) {
    console.error('Failed to open external link:', e);
  }
});
