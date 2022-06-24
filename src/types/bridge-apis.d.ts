import configService from '../main/services/config-service';
import dialogService from '../main/services/dialog';
import bilibiliService from '../main/services/bilibili';
import contextMenuService from '../main/services/context-menu';
import shellService from '../main/services/shell';
import windowControlService from '../main/services/window-control';
import githubService from '../main/services/github';
import aria2Service from '../main/services/aria2';
import pathService from '../main/services/path';

export type WindowControlApis = typeof windowControlService.fns;
export type ShellApis = typeof shellService.fns;
export type BilibiliApis = typeof bilibiliService.fns;
export type ContextMenuApis = typeof contextMenuService.fns;
export type ConfigApis = typeof configService.fns;
export type DialogApis = typeof dialogService.fns;
export type GithubApis = typeof githubService.fns;
export type Aria2Apis = typeof aria2Service.fns;
export type pathApis = typeof pathService.fns;
