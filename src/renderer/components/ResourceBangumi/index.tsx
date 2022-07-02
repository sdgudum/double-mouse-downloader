import { useRequest } from 'ahooks';
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  PropsWithChildren,
  ButtonHTMLAttributes,
} from 'react';
import ResourceListItem from '../ResourceListItem';
import styles from './index.module.less';
import BilibiliBangumi from '../../../types/models/BilibiliBangumi';
import BilibiliBangumiEpisode from 'src/types/models/BilibiliBangumiEpisode';
import OuterLink from '../OuterLink';
import TextBadge from '../TextBadge';
import ResourceOperatorButton from '../ResourceOperatorButton';

const Episode: React.FC<{
  episode: BilibiliBangumiEpisode;
}> = ({ episode }) => {
  const EpisodeButton: React.FC<
    ButtonHTMLAttributes<HTMLButtonElement> & PropsWithChildren
  > = ({ children, style, ...attrs }) => {
    return (
      <button
        style={{
          ...style,
        }}
        {...attrs}
      >
        {children}
      </button>
    );
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
          marginLeft: '.5em',
        }}
      >
        <div>
          <h3
            style={{
              fontSize: '1em',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                color: 'white',
                background: 'rgb(253 107 162)',
                width: '3.8em',
                textAlign: 'center',
                borderRadius: '0 0 5px 5px',
                marginRight: '.5em',
                fontSize: '1em',
                boxShadow: '0 0 10px rgba(253, 107, 162, 0.2)',
              }}
            >
              第{episode.index}话
            </span>
            {episode.title}
          </h3>
          <div
            className={styles.episodeButtons}
            style={{
              padding: '1em 0',
            }}
          >
            <EpisodeButton
              style={{
                color: '#3c83ff',
              }}
            >
              <i className="fa-solid fa-download" /> 下载
            </EpisodeButton>
            <EpisodeButton>
              <i className="fa-solid fa-download" /> 下载到...
            </EpisodeButton>
            <EpisodeButton>
              <i className="fa-solid fa-image" /> 保存封面
            </EpisodeButton>
          </div>
        </div>
        <div>
          <img
            src={episode.cover}
            style={{
              height: '5em',
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
            title: ep.long_title,
            vipOnly: ep.status === 13,
            index: index + 1,
          };
          return episode;
        }),
      };

      return info;
    },
    {
      refreshDeps: [id, type],
      loadingDelay: 1000,
    }
  );

  if (loading) {
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
        }}
      >
        <section>
          <OuterLink>
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
            marginLeft: '1em',
            flexGrow: '1',
          }}
        >
          <h1
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
              style={{
                color: '#3c83ff',
              }}
            >
              <i className="fa-solid fa-download" /> 下载全部
            </ResourceOperatorButton>
            <ResourceOperatorButton>
              <i className="fa-solid fa-image" /> 保存封面
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
            {data.episodes.map((ep) => (
              <Episode episode={ep} key={ep.bvid} />
            ))}
          </ul>
        </section>
      </div>
    </ResourceListItem>
  );
};

export default ResourceBangumi;
