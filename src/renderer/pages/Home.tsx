import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { showContextMenu } from '../bridge-helpers/context-menu';
import { useAppSelector } from '../redux/hooks';
import styles from './home.module.less';
import { usePagination, useRequest, useToggle } from 'ahooks';
import ResourceList from '../components/ResourceList';

export interface HomePageProps {}

const HomePage: React.FC<HomePageProps> = () => {
  const [inputValue, setInputValue] = useState('');
  const [isVideoListShown, { set: setIsVideoListShown }] = useToggle(false);
  const [textToSearch, setTextToSearch] = useState('');

  const startSearch = () => {
    if (inputValue === '') return;

    setIsVideoListShown(true);
    setTextToSearch(inputValue);
  };

  const tip = '在此处输入视频链接/BV号/番剧或电视剧链接。';

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        top: isVideoListShown ? '0' : '25%',
        position: 'relative',
        transition: 'all .3s',
        margin: '0 2em',
        height: '100%',
      }}
    >
      <h1
        aria-hidden={isVideoListShown}
        style={{
          height: isVideoListShown ? '0' : '1.5em',
          opacity: isVideoListShown ? '0' : '1',
          marginBottom: isVideoListShown ? '0' : '',
          color: 'white',
          overflow: 'hidden',
          transition: 'all .3s',
        }}
      >
        鼠鼠下载器
      </h1>
      <div
        style={{
          transition: 'all .3s',
          width: isVideoListShown ? '100%' : '60%',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <input
          role="search"
          title={tip}
          onKeyDown={(ev) => {
            if (ev.key === 'Enter') {
              startSearch();
            }
          }}
          style={{
            transition: 'all .3s',
            width: '100%',
            borderRadius: isVideoListShown ? '.2em' : '2em',
          }}
          onContextMenu={() => jsBridge.contextMenu.showBasicContextMenu()}
          placeholder={tip}
          className={styles.input}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button
          aria-label="搜索"
          onClick={startSearch}
          style={{
            background: 'none',
            border: 'none',
            display: 'block',
            position: 'absolute',
            top: '.5em',
            right: '.5em',
            cursor: 'pointer',
          }}
        >
          <i className="fa-solid fa-magnifying-glass" />
        </button>
      </div>
      {isVideoListShown && textToSearch && (
        <ResourceList textToSearch={textToSearch} />
      )}
    </main>
  );
};

export default HomePage;
