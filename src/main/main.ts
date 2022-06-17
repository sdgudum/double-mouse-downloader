import { app, BrowserWindow } from 'electron';
import path from 'path';
import { initBridge } from './bridge';
import {
  makeWindowControlEventName,
  windowControlEventEmitter,
  WINDOW_CLOSE,
  WINDOW_MINIMIZE,
} from './services/window-control';
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

  const win = new BrowserWindow({
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

  win.removeMenu();

  initBridge();

  // 监听主窗口控制事件
  windowControlEventEmitter.on(
    makeWindowControlEventName(WINDOW_CLOSE, 'main'),
    () => {
      win.close();
    }
  );

  windowControlEventEmitter.on(
    makeWindowControlEventName(WINDOW_MINIMIZE, 'main'),
    () => {
      win.minimize();
    }
  );

  // 事件注册
  if (process.env.NODE_ENV === 'development') {
    await installExtension([REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS]);
    win.once('show', () => win.webContents.openDevTools());
    // 开发环境加载开发服务器 URL
    win.loadURL('http://localhost:3000/');
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  win.once('ready-to-show', () => win.show());
  app.on('window-all-closed', () => app.quit());
}

main();
