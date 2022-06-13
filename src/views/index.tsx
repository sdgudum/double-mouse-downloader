import { Tabs, Badge } from 'antd';
import 'antd/dist/antd.css';
import React, { FC } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import LoginStatus from './components/LoginStatus';
import TitleBar from './components/TitleBar';
import './index.less';
import MainPage from './pages/Main';
import store from './redux/store';

const App: FC = () => {
  return (
    <Provider store={store}>
      <TitleBar />
      <div
        style={{
          position: 'relative',
        }}
      >
        <Tabs defaultActiveKey="home" className="ant-menu-override" animated>
          <Tabs.TabPane tab="主页" key="home">
            <MainPage />
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
    </Provider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('app') as HTMLElement);
root.render(<App />);
