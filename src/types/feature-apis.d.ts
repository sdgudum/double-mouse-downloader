import BilibiliResource from './modal/BilibiliResource';
import Pagination from './modal/Pagination';

export interface WindowControlFeatureApis {
  close(windowName: string): void;
  minimize(windowName: string): void;
}

export interface OpenInBrowserFeatureApis {
  open: (url: string) => Promise<void>;
}

export interface BilibiliFeatureApis {
  collectResources: (
    text: string,
    page?: number
  ) => Promise<Pagination<BilibiliResource[]>>;
}

export interface ContextMenuApis {
  show: (opts: any[]) => Promise<string>;
}
