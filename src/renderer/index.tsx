import { useMount } from 'ahooks';
import { Tabs, Badge } from 'antd';
import 'antd/dist/antd.css';
import React, { FC } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import LoginStatus from './components/LoginStatus';
import TitleBar from './components/TitleBar';
import './index.less';
import ConfigPage from './pages/Config';
import HomePage from './pages/Home';
import { useAppDispatch } from './redux/hooks';
import { fetchConfigAction } from './redux/slices/config-slice';
import store from './redux/store';

const Root: FC = () => {
  const dispatch = useAppDispatch();

  useMount(() => {
    dispatch(fetchConfigAction());
  });
  return (
    <div
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

const App: FC = () => {
  return (
    <Provider store={store}>
      <Root />
    </Provider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('app') as HTMLElement);
root.render(<App />);
