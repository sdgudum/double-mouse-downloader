import { usePagination } from 'ahooks';
import React, { ReactNode, useState } from 'react';
import ResourceVideo from '../ResourceVideo';
import { detectResource } from '../../utils/bilibili';
import BilibiliVideo from 'src/types/models/BilibiliVideo';
import { message } from 'antd';
import { downloadVideo } from '../../utils/download';
import { useAppSelector } from '../../redux/hooks';

export interface ResourceListProps {
  textToSearch: string;
}

const ResourceList: React.FC<ResourceListProps> = ({ textToSearch }) => {
  const { loading, error, data, pagination, run } = usePagination(
    async ({ current }) => {
      const resource = detectResource(textToSearch);

      if (resource === null) {
        throw new Error(
          JSON.stringify({
            code: 'unsupported_resource_type',
            description: '不支持的资源类型',
          })
        );
      }

      if (resource.type === 'video') {
        const info = await jsBridge.bilibili.getVideoInfo(resource.id);

        if (info.code !== 0) {
          throw new Error(
            JSON.stringify({
              code: 'request_error',
              description: `调用接口错误：code=${info.code}, message=${info.message}`,
            })
          );
        }

        const data = info.data;

        const video: BilibiliVideo = {
          id: data.bvid,
          cover: data.pic,
          needVip: !!data.rights.pay,
          needPay: !!data.rights.arc_pay,
          pages: data.pages.map((p: any) => ({
            type: 'videoPage',
            cid: p.cid,
            index: p.page,
            title: p.part,
          })),
          title: data.title,
          type: 'video',
          owner: {
            avatar: data.owner.face,
            uid: data.owner.mid,
            name: data.owner.name,
          },
        };
        return {
          total: 1,
          list: [video],
        };
      }

      throw new Error('不支持的资源类型');
    },
    {
      refreshDeps: [textToSearch],
      loadingDelay: 1000,
    }
  );

  const [downloadAllButtonDisabled, setDownloadAllButtonDisabled] =
    useState(false);
  const config = useAppSelector((state) => state.config.data);

  if (!config) return null;

  const downloadAll = async () => {
    const list = data?.list;
    if (!list) return;

    setDownloadAllButtonDisabled(true);

    const resourceType = list[0].type;

    const resourceTypeText = {
      video: '视频',
    }[resourceType];

    const pageCount = list.map((v) => v.pages).flat(1).length;

    const dialogMessage = `确认一键下载 ${list.length} 个${resourceTypeText}（共 ${pageCount} 个分 P）？`;
    const result = await jsBridge.dialog.showMessageBox(location.href, {
      title: '即将开始下载',
      message: dialogMessage,
      type: 'info',
      buttons: ['确认', '取消'],
    });

    if (result.response === 1) {
      // cancel
      setDownloadAllButtonDisabled(false);
      return;
    }

    // 开始下载
    const endLoading = message.loading('正在创建任务，请稍候...', 0);

    if (resourceType === 'video') {
      // 下载视频
      for (const video of list) {
        await downloadVideo(video, config.download.path);
      }
    }

    endLoading();
    message.success('创建任务完成');
    setDownloadAllButtonDisabled(false);
  };

  if (loading) {
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
    let children: ReactNode = null;
    try {
      const json = JSON.parse(error.message);

      if (json.code === 'unsupported_resource_type') {
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
      } else if (json.code === 'request_error') {
        children = <p>{json.description}</p>;
      }
    } catch (err) {
      console.error(err);
      children = <p role="alert">获取资源信息错误，请稍后重试。</p>;
    }
    return (
      <div
        style={{
          color: 'white',
          marginTop: '.5em',
          width: '100%',
        }}
      >
        {children}
      </div>
    );
  }

  if (!data) {
    return null;
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
          disabled={downloadAllButtonDisabled}
          onClick={downloadAll}
          style={{
            border: 'none',
            borderRadius: '.2em',
            background: 'none',
            color: 'white',
            cursor: downloadAllButtonDisabled ? 'not-allowed' : 'pointer',
          }}
        >
          <i className="fa-solid fa-download" />{' '}
          {downloadAllButtonDisabled ? '请稍候...' : '一键下载'}
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
        {data.list.map(
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
