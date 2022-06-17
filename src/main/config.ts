import bilibiliService from './services/bilibili';
import configService from './services/config-service';
import contextMenuService from './services/context-menu';
import openInBrowserService from './services/open-in-browser';
import windowControlService from './services/window-control';

const config = {
  bridge: {
    [bilibiliService.name]: bilibiliService,
    [contextMenuService.name]: contextMenuService,
    [openInBrowserService.name]: openInBrowserService,
    [windowControlService.name]: windowControlService,
    [configService.name]: configService,
  },
};

export default config;
