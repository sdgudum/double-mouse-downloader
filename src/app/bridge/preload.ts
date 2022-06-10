import { contextBridge, ipcRenderer } from 'electron';
import bridgeConfig from './config';
import IFeature from './features/IFeature';
import { makeChannelName } from './utils';

interface JsBridge {
  [featureName: string]: {
    [apiName: string]: (...args: unknown[]) => Promise<unknown>;
  };
}

function createJsBridge(features: IFeature[]): JsBridge {
  const bridge: JsBridge = {};

  for (const feat of features) {
    bridge[feat.name] = {};
    Object.keys(feat.apis).forEach((apiName) => {
      bridge[feat.name][apiName] = (...args: unknown[]) => {
        const channelName = makeChannelName(feat.name, apiName);
        return ipcRenderer.invoke(channelName, ...args);
      };
    });
  }

  return bridge;
}

const jsBridge = createJsBridge(bridgeConfig.features);

contextBridge.exposeInMainWorld('jsBridge', jsBridge);
