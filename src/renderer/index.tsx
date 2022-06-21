import 'antd/dist/antd.css';
import React, { FC } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import './index.less';
import LoginWindow from './windows/Login';
import store from './redux/store';
import MainWindow from './windows/Main';

const App: FC = () => {
  const hash = location.hash || '#main';
  return (
    <Provider store={store}>
      {hash === '#main' && <MainWindow />}
      {hash === '#login' && <LoginWindow />}
    </Provider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('app') as HTMLElement);
root.render(<App />);
