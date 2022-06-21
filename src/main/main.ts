import { app, BrowserWindow } from 'electron';
import path from 'path';
import { initBridge } from './bridge';
import { bindWindowEvent } from './services/window-control';
import installExtension, {
  REACT_DEVELOPER_TOOLS,
  REDUX_DEVTOOLS,
} from 'electron-devtools-installer';
import configService, { getStore } from './services/config-service';
import fs from 'fs';

async function main() {
  await app.whenReady();

  // 配置
  const store = getStore();

  // 创建保存路径的文件夹
  const savePath = store.get('download.path');

  if (!fs.existsSync(savePath)) {
    await fs.promises.mkdir(savePath, {
      recursive: true,
    });
  }

  const mainWindow = new BrowserWindow({
    width: 800,
    height: 494,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    resizable: false,
    show: false,
    title: '鼠鼠下载器',
    fullscreenable: false,
    frame: false,
  });

  mainWindow.removeMenu();

  initBridge();

  // 监听主窗口控制事件
  bindWindowEvent(mainWindow, 'main');

  // 事件注册
  if (process.env.NODE_ENV === 'development') {
    await installExtension([REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS]);
    mainWindow.once('show', () => mainWindow.webContents.openDevTools());
    // 开发环境加载开发服务器 URL
    mainWindow.loadURL('http://localhost:3000/');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.once('ready-to-show', () => mainWindow.show());
  app.on('browser-window-created', (ev, window) => {
    window.removeMenu();

    if (process.env.NODE_ENV === 'development') {
      window.once('show', () => window.webContents.openDevTools());
    }
    window.once('ready-to-show', () => {
      // 绑定 windowControl 事件。
      const url = new URL(window.webContents.getURL());

      // Hash 代表窗口名字
      if (url.hash) {
        bindWindowEvent(window, url.hash.slice(1));
      }
    });
  });
  app.on('window-all-closed', () => app.quit());
}

main();
