import { app, BrowserWindow } from 'electron';
import path from 'path';
import initBridge from './bridge/init-bridge';

async function main() {
  await app.whenReady();

  const win = new BrowserWindow({
    width: 800,
    height: 494,
    webPreferences: {
      preload: path.join(__dirname, './bridge/preload.js'),
    },
    resizable: false,
    show: false,
    title: '鼠鼠下载器',
  });

  win.removeMenu();
  win.once('ready-to-show', () => win.show());

  initBridge();

  if (process.env.NODE_ENV === 'development') {
    win.once('show', () => {
      win.webContents.openDevTools();
    });
    // 开发环境加载开发服务器 URL
    win.loadURL('http://localhost:3000/');
  } else {
    win.loadFile(path.join(__dirname, '../views/index.html'));
  }
  app.on('window-all-closed', () => app.quit());
}

main();
