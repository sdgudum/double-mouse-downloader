import { app, BrowserWindow } from 'electron';
import path from 'path';
import initBridge from './bridge/init-bridge';
import {
  WindowControlEvent,
  windowControlEventEmitter,
  WINDOW_CLOSE_EVENT,
  WINDOW_MINIMIZE_EVENT,
} from './services/window-control-service';

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
    fullscreenable: false,
    frame: false,
  });

  win.removeMenu();

  initBridge();

  // 监听主窗口控制事件
  windowControlEventEmitter.on(
    WINDOW_CLOSE_EVENT,
    ({ windowName }: WindowControlEvent) => {
      if (windowName === 'main') {
        win.close();
      }
    }
  );

  windowControlEventEmitter.on(
    WINDOW_MINIMIZE_EVENT,
    ({ windowName }: WindowControlEvent) => {
      if (windowName === 'main') {
        win.minimize();
      }
    }
  );

  // 事件注册
  if (process.env.NODE_ENV === 'development') {
    win.once('show', () => win.webContents.openDevTools());
    // 开发环境加载开发服务器 URL
    win.loadURL('http://localhost:3000/');
  } else {
    win.loadFile(path.join(__dirname, '../views/index.html'));
  }

  win.once('ready-to-show', () => win.show());
  app.on('window-all-closed', () => app.quit());
}

main();
