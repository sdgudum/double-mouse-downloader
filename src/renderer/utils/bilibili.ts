import BilibiliVideo from 'src/types/models/BilibiliVideo';

export function detectResource(text: string): {
  type: 'video' | 'bangumiEpisode' | 'bangumiMedia' | 'bangumiSeason';
  id: string;
} | null {
  const trimmedText = text.trim();

  // 资源 ID 测试

  // 视频 BV 号：BV1GJ411x7h7
  if (/^BV\w{10}$/.test(trimmedText)) {
    return {
      type: 'video',
      id: text,
    };
  }

  // 番剧 media_id：md28231846
  if (/^md\d+$/i.test(trimmedText)) {
    return {
      type: 'bangumiMedia',
      id: trimmedText.slice(2),
    };
  }

  // 番剧 season_id：ss36204
  if (/^ss\d+$/i.test(trimmedText)) {
    return {
      type: 'bangumiSeason',
      id: trimmedText.slice(2),
    };
  }
  // 番剧 episode_id：ep374717
  if (/^ep\d+$/i.test(trimmedText)) {
    return {
      type: 'bangumiEpisode',
      id: trimmedText.slice(2),
    };
  }

  try {
    // URL 检测
    const url = new URL(trimmedText);

    if (['http:', 'https:'].includes(url.protocol)) {
      // 确保 B 站域名
      if (
        ['bilibili.com', 'www.bilibili.com', 'm.bilibili.com'].includes(
          url.hostname
        )
      ) {
        const pathname = url.pathname;
        let match: RegExpMatchArray | null = null;

        // 视频链接：https://www.bilibili.com/video/BV1GJ411x7h7
        match = pathname.match(/^\/video\/(BV\w{10})\/?$/);

        if (match) {
          return {
            type: 'video',
            id: match[1],
          };
        }

        // 番剧 media_id 链接：https://www.bilibili.com/bangumi/media/md28231846/
        match = pathname.match(/^\/bangumi\/media\/md(\d+)\/?$/);

        if (match) {
          return {
            type: 'bangumiMedia',
            id: match[1],
          };
        }

        // 番剧 season_id 链接：https://www.bilibili.com/bangumi/play/ss36204/
        match = pathname.match(/\/bangumi\/play\/ss(\d+)\/?/);

        if (match) {
          return {
            type: 'bangumiSeason',
            id: match[1],
          };
        }

        // 番剧 episode_id 链接：https://www.bilibili.com/bangumi/play/ep374717
        match = pathname.match(/\/bangumi\/play\/ep(\d+)\/?/);

        if (match) {
          return {
            type: 'bangumiEpisode',
            id: match[1],
          };
        }
      }
    }
  } catch (err) {
    /** 不处理 URL 解析错误 */
  }

  return null;
}

export function convertToBilibiliVideo(videoInfoResp: any): BilibiliVideo {
  const video: BilibiliVideo = {
    id: videoInfoResp.bvid,
    cover: videoInfoResp.pic,
    needVip: !!videoInfoResp.rights.pay,
    needPay: !!videoInfoResp.rights.arc_pay,
    pages: videoInfoResp.pages.map((p: any) => ({
      type: 'videoPage',
      cid: p.cid,
      index: p.page,
      title: p.part,
    })),
    title: videoInfoResp.title,
    type: 'video',
    owner: {
      avatar: videoInfoResp.owner.face,
      uid: videoInfoResp.owner.mid,
      name: videoInfoResp.owner.name,
    },
  };

  return video;
}
