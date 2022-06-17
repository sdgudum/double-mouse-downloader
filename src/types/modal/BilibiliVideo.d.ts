import BilibiliUser from './BilibiliUser';
import BilibiliVideoPage from './BilibiliVideoPage';

interface BilibiliVideo {
  type: 'video';
  id: string;
  cover: string;
  title: string;
  needVip: boolean;
  owner: BilibiliUser;
  pages: BilibiliVideoPage[];
}

export default BilibiliVideo;
