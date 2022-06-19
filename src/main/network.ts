import { dynamicImport } from 'tsimportlib';
import { CookieJar } from 'tough-cookie';
import { HttpProxyAgent, HttpsProxyAgent } from 'hpagent';
import { getSystemProxy } from 'os-proxy-config';
import configService from './services/config-service';

export const cookieJar = new CookieJar();

export async function getGotInstance() {
  const got = (await dynamicImport('got', module)) as typeof import('got');
  const proxyConfig = (await configService.fns.getAll()).proxy;

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

  const httpAgent = proxyUrl
    ? new HttpProxyAgent({
      proxy: proxyUrl,
    })
    : undefined;

  const httpsAgent = proxyUrl
    ? new HttpsProxyAgent({
      proxy: proxyUrl,
    })
    : undefined;

  return got.default.extend({
    headers: {
      'user-agent': 'Mozilla/5.0',
      referer: 'https://www.bilibili.com/',
    },
    cookieJar,
    agent: {
      http: httpAgent,
      https: httpsAgent,
    },
  });
}
