import React, { ReactNode, useMemo, useState } from 'react';
import ResourceVideo from '../ResourceVideo';
import { detectResource } from '../../utils/bilibili';
import { useAppSelector } from '../../redux/hooks';

export interface ResourceListProps {
  textToSearch: string;
}

const ResourceList: React.FC<ResourceListProps> = ({ textToSearch }) => {
  const config = useAppSelector((state) => state.config.data);
  const resource = useMemo(() => detectResource(textToSearch), [textToSearch]);

  if (!config) return null;

  let children: ReactNode = null;

  if (resource === null) {
    children = (
      <>
        <p role="alert">无法加载该资源，请检查输入是否有误。</p>
        <p>当前支持的资源类型：</p>
        <ul>
          <li>
            视频（大小写敏感）：
            <ul>
              <li>BV1GJ411x7h7</li>
              <li>https://www.bilibili.com/video/BV1GJ411x7h7</li>
            </ul>
          </li>
        </ul>
      </>
    );
  } else {
    let el: ReactNode = null;

    switch (resource.type) {
      case 'video':
        el = <ResourceVideo bvid={resource.id} />;
        break;

      default:
        break;
    }
    children = (
      <ul
        aria-label="资源列表"
        style={{
          width: '100%',
          listStyle: 'none',
          marginTop: '1em',
          padding: '0',
          maxHeight: '100%',
        }}
      >
        {el}
      </ul>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        marginTop: '1em',
        overflowY: 'auto',
        marginBottom: '2em',
      }}
    >
      {children}
    </div>
  );
};

export default ResourceList;
