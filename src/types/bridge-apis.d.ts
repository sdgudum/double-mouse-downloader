import bilibiliService from '../main/services/bilibili';
import contextMenuService from '../main/services/context-menu';
import openInBrowserService from '../main/services/open-in-browser';
import windowControlService from '../main/services/window-control';

export type WindowControlApis = typeof windowControlService.fns;
export type OpenInBrowserApis = typeof openInBrowserService.fns;
export type BilibiliApis = typeof bilibiliService.fns;
export type ContextMenuApis = typeof contextMenuService.fns;
