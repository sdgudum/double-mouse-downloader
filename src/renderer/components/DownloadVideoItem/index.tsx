import { useAsyncEffect } from 'ahooks';
import { cloneDeep } from 'lodash';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import downloadSlice from '../../redux/slices/donwload-slice';
import DownloadTaskBilibiliVideo from 'src/types/models/DownloadTaskBilibiliVideo';
import styles from './index.module.less';
import { CloseCircleFilled, LoadingOutlined } from '@ant-design/icons';
import DownloadTaskControllers from '../DownloadTaskControllers';
import DownloadProgress from '../DownloadProgress';
import TextBadge from '../TextBadge';
import DownloadGroupItem from '../DownloadGroupItem';
import DownloadTaskBilibiliVideoPage from 'src/types/models/DownloadTaskBilibiliVideoPage';
import { mergeVideoIfCompleted } from '../../utils/download';

const VideoPage: React.FC<{
  pageTaskId: string;
}> = ({ pageTaskId }) => {
  const ariaMap = useAppSelector((state) => state.download.ariaMap);
  const taskMap = useAppSelector((state) => state.download.taskMap);
  const dispatch = useAppDispatch();

  const page = taskMap[pageTaskId] as DownloadTaskBilibiliVideoPage;
  const videoAria = ariaMap[page.taskVideo.gid];
  const audioAria = ariaMap[page.taskAudio.gid];

  useAsyncEffect(async () => {
    // 混流控制
    await mergeVideoIfCompleted(page);
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
    <li
      style={{
        padding: '.5em',
      }}
      aria-label={`P${page.index} ${page.title}`}
    >
      <h2
        style={{
          fontSize: '1em',
          borderRadius: '.2em',
        }}
      >
        【P{page.index}】{page.title}
      </h2>
      <DownloadTaskControllers task={page} />
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

export interface DownloadVideoItemProps {
  task: DownloadTaskBilibiliVideo;
}

const DownloadVideoItem: React.FC<DownloadVideoItemProps> = ({ task }) => {
  const title = (
    <>
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
    </>
  );
  return (
    <DownloadGroupItem cover={task.cover} title={title}>
      <ul
        className={styles.subTasks}
        style={{
          listStyle: 'none',
          margin: '0',
          padding: '0',
        }}
      >
        {task.pages.map((pageTaskId) => (
          <VideoPage key={pageTaskId} pageTaskId={pageTaskId} />
        ))}
      </ul>
    </DownloadGroupItem>
  );
};

export default DownloadVideoItem;
