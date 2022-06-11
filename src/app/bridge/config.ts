import IFeature from './features/IFeature';
import openInBrowserFeature from './features/open-in-browser-feature';
import windowControlFeature from './features/window-control-feature';

interface BridgeConfig {
  features: IFeature[];
}

const bridgeConfig: BridgeConfig = {
  /** 启用的特性列表 */
  features: [openInBrowserFeature, windowControlFeature],
};

export default bridgeConfig;
