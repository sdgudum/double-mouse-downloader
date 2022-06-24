import { Progress, Spin } from 'antd';
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  PropsWithChildren,
  ButtonHTMLAttributes,
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

const Controllers: React.FC<{
  task: DownloadTask;
}> = ({ task }) => {
  const ariaMap = useAppSelector((state) => state.download.ariaMap);

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

  // const pause = () => {};

  // const resume = () => {};

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

  let isPaused = false;
  let playButtonDisabled = false;
  let openButtonDisabled = false;

  if (task.type === 'videoPage') {
    const ariaVideo = ariaMap[task.taskVideo.gid];
    const ariaAudio = ariaMap[task.taskAudio.gid];
    isPaused = ariaVideo.status === 'paused' || ariaAudio.status === 'paused';
    playButtonDisabled = task.taskStatus !== 'downloading';
    openButtonDisabled = task.taskStatus !== 'complete';
  }
  return (
    <p
      className={styles.controlButtons}
      style={{
        marginBottom: '.5em',
      }}
    >
      <Button disabled={playButtonDisabled}>
        <i className="fa-solid fa-pause" /> {isPaused ? '继续' : '暂停'}
      </Button>
      <Button disabled={openButtonDisabled}>
        <i className="fa-solid fa-plane" /> 打开
      </Button>
      <Button onClick={openFolder}>
        <i className="fa-solid fa-folder" /> 打开文件夹
      </Button>
      <Button
        style={{
          color: 'red',
        }}
      >
        <i className="fa-solid fa-xmark" /> 删除
      </Button>
    </p>
  );
};

function progressStatusFormatter(percent?: number) {
  if (percent === undefined) return null;

  return percent === 100 ? (
    <CheckCircleFilled />
  ) : (
    <span>{percent?.toFixed(1)}%</span>
  );
}

const VideoPage: React.FC<{
  page: DownloadTaskVideoPage;
}> = ({ page }) => {
  const ariaMap = useAppSelector((state) => state.download.ariaMap);
  const dispatch = useAppDispatch();
  const videoAria = ariaMap[page.taskVideo.gid];
  const audioAria = ariaMap[page.taskAudio.gid];

  useEffect(() => {
    if (
      page.taskStatus === 'downloading' &&
      videoAria.status === 'complete' &&
      audioAria.status === 'complete'
    ) {
      // TODO 开始混流
      const newTask = cloneDeep(page);
      newTask.taskStatus = 'merging';
      dispatch(downloadSlice.actions.putTask(newTask));
    }
  }, [page, videoAria, audioAria]);

  const statusTextMap = {
    downloading: (
      <span>
        <LoadingOutlined /> 下载中
      </span>
    ),
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
        下载错误
      </span>
    ),
  };

  return (
    <li
      style={{
        marginTop: '1em',
      }}
    >
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
        style={{
          marginBottom: '.5em',
        }}
      >
        {statusTextMap[page.taskStatus]}
      </p>
      <div
        style={{
          paddingRight: '.5em',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <i
            className="fa-solid fa-video"
            style={{
              width: '1.7em',
              transform: 'translateY(.13em)',
              fontSize: '.8em',
            }}
          />
          <Progress
            format={progressStatusFormatter}
            aria-label="视频轨下载进度"
            size="small"
            percent={(videoAria.completedLength / videoAria.totalLength) * 100}
          />
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <i
            className="fa-solid fa-music"
            style={{
              width: '1.7em',
              transform: 'translateY(.13em)',
              fontSize: '.8em',
            }}
          />
          <Progress
            format={progressStatusFormatter}
            aria-label="音频轨下载进度"
            size="small"
            percent={(audioAria.completedLength / audioAria.totalLength) * 100}
          />
        </div>
      </div>
    </li>
  );
};

const Video: React.FC<{
  task: DownloadTaskVideo;
}> = ({ task }) => {
  return (
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
          style={{
            margin: '0',
            padding: '0',
            listStyle: 'none',
          }}
        >
          {task.pages.map((page) => (
            <VideoPage key={page.taskId} page={page} />
          ))}
        </ul>
      </div>
    </div>
  );
};

const Item: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <li
      style={{
        background: 'white',
        borderRadius: '.2em',
        marginBottom: '1em',
        padding: '.5em',
        position: 'relative',
      }}
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

          if (task.type === 'video')
            return (
              <Item key={taskId}>
                <Video task={task} />
              </Item>
            );

          return null;
        })}
      </ul>
    </main>
  );
};

export default DownloadPage;
