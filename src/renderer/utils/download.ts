import filenamify from 'filenamify';
import { cloneDeep, groupBy } from 'lodash';
import pupa from 'pupa';
import BilibiliVideo from 'src/types/models/BilibiliVideo';
import DownloadTaskBilibiliVideo from 'src/types/models/DownloadTaskBilibiliVideo';
import DownloadTaskBilibiliVideoPage from 'src/types/models/DownloadTaskBilibiliVideoPage';
import DownloadTaskVideoBase from 'src/types/models/DownloadTaskVideoBase';
import VideoFileNameTemplate from 'src/types/models/VideoFileNameTemplate';
import downloadSlice from '../redux/slices/donwload-slice';
import store from '../redux/store';

/**
 * 下载视频
 * @param video
 * @return 创建的下载任务
 */
export async function downloadVideo(
  video: BilibiliVideo,
  savePath: string
): Promise<DownloadTaskBilibiliVideo> {
  const config = store.getState().config.data;
  if (!config) throw new Error('无法获取配置');

  // 创建视频任务
  const task: DownloadTaskBilibiliVideo = {
    ...video,
    taskId: crypto.randomUUID(),
    pages: [],
  };

  // 创建分 P 任务

  for (const page of video.pages) {
    let downloadInfoResp: any;
    try {
      downloadInfoResp = await jsBridge.bilibili.getVideoPlayUrl(
        task.id,
        page.cid.toString()
      );

      if (downloadInfoResp.code !== 0) {
        console.error(downloadInfoResp);
        throw new Error(downloadInfoResp.message);
      }
    } catch (err: any) {
      jsBridge.dialog.showMessageBox(location.href, {
        title: '错误',
        message: `视频 ${task.id} p${page.index} 获取下载链接错误，已跳过下载。\n原因：${err.message}`,
        type: 'error',
      });
      continue;
    }

    const filename = filenamify(
      pupa(
        `${config.download.videoFileNamePattern}.mp4`,
        {
          bvid: video.id,
          title: video.title,
          ownerName: video.owner.name,
          ownerUid: video.owner.uid,
          pageIndex: page.index.toString(),
          pageTitle: page.title,
        } as VideoFileNameTemplate,
        {
          ignoreMissing: true,
        }
      )
    );

    const downloadInfo = downloadInfoResp.data;

    // 视频下载链接取出，如果没有匹配的 dash 则取品质最高的那个。
    const videoDashs = groupBy(downloadInfo.dash.video, (v) => v.id);
    const videoQualities = Object.keys(videoDashs).map((k) => parseInt(k));
    videoQualities.sort((a, b) => a - b);
    const videoQualityUsed: number =
      videoQualities.find((q) => q >= config.download.videoQuality) ||
      (videoQualities.at(-1) as number);
    const videoDash =
      videoDashs[videoQualityUsed.toString()].find((dash) =>
        dash.codecs.startsWith(config.download.videoCodec)
      ) || videoDashs[videoQualityUsed.toString()][0];

    // 音频下载链接取出，如果没有匹配的 dash 则取品质最高的那个。
    const audioDashs: any[] = downloadInfo.dash.audio;
    audioDashs.sort((a, b) => a.id - b.id);
    const audioDash =
      audioDashs.find((dash) => dash.id >= config.download.audioQuality) ||
      audioDashs.at(-1);

    const commonAriaOpts = {
      header: {
        'user-agent': 'Mozilla/5.0',
        cookie: config.cookieString,
      },
      referer: 'https://www.bilibili.com/',
    };
    // 初始化任务
    const pageTask: DownloadTaskBilibiliVideoPage = {
      ...page,
      taskStatus: 'active',
      taskFileName: filename,
      taskId: crypto.randomUUID(),
      taskVideo: {
        gid: '',
        uris: [videoDash.baseUrl, ...(videoDash.backupUrl || [])],
        opts: {
          out: `${filename}.video`,
          dir: savePath,
          ...commonAriaOpts,
        },
      },
      taskAudio: {
        gid: '',
        uris: [audioDash.baseUrl, ...(audioDash.backupUrl || [])],
        opts: {
          out: `${filename}.audio`,
          dir: savePath,
          ...commonAriaOpts,
        },
      },
      taskParentId: task.taskId,
    };

    pageTask.taskVideo.gid = await jsBridge.aria2.invoke(
      'aria2.addUri',
      pageTask.taskVideo.uris,
      pageTask.taskVideo.opts
    );
    pageTask.taskAudio.gid = await jsBridge.aria2.invoke(
      'aria2.addUri',
      pageTask.taskAudio.uris,
      pageTask.taskAudio.opts
    );

    const [[videoAria], [audioAria]] = await jsBridge.aria2.invoke(
      'system.multicall',
      [
        { methodName: 'aria2.tellStatus', params: [pageTask.taskVideo.gid] },
        { methodName: 'aria2.tellStatus', params: [pageTask.taskAudio.gid] },
      ]
    );

    task.pages.push(pageTask.taskId);
    store.dispatch(downloadSlice.actions.putTask(pageTask));
    store.dispatch(downloadSlice.actions.putAriaItem(videoAria));
    store.dispatch(downloadSlice.actions.putAriaItem(audioAria));

    store.dispatch(downloadSlice.actions.putTask(cloneDeep(task)));
  }

  return task;
}

export async function mergeVideoIfCompleted(
  task: DownloadTaskVideoBase
): Promise<void> {
  const ariaMap = store.getState().download.ariaMap;
  const dispatch = store.dispatch;
  const videoAria = ariaMap[task.taskVideo.gid];
  const audioAria = ariaMap[task.taskAudio.gid];
  const newTask = cloneDeep(task);

  if (
    newTask.taskStatus === 'active' &&
    videoAria.status === 'complete' &&
    audioAria.status === 'complete'
  ) {
    newTask.taskStatus = 'merging';
    dispatch(downloadSlice.actions.putTask(cloneDeep(newTask)));

    try {
      const videoPath = videoAria.files[0].path;
      const audioPath = audioAria.files[0].path;
      const outputPath = await jsBridge.path.join(
        videoAria.dir,
        newTask.taskFileName
      );

      await jsBridge.ffmpeg.merge(videoPath, audioPath, outputPath);

      newTask.taskStatus = 'complete';

      // 移除临时文件
      jsBridge.shell.rm(videoPath);
      jsBridge.shell.rm(audioPath);

      const noti = new Notification(`下载成功：${task.taskFileName}`, {
        body: '点击此处打开文件夹所在位置。',
      });

      noti.onclick = () => {
        jsBridge.shell.showItemInFolder(outputPath);
      };
    } catch (err) {
      console.error(err);
      newTask.taskStatus = 'error';
      newTask.taskStatusMessage = '混流失败';

      new Notification(`下载失败：${task.taskFileName}`, {
        body: newTask.taskStatusMessage,
      });
    }
    dispatch(downloadSlice.actions.putTask(newTask));
  }
}
