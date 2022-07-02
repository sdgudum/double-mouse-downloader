import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAsyncEffect, useMount } from 'ahooks';
import { Tabs, Badge } from 'antd';
import 'antd/dist/antd.css';
import LoginStatus from '../components/LoginStatus';
import TitleBar from '../components/TitleBar';
import ConfigPage from '../pages/Config';
import HomePage from '../pages/Home';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchConfigAction } from '../redux/slices/config-slice';
import { fetchReleaseInfoAction } from '../redux/slices/update-slice';
import './main.less';
import styles from './main.module.less';
import { fetchSelfInfoAction } from '../redux/slices/login-status-slice';
import DownloadPage from '../pages/Download';
import AriaStateManager from '../components/AriaStateManager';
import { DownloadTaskVideoPage } from 'src/types/models/DownloadTaskVideoBase';
import { cloneDeep } from 'lodash';
import downloadSlice from '../redux/slices/donwload-slice';
import store from '../redux/store';

const MainWindow: React.FC = () => {
  const dispatch = useAppDispatch();
  const downloadInfo = useAppSelector((state) => state.download);

  let downloadingCount = 0;
  const taskMap = downloadInfo.taskMap;

  for (const task of Object.values(taskMap)) {
    if (task.type === 'videoPage') {
      const ariaVideo = downloadInfo.ariaMap[task.taskVideo.gid];
      const ariaAudio = downloadInfo.ariaMap[task.taskAudio.gid];
      if (
        ['active', 'merging'].includes(task.taskStatus) &&
        ariaVideo.status !== 'paused' &&
        ariaAudio.status !== 'paused'
      ) {
        downloadingCount++;
      }
    }
  }

  useMount(() => {
    dispatch(fetchConfigAction());
    dispatch(fetchSelfInfoAction());

    jsBridge.config.getAll().then((config) => {
      // 自动检查更新
      if (config.update.autoCheck) dispatch(fetchReleaseInfoAction());
    });
  });

  useEffect(() => {
    const handler = (ev: BeforeUnloadEvent) => {
      // 处理窗口即将关闭事件
      if (downloadingCount > 0) {
        ev.returnValue = false;

        jsBridge.dialog
          .showMessageBox(location.href, {
            title: '警告',
            type: 'warning',
            message: `还有 ${downloadingCount} 个任务正在下载，确认关闭？`,
            buttons: ['取消', '确认'],
          })
          .then(async (result) => {
            // 获取最新状态
            const state = store.getState();
            if (result.response === 1) {
              // 暂停所有任务
              try {
                for (const task of Object.values(state.download.taskMap)) {
                  if (task.type === 'videoPage') {
                    if (task.taskStatus === 'merging') {
                      // 混流中断，视为出错
                      const newTask = cloneDeep(task);
                      newTask.taskStatus = 'error';
                      newTask.taskStatusMessage = '混流中断';
                      dispatch(downloadSlice.actions.putTask(newTask));
                    } else if (task.taskStatus === 'active') {
                      const ariaVideo =
                        downloadInfo.ariaMap[task.taskVideo.gid];
                      const ariaAudio =
                        downloadInfo.ariaMap[task.taskAudio.gid];

                      if (['active', 'waiting'].includes(ariaVideo.status)) {
                        await jsBridge.aria2.invoke(
                          'aria2.pause',
                          ariaVideo.gid
                        );
                        const newAria = cloneDeep(ariaVideo);
                        newAria.status = 'paused';
                        dispatch(downloadSlice.actions.putAriaItem(newAria));
                      }

                      if (['active', 'waiting'].includes(ariaAudio.status)) {
                        await jsBridge.aria2.invoke(
                          'aria2.pause',
                          ariaAudio.gid
                        );
                        const newAria = cloneDeep(ariaAudio);
                        newAria.status = 'paused';
                        dispatch(downloadSlice.actions.putAriaItem(newAria));
                      }
                    }
                  }
                }
              } catch (err) {
                console.error(err);
              }
              // 关闭程序
              await jsBridge.windowControl.close(location.hash, true);
            }
          });
      }
    };
    window.addEventListener('beforeunload', handler);

    return () => {
      window.removeEventListener('beforeunload', handler);
    };
  }, [downloadingCount, downloadInfo]);

  return (
    <div
      className={styles.mainWindow}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <AriaStateManager />
      <TitleBar />
      <div
        style={{
          position: 'relative',
          flexGrow: '1',
          maxHeight: '100%',
          overflow: 'hidden',
        }}
      >
        <Tabs defaultActiveKey="home" className="ant-menu-override" animated>
          <Tabs.TabPane tab="主页" key="home">
            <HomePage />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <Badge
                aria-label={`下载队列（${downloadingCount}个下载中）`}
                size="small"
                count={downloadingCount}
                style={{}}
              >
                下载队列
              </Badge>
            }
            key="download-queue"
          >
            <DownloadPage />
          </Tabs.TabPane>
          <Tabs.TabPane tab="设置" key="config">
            <ConfigPage />
          </Tabs.TabPane>
        </Tabs>
        <LoginStatus />
      </div>
    </div>
  );
};

export default MainWindow;
