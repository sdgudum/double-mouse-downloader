import {
  BilibiliApis,
  ContextMenuApis,
  OpenInBrowserApis,
  WindowControlApis,
} from '../types/bridge-apis';

interface JsBridge {
  openInBrowser: OpenInBrowserApis;
  windowControl: WindowControlApis;
  bilibili: BilibiliApis;
  contextMenu: ContextMenuApis;
}

declare global {
  declare interface Window {
    jsBridge: JsBridge;
  }

  declare const jsBridge: JsBridge;
}
