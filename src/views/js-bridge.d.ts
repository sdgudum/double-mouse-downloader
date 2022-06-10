import { OpenInBrowserFeatureApis } from '../app/bridge/features/open-in-browser-feature';

interface JsBridge {
  openInBrowser: OpenInBrowserFeatureApis;
}

declare global {
  declare interface Window {
    jsBridge: JsBridge;
  }

  declare const jsBridge: JsBridge;
}
