import BilibiliVideo from './BilibiliVideo';
import DownloadTaskBase from './DownloadTaskBase';
import { DownloadTaskVideoPage } from './DownloadTaskVideoPage';

interface DownloadTaskVideo extends BilibiliVideo, DownloadTaskBase {
  pages: DownloadTaskVideoPage[];
}

export default DownloadTaskVideo;
