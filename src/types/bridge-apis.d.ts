import configService from '../main/services/config-service';
import dialogService from '../main/services/dialog';
import bilibiliService from '../main/services/bilibili';
import contextMenuService from '../main/services/context-menu';
import openInBrowserService from '../main/services/open-in-browser';
import windowControlService from '../main/services/window-control';
import githubService from '../main/services/github';

export type WindowControlApis = typeof windowControlService.fns;
export type OpenInBrowserApis = typeof openInBrowserService.fns;
export type BilibiliApis = typeof bilibiliService.fns;
export type ContextMenuApis = typeof contextMenuService.fns;
export type ConfigApis = typeof configService.fns;
export type DialogApis = typeof dialogService.fns;
export type GithubApis = typeof githubService.fns;
