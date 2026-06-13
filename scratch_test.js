const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { Client } = require('openrgb-sdk');

const logFile = path.join(__dirname, 'test_log.txt');
function log(msg) {
  console.log(msg);
  fs.appendFileSync(logFile, msg + '\n');
}

fs.writeFileSync(logFile, '--- TEST START ---\n');

async function runTest() {
  const exePath = path.join(__dirname, 'bin', 'OpenRGB', 'OpenRGB.exe');
  const exeDir = path.dirname(exePath);

  log('Spawning OpenRGB...');
  const openRgbProcess = spawn(exePath, ['--server', '--server-port', '6742'], {
    cwd: exeDir,
    windowsHide: true,
  });

  openRgbProcess.stdout.on('data', (d) => log('[OpenRGB STDOUT] ' + d.toString().trim()));
  openRgbProcess.stderr.on('data', (d) => log('[OpenRGB STDERR] ' + d.toString().trim()));

  // Wait 5 seconds for OpenRGB to detect devices and bind port
  await new Promise(r => setTimeout(r, 5000));

  log('Connecting to client...');
  const client = new Client('TestClient', 6742, '127.0.0.1');
  
  client.on('error', (err) => {
    log('[Client Error] ' + err.message);
  });

  try {
    await client.connect();
    log('Connected to OpenRGB server!');

    const count = await client.getControllerCount();
    log(`Controller count: ${count}`);

    if (count > 0) {
      const device = await client.getControllerData(0);
      log(`Device 0: ${device.name}`);
      log(`Modes available: ${device.modes.map(m => m.name).join(', ')}`);
      log(`Current active mode: ${device.modes[device.activeMode]?.name || device.activeMode}`);

      // Try setting Direct mode
      const targetModeName = 'Direct';
      log(`Attempting to set mode to: ${targetModeName}`);
      await client.updateMode(0, targetModeName);
      
      // Wait 1 second
      await new Promise(r => setTimeout(r, 1000));

      // Refresh data
      const deviceRefreshed = await client.getControllerData(0);
      log(`Mode after update: ${deviceRefreshed.modes[deviceRefreshed.activeMode]?.name || deviceRefreshed.activeMode}`);

      // Update LEDs to red
      log('Updating LEDs to Red...');
      const colors = new Array(deviceRefreshed.colors.length).fill({ red: 255, green: 0, blue: 0 });
      await client.updateLeds(0, colors);
      log('LEDs updated successfully!');
      
      // Wait 5 seconds so the user can see if the motherboard turned red
      log('Waiting 5 seconds for visual confirmation...');
      await new Promise(r => setTimeout(r, 5000));
    } else {
      log('No controllers detected.');
    }

  } catch (err) {
    log('ERROR: ' + err.message);
  } finally {
    log('Disconnecting...');
    client.disconnect();
    openRgbProcess.kill();
    log('--- TEST END ---');
    process.exit(0);
  }
}

runTest().catch(err => {
  log('FATAL ERROR: ' + err.stack);
  process.exit(1);
});
