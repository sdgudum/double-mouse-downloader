import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { showContextMenu } from '../bridge-helpers/context-menu';
import { useAppSelector } from '../redux/hooks';
import styles from './home.module.less';

export interface HomePageProps {}

const HomePage: React.FC<HomePageProps> = () => {
  const [inputValue, setInputValue] = useState('');
  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '80%',
      }}
    >
      <h1
        style={{
          color: 'white',
        }}
      >
        鼠鼠下载器
      </h1>
      <p>
        <input
          onContextMenu={() =>
            showContextMenu([
              {
                label: '复制',
                role: 'copy',
              },
              {
                label: '剪切',
                role: 'cut',
              },
              {
                label: '粘贴',
                role: 'paste',
              },
              {
                label: '清空',
                click() {
                  setInputValue('');
                },
              },
            ])
          }
          placeholder="在此处粘贴视频链接/BV号。"
          className={styles.input}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      </p>
    </main>
  );
};

export default HomePage;
