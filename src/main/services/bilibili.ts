import BilibiliVideo from 'src/types/modal/BilibiliVideo';
import { getGotInstance } from '../network';
import IService from './IService';

const fns = {
  async getVideoInfo(bvid: string): Promise<any> {
    const got = await getGotInstance();
    return (await got
      .get('https://api.bilibili.com/x/web-interface/view', {
        searchParams: {
          bvid,
        },
      })
      .json()) as any;
  },

  async getVideoPlayUrl(bvid: string, cid: string) {
    const got = await getGotInstance();
    return (await got
      .get('https://api.bilibili.com/x/player/playurl', {
        searchParams: {
          cid,
          bvid,
          fourk: 1,
          otype: 'json',
          fnver: 0,
          fnval: 976,
        },
      })
      .json()) as any;
  },
};

const bilibiliService: IService<typeof fns> = {
  name: 'bilibili',
  fns,
};

export default bilibiliService;
