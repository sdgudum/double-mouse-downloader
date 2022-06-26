import { app, BrowserWindow, dialog, shell } from 'electron';
import path from 'path';
import { initBridge } from './bridge';
import { bindWindowEvent } from './services/window-control';
import installExtension, {
  REACT_DEVELOPER_TOOLS,
  REDUX_DEVTOOLS,
} from 'electron-devtools-installer';
import configService, { getStore } from './services/config-service';
import fs from 'fs';
import { initAria2cRpc } from './services/aria2';
import { configureLog4js, reportCrash } from './log';

async function main() {
  configureLog4js();

  await app.whenReady();

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

  // 上单实例锁
  if (app.requestSingleInstanceLock()) {
    app.on('second-instance', () => {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    });
  } else {
    // 第二个实例，退出。
    app.quit();
    return;
  }

  initBridge();

  // 服务注册
  await initAria2cRpc();

  // 绑定主窗口控制事件
  bindWindowEvent(mainWindow, '#/main');

  // 事件注册
  mainWindow.once('ready-to-show', () => mainWindow.show());

  if (process.env.NODE_ENV === 'development') {
    await installExtension([REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS]);
    mainWindow.once('show', () => mainWindow.webContents.openDevTools());
    // 开发环境加载开发服务器 URL
    await mainWindow.loadURL('http://localhost:3000/#/main');
  } else {
    await mainWindow.loadFile('./build/renderer/index.html', {
      hash: '#/main',
    });
  }

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
        bindWindowEvent(window, url.hash);
      }
    });
  });
  app.on('window-all-closed', () => app.quit());
}

async function crash(err: Error) {
  const crashFilePath = await reportCrash({
    name: err.name,
    message: err.message,
    stack: err.stack,
  });
  dialog.showErrorBox(
    '程序出现了错误',
    `${err.message}\n崩溃报告位置：${crashFilePath}`
  );
  process.exit(-1);
}

main().catch(crash);

process.on('uncaughtException', crash);
