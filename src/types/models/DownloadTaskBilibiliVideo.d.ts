import BilibiliVideo from './BilibiliVideo';
import DownloadTaskBase from './DownloadTaskBase';
import { DownloadTaskVideoPage } from './DownloadTaskVideoBase';

interface DownloadTaskBilibiliVideo extends BilibiliVideo, DownloadTaskBase {
  pages: string[];
}

export default DownloadTaskBilibiliVideo;
