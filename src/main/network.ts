import { dynamicImport } from 'tsimportlib';

export async function getGotInstance() {
  const got = (await dynamicImport('got', module)) as typeof import('got');
  // TODO: 读取配置
  return got.default.extend({
    headers: {
      'user-agent': 'Mozilla/5.0',
      referer: 'https://www.bilibili.com/',
    },
  });
}
