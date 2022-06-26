import { CookieJar } from 'tough-cookie';
import { getSystemProxy } from 'os-proxy-config';
import configService from './services/config-service';
import crypto from 'crypto';
import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';

export const cookieJar = new CookieJar();

export async function getAxiosInstance() {
  const config = await configService.fns.getAll();

  // CookieJar 初始化
  if (config.cookieString) {
    config.cookieString
      .split(';')
      .filter((cookie) => !!cookie.trim())
      .forEach((cookie) =>
        cookieJar.setCookieSync(
          `${cookie}; Domain=.bilibili.com`,
          'https://www.bilibili.com/'
        )
      );
  } else {
    cookieJar.setCookieSync(
      `buvid3=${crypto.randomUUID()}; Domain=.bilibili.com`,
      'https://www.bilibili.com/'
    );
  }

  const proxyConfig = config.proxy;

  let proxyUrl = '';

  if (proxyConfig.enable) {
    if (proxyConfig.useSystemProxy) {
      const systemProxy = await getSystemProxy();
      if (systemProxy && systemProxy.proxyUrl.startsWith('http')) {
        proxyUrl = systemProxy.proxyUrl;
      }
    } else {
      proxyUrl = proxyConfig.url;
    }
  }

  const proxy = proxyUrl ? new URL(proxyUrl) : null;

  return wrapper(
    axios.create({
      headers: {
        'user-agent': 'Mozilla/5.0',
        referer: 'https://www.bilibili.com/',
      },
      jar: cookieJar,
      responseType: 'json',
      proxy: proxy
        ? {
          host: proxy.hostname,
          port: parseInt(proxy.port),
          protocol: proxy.protocol,
          auth:
              proxy.username && proxy.password
                ? {
                  username: proxy.username,
                  password: proxy.password,
                }
                : undefined,
        }
        : false,
    })
  );
}
