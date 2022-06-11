import React, { FC } from 'react';
import ReactDOM from 'react-dom/client';
import OuterLink from './components/OuterLink';
import './index.less';
import { Provider } from 'react-redux';
import store from './redux/store';
import TitleBar from './components/TitleBar';
import './public/assets/css/font-awesome/all.css';

const App: FC = () => {
  return (
    <Provider store={store}>
      <TitleBar />
      <header style={{}}></header>
      <main
        style={{
          position: 'relative',
          top: '50%',
          transform: 'translateY(-50%)',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            color: 'white',
          }}
        >
          鼠鼠下载器
        </h1>
      </main>
      <footer
        style={{
          position: 'absolute',
          bottom: '0',
          width: '100%',
          color: 'white',
        }}
      >
        <div
          style={{
            padding: '.3em',
          }}
        ></div>
      </footer>
    </Provider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('app') as HTMLElement);
root.render(<App />);
