import BilibiliVideo from './modal/BilibiliVideo';

export interface WindowControlFeatureApis {
  close(windowName: string): void;
  minimize(windowName: string): void;
}

export interface OpenInBrowserFeatureApis {
  open: (url: string) => Promise<void>;
}

export interface BilibiliFeatureApis {
  getVideoInfo: (bvid: string) => Promise<BilibiliVideo>;
}

export interface ContextMenuApis {
  show: (opts: any[]) => Promise<string>;
}
