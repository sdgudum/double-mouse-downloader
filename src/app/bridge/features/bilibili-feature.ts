import IFeature from './IFeature';
import { getVideoInfo } from '../../services/bilibili-service';
import BilibiliVideo from 'src/types/modal/BilibiliVideo';

const bilibiliFeature: IFeature = {
  name: 'bilibili',
  apis: {
    async getVideoInfo(ev, bvid: string): Promise<BilibiliVideo> {
      return getVideoInfo(bvid);
    },
  },
};

export default bilibiliFeature;
