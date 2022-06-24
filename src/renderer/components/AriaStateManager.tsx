import { useMount, useUnmount } from 'ahooks';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import downloadSlice from '../redux/slices/donwload-slice';

const AriaStateManager: React.FC = () => {
  const ariaMap = useAppSelector((state) => state.download.ariaMap);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // 定时检查下载状态
    const id = setInterval(async () => {
      // 只检查下载中或在队列中的任务
      const gids = Object.values(ariaMap)
        .filter((v) => ['active', 'waiting'].includes(v.status))
        .map((v) => v.gid);

      if (gids.length === 0) return;

      const results: any[] = await jsBridge.aria2.invoke(
        'system.multicall',
        gids.map((gid) => ({
          methodName: 'aria2.tellStatus',
          params: [gid],
        }))
      );

      results.forEach((result) => {
        if (result.code === 1) return;
        dispatch(downloadSlice.actions.putAriaItem(result[0]));
      });
    }, 500);

    return () => {
      clearInterval(id);
    };
  }, [ariaMap]);

  useEffect(() => {
    const onAriaEvent = async ({ gid }: any) => {
      const info = await jsBridge.aria2.invoke('aria2.tellStatus', gid);
      dispatch(downloadSlice.actions.putAriaItem(info));
    };
    jsBridge.on('aria2.onDownloadStart', onAriaEvent);
    jsBridge.on('aria2.onDownloadPause', onAriaEvent);
    jsBridge.on('aria2.onDownloadStop', onAriaEvent);
    jsBridge.on('aria2.onDownloadComplete', onAriaEvent);
    jsBridge.on('aria2.onDownloadError', onAriaEvent);

    return () => {
      jsBridge.off('aria2.onDownloadStart', onAriaEvent);
      jsBridge.off('aria2.onDownloadPause', onAriaEvent);
      jsBridge.off('aria2.onDownloadStop', onAriaEvent);
      jsBridge.off('aria2.onDownloadComplete', onAriaEvent);
      jsBridge.off('aria2.onDownloadError', onAriaEvent);
    };
  }, []);

  return null;
};

export default AriaStateManager;
