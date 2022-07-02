import { Progress } from 'antd';
import React, { useState, useEffect, useMemo, useCallback } from 'react';

export interface DownloadProgressProps {
  label: string;
  aria: any;
  iconClassName: string;
}

const DownloadProgress: React.FC<DownloadProgressProps> = ({
  label,
  aria,
  iconClassName,
}) => {
  const getProgressPercent = (aria: any) => {
    return parseFloat(
      ((aria.completedLength / aria.totalLength) * 100).toFixed(1)
    );
  };

  let status: 'normal' | 'active' | 'exception' | 'success' = 'normal';

  if (aria.status === 'error') {
    status = 'exception';
  } else if (aria.status === 'complete') {
    status = 'success';
  }

  const percent = getProgressPercent(aria);
  return (
    <div
      role="progressbar"
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={percent}
      aria-label={label}
      aria-valuetext={`${percent}% 已下载`}
      style={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <i
        className={iconClassName}
        style={{
          width: '1.7em',
          transform: 'translateY(.13em)',
          fontSize: '.8em',
        }}
      />
      <Progress
        status={status}
        size="small"
        percent={getProgressPercent(aria)}
      />
    </div>
  );
};

export default DownloadProgress;
