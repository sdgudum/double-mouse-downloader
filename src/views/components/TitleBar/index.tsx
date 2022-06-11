import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styles from './index.module.less';

const TitleBar: React.FC = () => {
  return (
    <div
      className={styles.titleBar}
      style={{
        height: '2em',
        background: '#3e74c2',
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
        <button onClick={() => jsBridge.windowControl.minimize('main')}>
          <i className="fa-solid fa-minus" />
        </button>
        <button className={styles.fullscreen} disabled>
          <i
            className="fa-regular fa-square"
            style={{
              fontSize: '.9em',
            }}
          />
        </button>
        <button
          className={styles.close}
          onClick={() => jsBridge.windowControl.close('main')}
        >
          <i className="fa-solid fa-xmark" />
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
