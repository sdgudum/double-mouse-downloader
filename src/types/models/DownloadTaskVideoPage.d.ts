import AriaTaskConfig from './AriaTaskConfig';
import BilibiliVideoPage from './BilibiliVideoPage';
import DownloadTaskBase from './DownloadTaskBase';

interface DownloadTaskVideoPage extends BilibiliVideoPage, DownloadTaskBase {
  taskVideo: AriaTaskConfig;
  taskAudio: AriaTaskConfig;
  taskStatus: 'downloading' | 'merging' | 'complete';
  taskFileName: string;
}
