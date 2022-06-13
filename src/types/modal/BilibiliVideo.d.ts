import BilibiliUser from './BilibiliUser';
import BilibiliVideoPage from './BilibiliVideoPage';

interface BilibiliVideo {
  type: 'video';
  bvid: string;
  cover: string;
  title: string;
  needVip: boolean;
  upUser: BilibiliUser;
  pages: BilibiliVideoPage[];
}

export default BilibiliVideo;
