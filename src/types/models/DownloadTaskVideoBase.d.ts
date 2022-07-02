import AriaTaskConfig from './AriaTaskConfig';
import DownloadTaskBase from './DownloadTaskBase';

/**
 * 音视频下载任务
 */
interface DownloadTaskVideoBase extends DownloadTaskBase {
  taskVideo: AriaTaskConfig;
  taskAudio: AriaTaskConfig;
  taskStatus: 'active' | 'merging' | 'error' | 'complete';
  taskStatusMessage?: string;
  taskFileName: string;
  taskParentId: string;
}

export default DownloadTaskVideoBase;
