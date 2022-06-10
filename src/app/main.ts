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

  if (process.env.NODE_ENV === 'development') {
    // 开发环境加载开发服务器 URL
    win.loadURL('http://localhost:3000/');
  } else {
    win.loadFile(path.join(__dirname, '../views/index.html'));
  }
  app.on('window-all-closed', () => app.quit());
}

main();
