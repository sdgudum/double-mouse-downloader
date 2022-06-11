import { OpenInBrowserFeatureApis } from '../app/bridge/features/open-in-browser-feature';
import { WindowControlFeatureApis } from '../app/bridge/features/window-control-feature';

interface JsBridge {
  openInBrowser: OpenInBrowserFeatureApis;
  windowControl: WindowControlFeatureApis;
}

declare global {
  declare interface Window {
    jsBridge: JsBridge;
  }

  declare const jsBridge: JsBridge;
}
