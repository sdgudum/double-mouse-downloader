import {
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
}

declare global {
  declare interface Window {
    jsBridge: JsBridge;
    initGeetest: (...args: any) => any;
  }

  declare const jsBridge: JsBridge;
  declare const initGeetest: (...args: any) => any;
}
