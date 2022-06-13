import IFeature from './IFeature';
import BilibiliResource from '../../../types/modal/BilibiliResource';
import Pagination from '../../../types/modal/Pagination';
import { getVideoInfo } from '../../services/bilibili-service';

function extractBvid(text: string): string | null {
  let bvid: string | null = null;

  if (/^BV\w{10}$/.test(text)) {
    // BV1GJ411x7h7
    bvid = text;
  } else {
    try {
      const url = new URL(text);

      if (
        ['http:', 'https:'].includes(url.protocol) &&
        ['bilibili.com', 'www.bilibili.com', 'm.bilibili.com'].includes(
          url.hostname
        )
      ) {
        // 确保 B 站域名

        // https://www.bilibili.com/video/BV1GJ411x7h7
        const match = url.pathname.match(/^\/video\/(BV\w{10})\/?$/);

        if (match) {
          bvid = match[1];
        }
      }
    } catch (err) {
      /** 不处理 URL 解析错误 */
    }
  }

  return bvid;
}

const bilibiliFeature: IFeature = {
  name: 'bilibili',
  apis: {
    async collectResources(
      ev,
      text: string,
      page = 0
    ): Promise<Pagination<BilibiliResource[]>> {
      const trimmedText = text.trim();

      // 视频
      const bvid = extractBvid(trimmedText);
      if (bvid) {
        return {
          currentPage: 0,
          totalPage: 1,
          totalCount: 1,
          pageData: [await getVideoInfo(bvid)],
        };
      }

      throw new Error('不支持的资源类型。');
    },
  },
};

export default bilibiliFeature;
