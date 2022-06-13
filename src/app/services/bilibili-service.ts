import BilibiliVideo from 'src/types/modal/BilibiliVideo';
import network from '../network';

export async function getVideoInfo(bvid: string): Promise<BilibiliVideo> {
  const resp = await network.get(
    'https://api.bilibili.com/x/web-interface/view',
    {
      responseType: 'json',
      params: {
        bvid,
      },
    }
  );

  if (resp.data.code !== 0) throw new Error(resp.data.message);

  const data = resp.data.data;

  return {
    type: 'video',
    bvid: data.bvid,
    cover: data.pic,
    title: data.title,
    upUser: {
      uid: data.owner.mid,
      avatar: data.owner.face,
      name: data.owner.name,
    },
    needVip: !!data.rights.pay,
    pages: (data.pages as any[]).map((p) => ({
      cid: p.cid,
      index: p.page,
      title: p.part,
    })),
  };
}
