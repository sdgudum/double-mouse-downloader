import { ipcMain } from 'electron';
import config from './config';

export function initBridge() {
  Object.values(config.bridge).forEach((service) => {
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
