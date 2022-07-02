import 'antd/dist/antd.css';
import React, { FC } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import './index.less';
import LoginWindow from './windows/Login';
import store from './redux/store';
import MainWindow from './windows/Main';
import { HashRouter, Routes, Route } from 'react-router-dom';

const App: FC = () => {
  return (
    <Provider store={store}>
      <HashRouter>
        <Routes>
          <Route path="/main" element={<MainWindow />} />
          <Route path="/login" element={<LoginWindow />} />
        </Routes>
      </HashRouter>
    </Provider>
  );
};

// 初始化 storage
const latestStorageVersion = '2';
const currentStorageVersion = localStorage.getItem('version') || '1';

if (latestStorageVersion !== currentStorageVersion) {
  // 版本不一致，清空 localStorage
  localStorage.clear();
  localStorage.setItem('version', latestStorageVersion);
}

const root = ReactDOM.createRoot(document.getElementById('app') as HTMLElement);
root.render(<App />);
