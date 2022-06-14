import { usePagination } from 'ahooks';
import React from 'react';
import ResourceVideo from '../ResourceVideo';
import { detectResource } from '../../utils/bilibili';

export interface ResourceListProps {
  textToSearch: string;
}

const ResourceList: React.FC<ResourceListProps> = ({ textToSearch }) => {
  const { loading, error, data, pagination, run } = usePagination(
    async ({ current }) => {
      const resource = detectResource(textToSearch);

      if (resource.type === 'video') {
        return {
          total: 1,
          list: [await jsBridge.bilibili.getVideoInfo(resource.id)],
        };
      }

      throw new Error('不支持的资源类型');
    },
    {
      refreshDeps: [textToSearch],
      loadingDelay: 1000,
    }
  );

  if (loading || !data) {
    return (
      <span
        className=""
        style={{
          color: 'white',
          marginTop: '.5em',
          fontSize: '1.5em',
        }}
      >
        加载中，请稍候 ...
      </span>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        style={{
          color: 'white',
          marginTop: '.5em',
          width: '100%',
        }}
      >
        <p>无法加载该资源，请检查输入是否有误。</p>
        <p>当前支持的资源类型：</p>
        <ul>
          <li>
            视频：
            <ul>
              <li>BV1GJ411x7h7</li>
              <li>https://www.bilibili.com/video/BV1GJ411x7h7</li>
            </ul>
          </li>
        </ul>
      </div>
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
      <div>
        <button
          style={{
            border: 'none',
            borderRadius: '.2em',
            background: 'none',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          <i className="fa-solid fa-download" /> 一键下载
        </button>
      </div>
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
        {data!.list.map(
          (res) =>
            res.type === 'video' && (
              <ResourceVideo key={res.id} resource={res} />
            )
        )}
      </ul>
    </div>
  );
};

export default ResourceList;
