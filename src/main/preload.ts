import { contextBridge, ipcRenderer } from 'electron';
import { bridges, makeChannelName } from './bridge';

function createJsBridge(): any {
  const bridge: any = {};

  bridges.forEach((service) => {
    bridge[service.name] = {};

    Object.keys(service.fns).forEach((fnName) => {
      bridge[service.name][fnName] = (...args: any[]) =>
        ipcRenderer.invoke(makeChannelName(service.name, fnName), ...args);
    });
  });

  bridge.on = (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (ev, ...args) => {
      callback(...args);
    });
  };

  bridge.once = (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.once(channel, (ev, ...args) => {
      callback(...args);
    });
  };

  bridge.off = (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.off(channel, callback);
  };

  return bridge;
}

contextBridge.exposeInMainWorld('jsBridge', createJsBridge());
