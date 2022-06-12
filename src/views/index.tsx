import { Tabs } from 'antd';
import 'antd/dist/antd.css';
import React, { FC } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import TitleBar from './components/TitleBar';
import './index.less';
import MainPage from './pages/Main';
import './public/assets/css/font-awesome/all.css';
import store from './redux/store';

const App: FC = () => {
  return (
    <Provider store={store}>
      <TitleBar />
      <Tabs defaultActiveKey="home" className="ant-menu-override" animated>
        <Tabs.TabPane tab="主页" key="home">
          <MainPage />
        </Tabs.TabPane>
        <Tabs.TabPane tab="下载队列" key="download-queue">
          下载队列
        </Tabs.TabPane>
        <Tabs.TabPane tab="设置" key="settings">
          设置
        </Tabs.TabPane>
      </Tabs>
    </Provider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('app') as HTMLElement);
root.render(<App />);
