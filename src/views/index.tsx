import { Tabs, Badge } from 'antd';
import 'antd/dist/antd.css';
import React, { FC } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import LoginStatus from './components/LoginStatus';
import TitleBar from './components/TitleBar';
import './index.less';
import HomePage from './pages/Home';
import store from './redux/store';

const App: FC = () => {
  return (
    <Provider store={store}>
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
          }}
        >
          <Tabs defaultActiveKey="home" className="ant-menu-override" animated>
            <Tabs.TabPane tab="主页" key="home">
              <HomePage />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={
                <Badge size="small" count={3} style={{}}>
                  下载队列
                </Badge>
              }
              key="download-queue"
            >
              下载队列
            </Tabs.TabPane>
            <Tabs.TabPane tab="设置" key="settings">
              设置
            </Tabs.TabPane>
          </Tabs>
          <LoginStatus />
        </div>
      </div>
    </Provider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('app') as HTMLElement);
root.render(<App />);
