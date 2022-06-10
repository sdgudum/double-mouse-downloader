import { ipcMain } from 'electron';
import bridgeConfig from './config';
import { makeChannelName } from './utils';

export default function initBridge() {
  bridgeConfig.features.forEach((feat) => {
    Object.entries(feat.apis).forEach(([apiName, apiFn]) => {
      ipcMain.handle(makeChannelName(feat.name, apiName), apiFn);
    });
  });
}
