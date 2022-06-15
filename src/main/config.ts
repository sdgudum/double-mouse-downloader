import bilibiliService from './services/bilibili';
import contextMenuService from './services/context-menu';
import openInBrowserService from './services/open-in-browser';
import windowControlService from './services/window-control';

const config = {
  bridge: {
    [bilibiliService.name]: bilibiliService,
    [contextMenuService.name]: contextMenuService,
    [openInBrowserService.name]: openInBrowserService,
    [windowControlService.name]: windowControlService,
  },
};

export default config;
