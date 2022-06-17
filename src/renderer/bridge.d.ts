import {
  BilibiliApis,
  ConfigApis,
  ContextMenuApis,
  DialogApis,
  OpenInBrowserApis,
  WindowControlApis,
} from '../types/bridge-apis';

interface JsBridge {
  openInBrowser: OpenInBrowserApis;
  windowControl: WindowControlApis;
  bilibili: BilibiliApis;
  contextMenu: ContextMenuApis;
  config: ConfigApis;
  dialog: DialogApis;
}

declare global {
  declare interface Window {
    jsBridge: JsBridge;
  }

  declare const jsBridge: JsBridge;
}
