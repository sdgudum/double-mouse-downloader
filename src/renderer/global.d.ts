import {
  Aria2Apis,
  BilibiliApis,
  ConfigApis,
  ContextMenuApis,
  DialogApis,
  GithubApis,
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
  github: GithubApis;
  aria2: Aria2Apis;
  on: (channel: string, callback: (...args: any[]) => void) => void;
  once: (channel: string, callback: (...args: any[]) => void) => void;
  off: (channel: string, callback: (...args: any[]) => void) => void;
}

declare global {
  declare interface Window {
    jsBridge: JsBridge;
    initGeetest: (...args: any) => any;
  }

  declare const jsBridge: JsBridge;
  declare const initGeetest: (...args: any) => any;
}
