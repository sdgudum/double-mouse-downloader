import { useSet, useSize, useToggle } from 'ahooks';
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  PropsWithChildren,
  ButtonHTMLAttributes,
} from 'react';
import BilibiliVideo from '../../../types/models/BilibiliVideo';
import OuterLink from '../OuterLink';
import ResourceListItem from '../ResourceListItem';
import TextBadge from '../TextBadge';
import styles from './index.module.less';
import filenamify from 'filenamify';
import DownloadTaskVideo from '../../../types/models/DownloadTaskVideo';
import BilibiliVideoPage from '../../../types/models/BilibiliVideoPage';
import pupa from 'pupa';
import VideoFileNameTemplate from '../../../types/models/VideoFileNameTemplate';
import { DownloadTaskVideoPage } from '../../../types/models/DownloadTaskVideoPage';
import { groupBy } from 'lodash';
import { useAppDispatch } from '../../redux/hooks';
import downloadSlice from '../../redux/slices/donwload-slice';

export interface ResourceVideoProps {
  resource: BilibiliVideo;
}

const ResourceVideo: React.FC<ResourceVideoProps> = ({ resource }) => {
  const [pageListExpanded, { toggle: togglePageListExpanded }] = useToggle();
  const pageListRef = useRef<HTMLDivElement>(null);
  const pageListSize = useSize(pageListRef);
  const dispatch = useAppDispatch();

  const [
    selectedPageSet,
    { add: addSelectedPage, remove: removeSelectedPage },
  ] = useSet<BilibiliVideoPage>();

  const selectAllPages = () => {
    resource.pages.forEach((page) => addSelectedPage(page));
  };

  const invertSelectedPages = () => {
    resource.pages.forEach((page) =>
      selectedPageSet.has(page)
        ? removeSelectedPage(page)
        : addSelectedPage(page)
    );
  };

  const saveCoverPicture = async (video: BilibiliVideo) => {
    const url = new URL(video.cover);
    const ext = await jsBridge.path.extname(
      url.pathname.split('/').pop() as string
    );
    const filename = `${video.id} - ${filenamify(video.title)}${ext}`;
    const saveDialogReturnValue = await jsBridge.dialog.showSaveDialog({
      defaultPath: filename,
    });
    const savePath = saveDialogReturnValue.filePath;

    if (!savePath) return;
    const gid = await jsBridge.aria2.invoke('aria2.addUri', [url.href], {
      out: await jsBridge.path.basename(savePath),
      dir: await jsBridge.path.dirname(savePath),
    });

    const onDownloadComplete = (event: any) => {
      if (event.gid !== gid) return;

      const noti = new Notification('保存封面成功', {
        body: `${savePath}\n点我打开封面所在路径。`,
      });

      noti.onclick = () => jsBridge.shell.showItemInFolder(savePath);
      jsBridge.off('aria2.onDownloadComplete', onDownloadComplete);
    };

    const onDownloadError = (event: any) => {
      if (event.gid !== gid) return;

      new Notification('保存封面失败', {
        body: `${savePath}\n请稍后再尝试一下。`,
      });
      jsBridge.off('aria2.onDownloadError', onDownloadError);
    };

    jsBridge.on('aria2.onDownloadError', onDownloadError);
    jsBridge.on('aria2.onDownloadComplete', onDownloadComplete);
  };

  const startDownload = async (userPickPath = false) => {
    const config = await jsBridge.config.getAll();
    let savePath = config.download.path;

    if (userPickPath) {
      // 用户选择保存路径
      const result = await jsBridge.dialog.showOpenDialog({
        properties: ['openDirectory'],
      });

      if (result.filePaths.length === 0) return;

      savePath = result.filePaths[0];
    }

    // 创建分 P 任务

    const pageTasks: DownloadTaskVideoPage[] = [];

    for (const page of selectedPageSet.values()) {
      let downloadInfoResp: any;
      try {
        downloadInfoResp = await jsBridge.bilibili.getVideoPlayUrl(
          resource.id,
          page.cid.toString()
        );

        if (downloadInfoResp.code !== 0) {
          console.error(downloadInfoResp);
          throw new Error(downloadInfoResp.message);
        }
      } catch (err: any) {
        jsBridge.dialog.showMessageBox(location.href, {
          title: '错误',
          message: `视频 ${resource.id} p${page.index} 获取下载链接错误，已跳过下载。\n原因：${err.message}`,
          type: 'error',
        });
        continue;
      }

      const filename = filenamify(
        pupa(
          `${config.download.videoFileNamePattern}.mp4`,
          {
            bvid: resource.id,
            title: resource.title,
            ownerName: resource.owner.name,
            ownerUid: resource.owner.uid,
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
      const pageTask: DownloadTaskVideoPage = {
        ...page,
        taskStatus: 'downloading',
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

      pageTasks.push(pageTask);
    }

    // 创建视频任务
    const task: DownloadTaskVideo = {
      ...resource,
      taskId: crypto.randomUUID(),
      pages: pageTasks,
    };

    dispatch(downloadSlice.actions.putTask(task));
  };

  const OperationButton: React.FC<
    PropsWithChildren & ButtonHTMLAttributes<HTMLButtonElement>
  > = ({ children, style, ...attrs }) => {
    return (
      <button
        style={{
          border: 'none',
          background: 'none',
          fontSize: '.9em',
          cursor: 'pointer',
          ...style,
        }}
        {...attrs}
      >
        {children}
      </button>
    );
  };

  return (
    <ResourceListItem
      aria-label={`视频-${resource.title}`}
      style={{
        padding: '.5em',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
        }}
      >
        <OuterLink
          aria-label="封面"
          href={`https://www.bilibili.com/video/${resource.id}`}
          style={{
            overflow: 'hidden',
            height: '6em',
            flexShrink: '0',
            position: 'relative',
          }}
        >
          <img
            alt="封面"
            src={resource.cover}
            style={{
              height: '100%',
              borderRadius: '.2em',
            }}
          />
          <div
            className={styles.videoCoverMask}
            style={{
              position: 'absolute',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '2em',
              height: '100%',
              width: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              top: '0',
            }}
          >
            <i className="fa-regular fa-circle-play" />
          </div>
        </OuterLink>
        <div
          style={{
            marginLeft: '.5em',
            overflow: 'hidden',
            width: '100%',
          }}
        >
          <div
            style={{
              maxWidth: '100%',
            }}
          >
            <h1
              aria-label="标题"
              style={{
                fontSize: '1em',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              <TextBadge
                style={{
                  backgroundColor: 'rgb(253 107 162)',
                  marginRight: '.2em',
                  fontSize: '.95em',
                  padding: '.1em .2em',
                }}
              >
                {resource.id}
              </TextBadge>
              <span title={resource.title}>{resource.title}</span>
            </h1>
            <div
              aria-label="分P操作"
              style={{
                marginBottom: '.5em',
              }}
            >
              <OperationButton onClick={selectAllPages}>全选</OperationButton>
              <OperationButton onClick={invertSelectedPages}>
                反选
              </OperationButton>
              <OperationButton onClick={() => saveCoverPicture(resource)}>
                保存封面
              </OperationButton>
              <OperationButton
                onClick={() => startDownload(false)}
                aria-label="下载"
                style={{
                  color: '#3c83ff',
                }}
              >
                <i className="fa-solid fa-download" /> 下载
              </OperationButton>
              <OperationButton
                onClick={() => startDownload(true)}
                aria-label="下载到..."
                style={{
                  color: '#3c83ff',
                }}
              >
                <i className="fa-solid fa-download" /> 下载到...
              </OperationButton>
            </div>
            <div>
              <div
                aria-label="分P列表"
                style={{
                  height: pageListExpanded
                    ? `${pageListSize?.height || '0'}px`
                    : '2em',
                  transition: 'height .3s',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    position: 'relative',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '.5em',
                  }}
                  ref={pageListRef}
                >
                  {resource.pages.map((page, i) => (
                    <button
                      title={`【P${page.index}】${page.title}`}
                      onClick={() =>
                        selectedPageSet.has(page)
                          ? removeSelectedPage(page)
                          : addSelectedPage(page)
                      }
                      aria-hidden={pageListExpanded ? true : i >= 2}
                      role="checkbox"
                      key={page.cid}
                      style={{
                        border: '1px solid #ccc',
                        borderRadius: '.2em',
                        padding: '.2em .5em',
                        fontSize: '.9em',
                        color: selectedPageSet.has(page) ? 'white' : 'black',
                        background: selectedPageSet.has(page)
                          ? '#579cff'
                          : 'none',
                        transition: 'all .1s',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {`【P${page.index}】${page.title}`}
                    </button>
                  ))}
                </div>
              </div>
              {resource.pages.length > 2 && (
                <button
                  aria-label={`${
                    pageListExpanded ? '收起' : '展开'
                  }全部分P列表`}
                  onClick={() => togglePageListExpanded()}
                  style={{
                    display: 'block',
                    border: 'none',
                    width: '100%',
                    color: 'grey',
                    fontSize: '.8em',
                    textAlign: 'center',
                    background:
                      'linear-gradient(0deg, white, rgba(255, 255, 255, 0))',
                    position: 'relative',
                    zIndex: '1',
                    cursor: 'pointer',
                    paddingTop: '1em',
                  }}
                >
                  {pageListExpanded ? '收起' : '展开'}全部{' '}
                  <i
                    className={`fa-solid fa-angles-${
                      pageListExpanded ? 'up' : 'down'
                    }`}
                  ></i>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </ResourceListItem>
  );
};

export default ResourceVideo;
