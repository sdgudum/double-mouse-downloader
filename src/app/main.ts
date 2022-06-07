import { app, BrowserWindow } from 'electron';
import path from 'path';

async function main() {
  await app.whenReady();

  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, './bridge/preload.js'),
    },
    resizable: false,
  });

  win.loadFile(path.join(__dirname, '../views/index.html'));

  app.on('window-all-closed', () => app.quit());
}

main();
