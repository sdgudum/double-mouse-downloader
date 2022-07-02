import { cloneDeep } from 'lodash';
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  ButtonHTMLAttributes,
} from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import downloadSlice from '../../redux/slices/donwload-slice';
import DownloadTask from 'src/types/models/DownloadTask';
import DownloadTaskBilibiliVideo from 'src/types/models/DownloadTaskBilibiliVideo';
import styles from './index.module.less';
import { mergeVideoIfCompleted } from '../../utils/download';

export interface DownloadTaskControllersProps {
  task: DownloadTask;
}

const DownloadTaskControllers: React.FC<DownloadTaskControllersProps> = ({
  task,
}) => {
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
          await mergeVideoIfCompleted(task);
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
      buttons: ['取消', '确定'],
    });
    const isYes = result.response === 1;

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
        taskMap[task.taskParentId] as DownloadTaskBilibiliVideo
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

export default DownloadTaskControllers;
