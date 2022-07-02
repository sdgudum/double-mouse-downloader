import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  PropsWithChildren,
  LiHTMLAttributes,
} from 'react';
import styles from './index.module.less';

export interface DownloadItemProps
  extends PropsWithChildren<LiHTMLAttributes<HTMLLIElement>> {}

const DownloadItem: React.FC<DownloadItemProps> = ({
  children,
  style,
  ...attrs
}) => {
  return (
    <li
      style={{
        background: 'white',
        borderRadius: '.2em',
        marginBottom: '1em',
        padding: '.5em',
        position: 'relative',
        ...style,
      }}
      {...attrs}
    >
      {children}
    </li>
  );
};

export default DownloadItem;
