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
          <Route path="/" element={<MainWindow />} />
          <Route path="/login" element={<LoginWindow />} />
        </Routes>
      </HashRouter>
    </Provider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('app') as HTMLElement);
root.render(<App />);
