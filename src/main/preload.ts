import { contextBridge, ipcRenderer } from 'electron';
import { bridges, makeChannelName } from './bridge';

const callbackMap = new Map<string, Map<any, any>>();

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
    const wrappedCallback = (ev: Electron.IpcRendererEvent, ...args: any[]) => {
      callback(...args);
    };
    ipcRenderer.on(channel, wrappedCallback);

    const m = callbackMap.get(channel) || new Map();
    m.set(callback, wrappedCallback);
  };

  bridge.once = (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.once(channel, (ev, ...args) => {
      callback(...args);
    });
  };

  bridge.off = (channel: string, callback: (...args: any[]) => void) => {
    const m = callbackMap.get(channel);

    if (!m) return;

    const wrappedCallback = m.get(callback);

    if (!wrappedCallback) return;

    m.delete(callback);
    ipcRenderer.off(channel, wrappedCallback);
  };

  return bridge;
}

contextBridge.exposeInMainWorld('jsBridge', createJsBridge());
