const { Client } = require('openrgb-sdk');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'test_log.txt');
fs.writeFileSync(logFile, '--- RESIZE TEST START ---\n');

function log(msg) {
  console.log(msg);
  fs.appendFileSync(logFile, msg + '\n');
}

async function runTest() {
  log('Connecting to existing OpenRGB server on 6742...');
  const client = new Client('TestClient', 6742, '127.0.0.1');
  
  client.on('error', (err) => {
    log('[Client Error] ' + err.message);
  });

  try {
    await client.connect();
    log('Connected successfully!');

    let count = await client.getControllerCount();
    log(`Controller count: ${count}`);

    if (count > 0) {
      let device = await client.getControllerData(0);
      log(`Device 0: ${device.name}`);
      log(`Current active mode: ${device.modes[device.activeMode]?.name || device.activeMode}`);

      // Set to Direct mode if not already
      await client.updateMode(0, 'Direct');
      log('Set mode to Direct');

      // Check zones
      log('Current Zones:');
      device.zones.forEach(z => {
        log(`- Zone ${z.id} (${z.name}): ${z.ledsCount} LEDs (resizable: ${z.resizable})`);
      });

      // Resize all resizable zones with 0 LEDs to 80 LEDs
      for (const z of device.zones) {
        if (z.resizable && z.ledsCount === 0) {
          log(`Resizing Zone ${z.id} (${z.name}) to 80 LEDs...`);
          await client.resizeZone(0, z.id, 80);
        }
      }

      // Wait 1 second for settings to propagate
      await new Promise(r => setTimeout(r, 1000));

      // Refresh device data
      device = await client.getControllerData(0);
      log('Zones after resizing:');
      device.zones.forEach(z => {
        log(`- Zone ${z.id} (${z.name}): ${z.ledsCount} LEDs`);
      });

      log(`Total LEDs on device now: ${device.colors.length}`);

      // Update LEDs to red
      log('Updating all LEDs to Red...');
      const colors = new Array(device.colors.length).fill({ red: 255, green: 0, blue: 0 });
      await client.updateLeds(0, colors);
      log('LEDs updated successfully!');
    } else {
      log('No controllers detected.');
    }

  } catch (err) {
    log('ERROR: ' + err.message);
  } finally {
    log('Disconnecting...');
    client.disconnect();
    log('--- RESIZE TEST END ---');
    process.exit(0);
  }
}

runTest().catch(err => {
  log('FATAL ERROR: ' + err.stack);
  process.exit(1);
});
