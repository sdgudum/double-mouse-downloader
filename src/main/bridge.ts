import { ipcMain } from 'electron';
import bilibiliService from './services/bilibili';
import configService from './services/config-service';
import contextMenuService from './services/context-menu';
import dialogService from './services/dialog';
import openInBrowserService from './services/open-in-browser';
import windowControlService from './services/window-control';

export const bridgeMap = {
  [bilibiliService.name]: bilibiliService,
  [contextMenuService.name]: contextMenuService,
  [openInBrowserService.name]: openInBrowserService,
  [windowControlService.name]: windowControlService,
  [configService.name]: configService,
  [dialogService.name]: dialogService,
};

export function initBridge() {
  Object.values(bridgeMap).forEach((service) => {
    Object.entries(service.fns).forEach(([apiName, apiFn]) => {
      ipcMain.handle(makeChannelName(service.name, apiName), (ev, ...args) =>
        (apiFn as any)(...args)
      );
    });
  });
}

export function makeChannelName(featureName: string, apiName: string): string {
  return `${featureName}:${apiName}`;
}
