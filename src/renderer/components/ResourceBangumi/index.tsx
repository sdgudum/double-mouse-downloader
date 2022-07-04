import { useRequest } from 'ahooks';
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  PropsWithChildren,
  ButtonHTMLAttributes,
  ReactNode,
} from 'react';
import ResourceListItem from '../ResourceListItem';
import styles from './index.module.less';
import BilibiliBangumi from '../../../types/models/BilibiliBangumi';
import BilibiliBangumiEpisode from 'src/types/models/BilibiliBangumiEpisode';
import OuterLink from '../OuterLink';
import TextBadge from '../TextBadge';
import ResourceOperatorButton from '../ResourceOperatorButton';
import { useAppSelector } from '../../redux/hooks';
import BilibiliBangumiRelativeVideo from 'src/types/models/BilibiliBangumiRelativeVideo';
import { downloadVideo, saveCoverPicture } from '../../utils/download';
import { message } from 'antd';
import BilibiliVideo from 'src/types/models/BilibiliVideo';
import { convertToBilibiliVideo } from '../../utils/bilibili';
import { MessageType } from 'antd/lib/message';

const Episode: React.FC<{
  episode: BilibiliBangumiEpisode;
  badgeText: ReactNode;
  badgeBackgroundColor?: string;
}> = ({ episode, badgeText, badgeBackgroundColor = 'rgb(253 107 162)' }) => {
  const loginStatus = useAppSelector((state) => state.loginStatus);
  const [downloadButtonDisabled, setDownloadButtonDisabled] = useState(false);
  const { runAsync, data: videoInfo } = useRequest(
    async () => {
      const resp = await jsBridge.bilibili.getVideoInfo(episode.bvid);
      if (resp.code !== 0) throw new Error(resp.message);
      return convertToBilibiliVideo(resp.data);
    },
    {
      manual: true,
    }
  );

  const config = useAppSelector((state) => state.config.data);
  if (!config) return null;

  const canDownload = loginStatus.isVip || !episode.vipOnly;
  const EpisodeButton: React.FC<
    ButtonHTMLAttributes<HTMLButtonElement> & PropsWithChildren
  > = ({ children, style, disabled, ...attrs }) => {
    return (
      <button
        style={{
          ...style,
          color: disabled ? undefined : style?.color,
        }}
        {...attrs}
      >
        {children}
      </button>
    );
  };

  const saveCover = async () => {
    const filename = `${episode.bvid} ${episode.title}`;
    await saveCoverPicture(episode.cover, filename);
  };

  const startDownload = async (userPickPath = false) => {
    try {
      let savePath = config.download.path;

      if (userPickPath) {
        // 用户选择保存路径
        const result = await jsBridge.dialog.showOpenDialog({
          properties: ['openDirectory'],
        });

        if (result.filePaths.length === 0) return;

        savePath = result.filePaths[0];
      }

      setDownloadButtonDisabled(true);
      let info = videoInfo;
      if (!info) {
        info = await runAsync();
      }

      const closeLoading = message.loading('创建任务中，请稍候...');

      const task = await downloadVideo(info, savePath);

      closeLoading();
      setDownloadButtonDisabled(false);
      if (task.pages.length !== 0) {
        message.success(
          <span
            role="status"
            style={{
              display: 'inline-block',
              verticalAlign: 'middle',
            }}
          >
            成功添加下载任务：
            <span
              title={task.title}
              style={{
                verticalAlign: 'middle',
                transform: 'translateY(-0.1em)',
                display: 'inline-block',
                maxWidth: '30em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {task.title}
            </span>
          </span>
        );
      }
    } catch (err: any) {
      message.error(<span role="alert">下载出错：{err.message}</span>);
    } finally {
      setDownloadButtonDisabled(false);
    }
  };
  return (
    <li
      style={{
        borderRadius: '.2em',
        display: 'flex',
        position: 'relative',
        background: 'white',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexGrow: '1',
          paddingLeft: '.5em',
          width: '100%',
        }}
      >
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <h3
            title={`${badgeText} ${episode.title}`}
            style={{
              fontSize: '1em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              width: '100%',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                color: 'white',
                background: badgeBackgroundColor,
                minWidth: '3.8em',
                padding: '0 .5em',
                textAlign: 'center',
                borderRadius: '0 0 5px 5px',
                marginRight: '.5em',
                fontSize: '1em',
                boxShadow: '0 0 10px rgba(253, 107, 162, 0.2)',
              }}
            >
              {badgeText}
            </span>
            {episode.title}
          </h3>
          {!canDownload && (
            <p
              style={{
                margin: '0',
                color: 'red',
              }}
            >
              你没有下载权限。
            </p>
          )}
          <div
            className={styles.episodeButtons}
            style={{
              padding: '1em 0',
            }}
          >
            {canDownload && (
              <>
                <EpisodeButton
                  onClick={() => startDownload(false)}
                  style={{
                    color: '#3c83ff',
                  }}
                >
                  <i className="fa-solid fa-download" /> 下载
                </EpisodeButton>
                <EpisodeButton onClick={() => startDownload(true)}>
                  <i className="fa-solid fa-download" /> 下载到...
                </EpisodeButton>
              </>
            )}
            <EpisodeButton onClick={saveCover}>
              <i className="fa-solid fa-image" /> 保存封面
            </EpisodeButton>
          </div>
        </div>
        <div
          style={{
            flexShrink: '0',
          }}
        >
          <img
            src={episode.cover}
            style={{
              height: '5em',
              borderRadius: '0 0 0 10px',
            }}
          />
        </div>
      </div>
    </li>
  );
};

export interface ResourceBangumiProps {
  type: 'bangumiEpisode' | 'bangumiSeason' | 'bangumiMedia';
  id: string;
}

const ResourceBangumi: React.FC<ResourceBangumiProps> = ({ type, id }) => {
  const config = useAppSelector((state) => state.config.data);
  const loginStatus = useAppSelector((state) => state.loginStatus);
  const { data, loading, error } = useRequest(
    async () => {
      let resp;

      if (type === 'bangumiEpisode') {
        resp = await jsBridge.bilibili.getBangumiInfoByEpisodeId(parseInt(id));
      } else if (type === 'bangumiMedia') {
        resp = await jsBridge.bilibili.getBangumiInfoByMediaId(parseInt(id));
      } else if (type === 'bangumiSeason') {
        resp = await jsBridge.bilibili.getBangumiInfoBySeasonId(parseInt(id));
      }

      if (resp.code !== 0) throw new Error(`获取剧集信息失败：${resp.message}`);

      const data = resp.result;
      const info: BilibiliBangumi = {
        title: data.title,
        cover: data.cover,
        mediaId: data.media_id.toString(),
        episodes: data.episodes.map((ep: any, index: number) => {
          const episode: BilibiliBangumiEpisode = {
            bvid: ep.bvid,
            cid: ep.cid,
            cover: ep.cover,
            title: ep.long_title || ep.title,
            vipOnly: ep.status === 13,
          };
          return episode;
        }),
        relativeVideos: (data.section || [])
          .map((section: any) => {
            return section.episodes.map((ep: any) => {
              const v: BilibiliBangumiRelativeVideo = {
                bvid: ep.bvid,
                cid: ep.cid,
                cover: ep.cover,
                title: `${ep.title} ${ep.long_title || ''}`,
                badgeText: section.title,
                vipOnly: ep.status === 13,
              };
              return v;
            });
          })
          .flat(),
      };

      return info;
    },
    {
      refreshDeps: [id, type],
      loadingDelay: 1000,
    }
  );

  const [downloadButtonDisabled, setDownloadButtonDisabled] = useState(false);

  if (!config) return null;

  const saveCover = async () => {
    if (!data) return;

    const filename = `《${data.title}》封面`;
    await saveCoverPicture(data.cover, filename);
  };

  const downloadAll = async () => {
    if (!data) return;
    setDownloadButtonDisabled(true);
    const episodes = data.episodes.filter(
      (ep) => loginStatus.isVip || !ep.vipOnly
    );
    const confirmResult = await jsBridge.dialog.showMessageBox(location.href, {
      type: 'question',
      title: '下载确认',
      message: `即将开始下载 ${episodes.length} 个视频，是否确认下载？`,
      buttons: ['取消', '确认'],
    });

    if (confirmResult.response === 0) {
      setDownloadButtonDisabled(false);
      return;
    }

    // 开始下载
    let stopLoading: MessageType | undefined;
    let successCount = 0;
    let i = 1;
    for (const ep of episodes) {
      try {
        stopLoading = message.loading({
          content: `正在添加下载任务，请稍候... ${i++}/${episodes.length}`,
          key: 'loading',
          duration: 0,
        });
        const resp = await jsBridge.bilibili.getVideoInfo(ep.bvid);

        if (resp.code !== 0) throw new Error(resp.message);
        const info = convertToBilibiliVideo(resp.data);
        await downloadVideo(info, config.download.path);
        successCount++;
      } catch (err: any) {
        console.error(err);
        message.warn(`${ep.title} 出现错误，已跳过下载。`);
      }
    }

    if (stopLoading) {
      stopLoading();
    }

    if (successCount > 0) {
      message.success(
        `成功添加 ${successCount}/${data.episodes.length} 个下载任务`
      );
    }

    setDownloadButtonDisabled(false);
  };

  if (loading || !data) {
    return (
      <span
        style={{
          color: 'white',
        }}
      >
        加载中，请稍候...
      </span>
    );
  }

  if (error) {
    return (
      <span
        role="alert"
        style={{
          color: 'white',
        }}
      >
        {error.message}
      </span>
    );
  }

  if (!data) {
    return (
      <span
        role="alert"
        style={{
          color: 'white',
        }}
      >
        遇到了未知错误。
      </span>
    );
  }

  return (
    <ResourceListItem>
      <div
        style={{
          display: 'flex',
          padding: '.5em',
          position: 'relative',
          width: '100%',
        }}
      >
        <section>
          <section>
            <OuterLink
              className={styles.bangumiCover}
              style={{
                display: 'block',
              }}
              title="点击打开详情页"
              href={`https://www.bilibili.com/bangumi/media/md${data.mediaId}/`}
            >
              <img
                src={data.cover}
                style={{
                  width: '10em',
                  borderRadius: '.2em',
                }}
              />
            </OuterLink>
          </section>
          <section
            style={{
              textAlign: 'center',
              marginTop: '.5em',
            }}
          >
            <ResourceOperatorButton onClick={saveCover}>
              <i className="fa-solid fa-image" /> 保存封面
            </ResourceOperatorButton>
          </section>
        </section>
        <section
          style={{
            marginLeft: '1em',
            flexGrow: '1',
            overflow: 'hidden',
          }}
        >
          <h1
            title={data.title}
            style={{
              fontSize: '1.2em',
            }}
          >
            <TextBadge
              style={{
                fontSize: '.8em',
                backgroundColor: 'rgb(253 107 162)',
              }}
            >
              md{data.mediaId}
            </TextBadge>{' '}
            {data.title}
          </h1>
          <section
            style={{
              marginBottom: '1em',
            }}
          >
            <ResourceOperatorButton
              onClick={downloadAll}
              disabled={downloadButtonDisabled}
              style={{
                color: '#3c83ff',
              }}
            >
              <i className="fa-solid fa-download" /> 下载全部正片
            </ResourceOperatorButton>
          </section>
          <h2
            style={{
              fontSize: '1em',
              fontWeight: 'bold',
            }}
          >
            剧集列表
          </h2>
          <ul
            className={styles.episodes}
            style={{
              listStyle: 'none',
              padding: '0',
              margin: '0',
            }}
          >
            {data.episodes.map((ep, i) => (
              <Episode badgeText={`第${i + 1}话`} episode={ep} key={ep.bvid} />
            ))}
            {data.relativeVideos.map((v) => (
              <Episode
                key={v.bvid}
                badgeText={v.badgeText}
                episode={v}
                badgeBackgroundColor="rgb(111 107 253)"
              />
            ))}
          </ul>
        </section>
      </div>
    </ResourceListItem>
  );
};

export default ResourceBangumi;
