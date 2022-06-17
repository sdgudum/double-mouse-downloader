import IService from './IService';
import Store from 'electron-store';
import {
  AudioQuality,
  VideoQuality,
} from '../../common/constants/media-quality';
import { app } from 'electron';
import path from 'path';
import Config from '../../types/modal/Config';

let store: Store<any>;

export function getStore() {
  if (!store) {
    store = new Store({
      clearInvalidConfig: true,
      schema: {
        download: {
          type: 'object',
          description: '下载配置',
          properties: {
            videoFileNamePattern: {
              type: 'string',
              description: '文件名格式（不包含扩展名）',
              default: '{BV号}-p{分P索引}-{视频标题}-{分P标题}',
              // 确保是合法文件名
              pattern: '^[^<>:"/\\\\|?*]+$',
            },
            path: {
              type: 'string',
              description: '默认下载路径',
              default: path.join(app.getPath('downloads'), '鼠鼠下载器'),
            },
            showDownloadGuidance: {
              type: 'boolean',
              description: '显示下载引导',
              default: true,
            },
            videoQuality: {
              type: 'number',
              description: '默认视频清晰度',
              default: VideoQuality.FHD_60P.id,
            },
            audioQuality: {
              type: 'number',
              description: '默认音频品质',
              default: AudioQuality.HIGH.id,
            },
          },
          // 这样写才会生成默认配置，下同
          default: {},
        },
        proxy: {
          type: 'object',
          description: '代理配置',
          properties: {
            enable: {
              type: 'boolean',
              description: '启用代理',
              default: true,
            },
            useSystemProxy: {
              type: 'boolean',
              description: '使用系统代理',
              default: true,
            },
            url: {
              type: 'string',
              description: '代理 URL',
              default: 'http://127.0.0.1:7890',
              format: 'uri',
            },
          },
          default: {},
        },
        cookieString: {
          type: 'string',
          description: 'B 站登录后的 CookieString，不展示在配置页。',
          default: '',
        },
      },
    });
  }

  return store;
}

// 这样写是防止 preload 脚本调用时引用了 electron.app.getPath 而引起的报错。

const fns = {
  set: async (key: string, value: any) => getStore().set(key, value),
  // @ts-ignore
  getAll: async () => getStore().get() as Promise<Config>,
  reset: async (...keys: string[]) => getStore().reset(...keys),
};

const configService: IService<typeof fns> = {
  name: 'config',
  fns,
};

export default configService;
