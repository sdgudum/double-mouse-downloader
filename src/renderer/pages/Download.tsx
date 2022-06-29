import { Progress, Spin } from 'antd';
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  PropsWithChildren,
  ButtonHTMLAttributes,
  ReactNode,
  LiHTMLAttributes,
} from 'react';
import BilibiliVideo from 'src/types/models/BilibiliVideo';
import BilibiliVideoPage from 'src/types/models/BilibiliVideoPage';
import DownloadTaskVideo from 'src/types/models/DownloadTaskVideo';
import { DownloadTaskVideoPage } from 'src/types/models/DownloadTaskVideoPage';
import TextBadge from '../components/TextBadge';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import styles from './download.module.less';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  LoadingOutlined,
} from '@ant-design/icons';
import DownloadTask from 'src/types/models/DownloadTask';
import downloadSlice from '../redux/slices/donwload-slice';
import { cloneDeep } from 'lodash';
import { useAsyncEffect } from 'ahooks';

const Controllers: React.FC<{
  task: DownloadTask;
}> = ({ task }) => {
  const ariaMap = useAppSelector((state) => state.download.ariaMap);
  const taskMap = useAppSelector((state) => state.download.taskMap);
  const dispatch = useAppDispatch();

  const Button: React.FC<ButtonHTMLAttributes<HTMLButtonElement>> = ({
    children,
    style,
    ...props
  }) => {
    return (
      <button
        style={{
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          ...style,
        }}
        {...props}
      >
        {children}
      </button>
    );
  };

  const [removeButtonDisabledState, setRemoveButtonDisabledState] =
    useState(false);

  const pause = async () => {
    console.log('暂停');
    const newTask = cloneDeep(task);
    try {
      if (newTask.type === 'videoPage') {
        const ariaVideo = ariaMap[newTask.taskVideo.gid];
        const ariaAudio = ariaMap[newTask.taskAudio.gid];

        if (['active', 'waiting'].includes(ariaVideo.status)) {
          await jsBridge.aria2.invoke('aria2.pause', ariaVideo.gid);
          const newAriaVideo = cloneDeep(ariaVideo);
          newAriaVideo.status = 'paused';
          dispatch(downloadSlice.actions.putAriaItem(newAriaVideo));
        }

        if (['active', 'waiting'].includes(ariaAudio.status)) {
          await jsBridge.aria2.invoke('aria2.pause', ariaAudio.gid);
          const newAriaAudio = cloneDeep(ariaAudio);
          newAriaAudio.status = 'paused';
          dispatch(downloadSlice.actions.putAriaItem(newAriaAudio));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resume = async () => {
    console.log('继续下载');
    const newTask = cloneDeep(task);
    let shouldDispatchTask = false;

    if (newTask.type === 'videoPage') {
      let ariaVideo = ariaMap[newTask.taskVideo.gid];
      let ariaAudio = ariaMap[newTask.taskAudio.gid];

      if (newTask.taskStatus === 'error') {
        if (
          newTask.taskStatusMessage === '混流中断' ||
          newTask.taskStatusMessage === '混流失败'
        ) {
          // 继续混流
          const videoFilePath = ariaVideo.files[0].path;
          const audioFilePath = ariaAudio.files[0].path;
          const outFilePath = await jsBridge.path.join(
            ariaVideo.dir,
            newTask.taskFileName
          );

          newTask.taskStatus = 'merging';
          dispatch(downloadSlice.actions.putTask(cloneDeep(newTask)));

          try {
            await jsBridge.ffmpeg.merge(
              videoFilePath,
              audioFilePath,
              outFilePath
            );

            newTask.taskStatus = 'complete';
            dispatch(downloadSlice.actions.putTask(cloneDeep(newTask)));

            // 删除临时文件
            jsBridge.shell.rm(videoFilePath);
            jsBridge.shell.rm(audioFilePath);
          } catch (err) {
            console.error(err);
            newTask.taskStatus = 'error';
            newTask.taskStatusMessage = '混流失败';
            dispatch(downloadSlice.actions.putTask(cloneDeep(newTask)));
          }

          return;
        }
      }

      try {
        if (ariaVideo.status === 'paused') {
          await jsBridge.aria2.invoke('aria2.unpause', ariaVideo.gid);
        }
      } catch (err) {
        console.log('重新创建视频 Aria');
        // 恢复下载失败，原因为程序重新启动导致 gid 丢失，重新创建任务。
        if (ariaVideo.status !== 'complete') {
          const ariaVideoGid = await jsBridge.aria2.invoke(
            'aria2.addUri',
            newTask.taskVideo.uris,
            newTask.taskVideo.opts
          );
          const oldGid = newTask.taskVideo.gid;
          newTask.taskVideo.gid = ariaVideoGid;
          shouldDispatchTask = true;
          ariaVideo = await jsBridge.aria2.invoke(
            'aria2.tellStatus',
            newTask.taskVideo.gid
          );
          dispatch(downloadSlice.actions.putAriaItem(ariaVideo));

          setTimeout(() => {
            // 延迟移除旧 gid，不然报错。
            dispatch(downloadSlice.actions.removeAriaItem(oldGid));
          }, 500);
        }
      }

      try {
        if (ariaAudio.status === 'paused') {
          await jsBridge.aria2.invoke('aria2.unpause', ariaAudio.gid);
        }
      } catch (err) {
        console.log('重新创建音频 Aria');
        // 恢复下载失败，原因为程序重新启动导致 gid 丢失，重新创建任务。
        if (ariaAudio.status !== 'complete') {
          const ariaAudioGid = await jsBridge.aria2.invoke(
            'aria2.addUri',
            newTask.taskAudio.uris,
            newTask.taskAudio.opts
          );
          const oldGid = newTask.taskAudio.gid;
          newTask.taskAudio.gid = ariaAudioGid;
          shouldDispatchTask = true;
          ariaAudio = await jsBridge.aria2.invoke(
            'aria2.tellStatus',
            newTask.taskAudio.gid
          );
          dispatch(downloadSlice.actions.putAriaItem(ariaAudio));

          setTimeout(() => {
            // 移除旧 gid
            dispatch(downloadSlice.actions.removeAriaItem(oldGid));
          }, 500);
        }
      }
    }
    if (shouldDispatchTask) {
      dispatch(downloadSlice.actions.putTask(newTask));
    }
  };

  const openFolder = async () => {
    let dir;
    if (task.type === 'videoPage') {
      const gid = task.taskVideo.gid;
      const aria = ariaMap[gid];

      if (task.taskStatus === 'complete') {
        dir = await jsBridge.path.join(aria.dir, task.taskFileName);
      } else {
        dir = aria.files[0].path;
      }
    }

    if (!dir) return;

    await jsBridge.shell.showItemInFolder(dir);
  };

  const openFile = async () => {
    if (task.type === 'videoPage') {
      const gid = task.taskVideo.gid;
      const aria = ariaMap[gid];
      const filePath = await jsBridge.path.join(aria.dir, task.taskFileName);

      await jsBridge.shell.openPath(filePath);
    }
  };

  const remove = async () => {
    setRemoveButtonDisabledState(true);
    const result = await jsBridge.dialog.showMessageBox(location.href, {
      type: 'warning',
      title: '警告',
      message: '确定删除该任务 ？已下载的文件仍然会得到保留。',
      buttons: ['确定', '取消'],
    });
    const isYes = result.response === 0;

    setRemoveButtonDisabledState(false);

    if (!isYes) return;

    if (task.type === 'videoPage') {
      // 移除 aria 任务
      const videoAria = ariaMap[task.taskVideo.gid];
      const audioAria = ariaMap[task.taskAudio.gid];

      Promise.allSettled([
        jsBridge.aria2.invoke('aria2.forceRemove', videoAria.gid),
        jsBridge.aria2.invoke('aria2.forceRemove', audioAria.gid),
      ]).catch((err) => {
        // 不处理错误
      });

      // 更新状态
      const parentTask = cloneDeep(
        taskMap[task.taskParentId] as DownloadTaskVideo
      );
      parentTask.pages.splice(parentTask.pages.indexOf(task.taskId), 1);

      if (parentTask.pages.length === 0) {
        // 移除主任务
        dispatch(downloadSlice.actions.removeTask(task.taskParentId));
      } else {
        dispatch(downloadSlice.actions.putTask(parentTask));
      }
      dispatch(downloadSlice.actions.removeTask(task.taskId));
      dispatch(downloadSlice.actions.removeAriaItem(videoAria.gid));
      dispatch(downloadSlice.actions.removeAriaItem(audioAria.gid));
    }
  };

  let isPaused = false;
  let playButtonDisabled = false;
  let openButtonDisabled = false;
  let deleteButtonDisabled = false;

  if (task.type === 'videoPage') {
    const ariaVideo = ariaMap[task.taskVideo.gid];
    const ariaAudio = ariaMap[task.taskAudio.gid];
    isPaused =
      task.taskStatus === 'error' ||
      ariaVideo.status === 'paused' ||
      ariaAudio.status === 'paused';
    playButtonDisabled = ['merging', 'complete'].includes(task.taskStatus);
    openButtonDisabled = task.taskStatus !== 'complete';
    deleteButtonDisabled =
      removeButtonDisabledState || task.taskStatus === 'merging';
  }
  return (
    <section
      aria-label="下载控制"
      className={styles.controlButtons}
      style={{
        marginBottom: '.5em',
      }}
    >
      <Button
        aria-label={isPaused ? '继续' : '暂停'}
        onClick={isPaused ? resume : pause}
        disabled={playButtonDisabled}
      >
        <i className={`fa-solid fa-${isPaused ? 'play' : 'pause'}`} />{' '}
        {isPaused ? '继续' : '暂停'}
      </Button>
      <Button
        aria-label="打开"
        onClick={openFile}
        disabled={openButtonDisabled}
      >
        <i className="fa-solid fa-plane" /> 打开
      </Button>
      <Button aria-label="打开文件夹" onClick={openFolder}>
        <i className="fa-solid fa-folder" /> 打开文件夹
      </Button>
      <Button
        aria-label="删除"
        onClick={remove}
        disabled={deleteButtonDisabled}
        className={styles.deleteButton}
      >
        <i className="fa-solid fa-xmark" /> 删除
      </Button>
    </section>
  );
};

const DownloadProgress: React.FC<{
  label: string;
  aria: any;
  iconClassName: string;
}> = ({ label, aria, iconClassName }) => {
  const getProgressPercent = (aria: any) => {
    return parseFloat(
      ((aria.completedLength / aria.totalLength) * 100).toFixed(1)
    );
  };

  let status: 'normal' | 'active' | 'exception' | 'success' = 'normal';

  if (aria.status === 'error') {
    status = 'exception';
  } else if (aria.status === 'complete') {
    status = 'success';
  }

  const percent = getProgressPercent(aria);
  return (
    <div
      role="progressbar"
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={percent}
      aria-label={label}
      aria-valuetext={`${percent}% 已下载`}
      style={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <i
        className={iconClassName}
        style={{
          width: '1.7em',
          transform: 'translateY(.13em)',
          fontSize: '.8em',
        }}
      />
      <Progress
        status={status}
        size="small"
        percent={getProgressPercent(aria)}
      />
    </div>
  );
};

const VideoPage: React.FC<{
  pageTaskId: string;
}> = ({ pageTaskId }) => {
  const ariaMap = useAppSelector((state) => state.download.ariaMap);
  const taskMap = useAppSelector((state) => state.download.taskMap);
  const dispatch = useAppDispatch();

  const page = taskMap[pageTaskId] as DownloadTaskVideoPage;
  const videoAria = ariaMap[page.taskVideo.gid];
  const audioAria = ariaMap[page.taskAudio.gid];

  useAsyncEffect(async () => {
    const newTask = cloneDeep(page);
    let shouldDispatch = false;

    // 混流控制
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

        const noti = new Notification(`下载成功：${page.taskFileName}`, {
          body: '点击此处打开文件夹所在位置。',
        });

        noti.onclick = () => {
          jsBridge.shell.showItemInFolder(outputPath);
        };
      } catch (err) {
        console.error(err);
        newTask.taskStatus = 'error';
        newTask.taskStatusMessage = '混流失败';

        new Notification(`下载失败：${page.taskFileName}`, {
          body: newTask.taskStatusMessage,
        });
      }
      shouldDispatch = true;
    }

    if (shouldDispatch) {
      dispatch(downloadSlice.actions.putTask(newTask));
    }
  }, [page, videoAria, audioAria]);

  const statusTextMap = {
    active: (
      <span>
        <LoadingOutlined /> 下载中
      </span>
    ),
    paused: <span>已暂停</span>,
    waiting: '等待下载',
    merging: (
      <span>
        <LoadingOutlined /> 混流中
      </span>
    ),
    complete: (
      <span>
        <i
          style={{ color: '#52c41a', transform: 'translateY(.05em)' }}
          className="fa-solid fa-circle-check"
        />{' '}
        完成
      </span>
    ),
    error: (
      <span>
        <CloseCircleFilled
          style={{ color: 'red', transform: 'translateY(.05em)' }}
        />{' '}
        错误{page.taskStatusMessage && `：${page.taskStatusMessage}`}
      </span>
    ),
  };

  let status: keyof typeof statusTextMap;

  if (page.taskStatus === 'merging') {
    status = 'merging';
  } else if (page.taskStatus === 'complete') {
    status = 'complete';
  } else if (page.taskStatus === 'error') {
    status = 'error';
  } else if (videoAria.status === 'active' || audioAria.status === 'active') {
    status = 'active';
  } else if (videoAria.status === 'paused' || audioAria.status === 'paused') {
    status = 'paused';
  } else if (videoAria.status === 'waiting' && audioAria.status === 'waiting') {
    status = 'waiting';
  } else if (videoAria.status === 'error' || audioAria.status === 'error') {
    status = 'error';
  } else {
    status = 'active';
  }

  return (
    <li aria-label={`P${page.index} ${page.title}`}>
      <h2
        style={{
          fontSize: '1em',
          borderRadius: '.2em',
        }}
      >
        【P{page.index}】{page.title}
      </h2>
      <Controllers task={page} />
      <p
        aria-label="下载状态"
        style={{
          marginBottom: '.5em',
        }}
      >
        {statusTextMap[status]}
      </p>
      <section
        aria-label="下载进度"
        style={{
          paddingRight: '.5em',
        }}
      >
        <DownloadProgress
          aria={videoAria}
          label="视频轨下载进度"
          iconClassName="fa-solid fa-video"
        />
        <DownloadProgress
          aria={audioAria}
          label="音频轨下载进度"
          iconClassName="fa-solid fa-music"
        />
      </section>
    </li>
  );
};

const Video: React.FC<{
  task: DownloadTaskVideo;
}> = ({ task }) => {
  return (
    <Item aria-label={`视频 ${task.title}`}>
      <div
        style={{
          display: 'flex',
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        <div>
          <img
            alt="视频封面"
            style={{
              height: '6em',
            }}
            src={task.cover}
          />
        </div>
        <div
          style={{
            overflow: 'hidden',
            marginLeft: '1em',
            flexGrow: '1',
          }}
        >
          <h1
            style={{
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              fontSize: '1em',
            }}
          >
            <TextBadge
              style={{
                backgroundColor: 'rgb(253 107 162)',
                marginRight: '.2em',
                fontSize: '.9em',
                padding: '.1em .2em',
              }}
            >
              {task.id}
            </TextBadge>
            {task.title}
          </h1>
          <ul
            aria-label="分P列表"
            className={styles.videoPages}
            style={{
              margin: '0',
              padding: '0',
              listStyle: 'none',
            }}
          >
            {task.pages.map((pageTaskId) => (
              <VideoPage key={pageTaskId} pageTaskId={pageTaskId} />
            ))}
          </ul>
        </div>
      </div>
    </Item>
  );
};

const Item: React.FC<PropsWithChildren<LiHTMLAttributes<HTMLLIElement>>> = ({
  children,
  style,
  ...attrs
}) => {
  return (
    <li
      style={{
        background: 'white',
        borderRadius: '.2em',
        marginBottom: '1em',
        padding: '.5em',
        position: 'relative',
        ...style,
      }}
      {...attrs}
    >
      {children}
    </li>
  );
};

const DownloadPage: React.FC = () => {
  const state = useAppSelector((state) => state.download);

  return (
    <main
      style={{
        margin: '0 2em',
        height: '90%',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      <section aria-label="下载控制"></section>
      {state.index.length === 0 && (
        <p style={{ color: 'white' }}>啥也木有...</p>
      )}
      <ul
        aria-label="下载列表"
        style={{
          listStyle: 'none',
          margin: '0',
          padding: '0',
        }}
      >
        {state.index.map((taskId) => {
          const task = state.taskMap[taskId];

          if (task.type === 'video') return <Video key={taskId} task={task} />;

          return null;
        })}
      </ul>
    </main>
  );
};

export default DownloadPage;
