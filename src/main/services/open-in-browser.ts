import { shell } from 'electron';
import IService from './IService';

const fns = {
  async open(url: string) {
    shell.openExternal(url);
  },
};

const openInBrowserService: IService<typeof fns> = {
  name: 'openInBrowser',
  fns,
};

export default openInBrowserService;
