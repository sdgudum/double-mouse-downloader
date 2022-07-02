import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
  ReactElement,
  LiHTMLAttributes,
  PropsWithChildren,
} from 'react';
import DownloadItem from '../DownloadItem';
import styles from './index.module.less';

export interface DownloadGroupItemProps extends PropsWithChildren {
  cover?: string;
  title: ReactNode;
  extraAttributes?: LiHTMLAttributes<HTMLLIElement>;
}

const DownloadGroupItem: React.FC<DownloadGroupItemProps> = ({
  cover,
  title,
  children,
  extraAttributes = {},
}) => {
  return (
    <DownloadItem {...extraAttributes}>
      <div
        style={{
          display: 'flex',
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        {cover && (
          <div>
            <img
              alt="封面"
              style={{
                width: '10em',
              }}
              src={cover}
            />
          </div>
        )}
        <div
          style={{
            overflow: 'hidden',
            marginLeft: '1em',
            flexGrow: '1',
          }}
        >
          <h1
            style={{
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              fontSize: '1em',
            }}
          >
            {title}
          </h1>
          <div aria-label="子任务">{children}</div>
        </div>
      </div>
    </DownloadItem>
  );
};

export default DownloadGroupItem;
