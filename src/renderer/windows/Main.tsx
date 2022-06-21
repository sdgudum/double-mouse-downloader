import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useMount } from 'ahooks';
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

const MainWindow: React.FC = () => {
  const dispatch = useAppDispatch();

  useMount(() => {
    dispatch(fetchConfigAction());
    dispatch(fetchSelfInfoAction());

    jsBridge.config.getAll().then((config) => {
      // 自动检查更新
      if (config.update.autoCheck) dispatch(fetchReleaseInfoAction());
    });
  });
  return (
    <div
      className={styles.mainWindow}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
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
                aria-label="下载队列（3个下载中）"
                size="small"
                count={3}
                style={{}}
              >
                下载队列
              </Badge>
            }
            key="download-queue"
          >
            下载队列
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
