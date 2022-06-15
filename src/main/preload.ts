import { contextBridge, ipcRenderer } from 'electron';
import { makeChannelName } from './bridge';
import config from './config';

interface JsBridge {
  [serviceName: string]: {
    [apiName: string]: (...args: any) => Promise<any>;
  };
}

function createJsBridge(): JsBridge {
  const bridge: JsBridge = {};

  Object.values(config.bridge).forEach((service) => {
    bridge[service.name] = {};

    Object.keys(service.fns).forEach((fnName) => {
      bridge[service.name][fnName] = (...args) =>
        ipcRenderer.invoke(makeChannelName(service.name, fnName), ...args);
    });
  });

  return bridge;
}

contextBridge.exposeInMainWorld('jsBridge', createJsBridge());
