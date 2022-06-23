import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styles from './index.module.less';

const TitleBar: React.FC = () => {
  return (
    <div
      className={styles.titleBar}
      style={{
        height: '2.3em',
        background: '#3e74c2',
        flexShrink: '0',
      }}
    >
      <div
        style={{
          color: 'hsl(215deg 52% 95%)',
          verticalAlign: 'middle',
          fontSize: '.9em',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '1em',
        }}
      >
        <span>鼠鼠下载器</span>
      </div>
      <div className={styles.controllers}>
        <button
          aria-label="窗口最小化"
          onClick={() => jsBridge.windowControl.minimize(location.hash)}
        >
          <i className="fa-solid fa-minus" />
        </button>
        <button aria-label="窗口最大化" className={styles.fullscreen} disabled>
          <i
            className="fa-regular fa-square"
            style={{
              fontSize: '.9em',
            }}
          />
        </button>
        <button
          aria-label="关闭窗口"
          className={styles.close}
          onClick={() => jsBridge.windowControl.close(location.hash)}
        >
          <i className="fa-solid fa-xmark" />
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
