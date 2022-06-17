import { contextBridge, ipcRenderer } from 'electron';
import { bridgeMap, makeChannelName } from './bridge';

interface JsBridge {
  [serviceName: string]: {
    [apiName: string]: (...args: any) => Promise<any>;
  };
}

function createJsBridge(): JsBridge {
  const bridge: JsBridge = {};

  Object.values(bridgeMap).forEach((service) => {
    bridge[service.name] = {};

    Object.keys(service.fns).forEach((fnName) => {
      bridge[service.name][fnName] = (...args) =>
        ipcRenderer.invoke(makeChannelName(service.name, fnName), ...args);
    });
  });

  return bridge;
}

contextBridge.exposeInMainWorld('jsBridge', createJsBridge());
