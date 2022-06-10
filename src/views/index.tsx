import React, { FC } from 'react';
import ReactDOM from 'react-dom/client';
import OuterLink from './components/OuterLink';
import './index.less';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

const App: FC = () => {
  return (
    <>
      <header
        style={{
          position: 'absolute',
          width: '100%',
        }}
      ></header>
      <main
        style={{
          position: 'relative',
          top: '50%',
          transform: 'translateY(-50%)',
          textAlign: 'center',
        }}
      >
        <h1>鼠鼠下载器</h1>
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
        >
          <span
            style={{
              fontSize: '.8em',
            }}
          >
            <span>版本号: v{__APP_VERSION__}</span>
          </span>
          <span
            style={{
              float: 'right',
            }}
          >
            <OuterLink
              target="_blank"
              href="https://github.com/MoyuScript/double-mouse-downloader"
            >
              <FontAwesomeIcon icon={faGithub}></FontAwesomeIcon>
            </OuterLink>
          </span>
        </div>
      </footer>
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById('app') as HTMLElement);
root.render(<App />);
