import {
  BilibiliFeatureApis,
  ContextMenuApis,
  OpenInBrowserFeatureApis,
  WindowControlFeatureApis,
} from '../types/feature-apis';

interface JsBridge {
  openInBrowser: OpenInBrowserFeatureApis;
  windowControl: WindowControlFeatureApis;
  bilibili: BilibiliFeatureApis;
  contextMenu: ContextMenuApis;
}

declare global {
  declare interface Window {
    jsBridge: JsBridge;
  }

  declare const jsBridge: JsBridge;
}
