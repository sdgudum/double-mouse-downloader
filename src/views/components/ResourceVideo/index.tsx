import { useSet, useSize, useToggle } from 'ahooks';
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  PropsWithChildren,
  ButtonHTMLAttributes,
} from 'react';
import BilibiliVideo from 'src/types/modal/BilibiliVideo';
import OuterLink from '../OuterLink';
import ResourceListItem from '../ResourceListItem';
import TextBadge from '../TextBadge';
import styles from './index.module.less';

export interface VideoResourceProps {
  resource: BilibiliVideo;
}

const VideoResource: React.FC<VideoResourceProps> = ({ resource }) => {
  const [pageListExpanded, { toggle: togglePageListExpanded }] = useToggle();
  const pageListRef = useRef<HTMLDivElement>(null);
  const pageListSize = useSize(pageListRef);

  const [
    selectedPageSet,
    { add: addSelectedPage, remove: removeSelectedPage },
  ] = useSet();

  const selectAllPages = () => {
    resource.pages.forEach((page) => addSelectedPage(page));
  };

  const invertSelectedPages = () => {
    resource.pages.forEach((page) =>
      selectedPageSet.has(page)
        ? removeSelectedPage(page)
        : addSelectedPage(page)
    );
  };

  const OperationButton: React.FC<
    PropsWithChildren & ButtonHTMLAttributes<HTMLButtonElement>
  > = ({ children, style, ...attrs }) => {
    return (
      <button
        style={{
          border: 'none',
          background: 'none',
          fontSize: '.9em',
          cursor: 'pointer',
          ...style,
        }}
        {...attrs}
      >
        {children}
      </button>
    );
  };

  return (
    <ResourceListItem
      aria-label={`视频-${resource.title}`}
      style={{
        padding: '.5em',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
        }}
      >
        <OuterLink
          aria-label="封面"
          href={`https://www.bilibili.com/video/${resource.id}`}
          style={{
            overflow: 'hidden',
            height: '6em',
            flexShrink: '0',
            position: 'relative',
          }}
        >
          <img
            alt="封面"
            src={resource.cover}
            style={{
              height: '100%',
              borderRadius: '.2em',
            }}
          />
          <div
            className={styles.videoCoverMask}
            style={{
              position: 'absolute',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '2em',
              height: '100%',
              width: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              top: '0',
            }}
          >
            <i className="fa-regular fa-circle-play" />
          </div>
        </OuterLink>
        <div
          style={{
            marginLeft: '.5em',
            overflow: 'hidden',
            width: '100%',
          }}
        >
          <div
            style={{
              maxWidth: '100%',
            }}
          >
            <h1
              aria-label="标题"
              style={{
                fontSize: '1em',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              <TextBadge
                style={{
                  backgroundColor: '#4758ff',
                  marginRight: '.2em',
                }}
              >
                {resource.id}
              </TextBadge>
              <span title={resource.title}>{resource.title}</span>
            </h1>
            <div
              aria-label="分P操作"
              style={{
                marginBottom: '.5em',
              }}
            >
              <OperationButton onClick={selectAllPages}>全选</OperationButton>
              <OperationButton onClick={invertSelectedPages}>
                反选
              </OperationButton>
              <OperationButton
                aria-label="下载选中项"
                style={{
                  color: '#3c83ff',
                }}
              >
                <i className="fa-solid fa-download" /> 下载选中项
              </OperationButton>
            </div>
            <div>
              <div
                aria-label="分P列表"
                style={{
                  height: pageListExpanded
                    ? `${pageListSize?.height || '0'}px`
                    : '2em',
                  transition: 'height .3s',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    position: 'relative',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '.5em',
                  }}
                  ref={pageListRef}
                >
                  {resource.pages.map((page, i) => (
                    <button
                      title={`【P${page.index}】${page.title}`}
                      onClick={() =>
                        selectedPageSet.has(page)
                          ? removeSelectedPage(page)
                          : addSelectedPage(page)
                      }
                      aria-hidden={pageListExpanded ? true : i >= 2}
                      role="checkbox"
                      key={page.cid}
                      style={{
                        border: '1px solid #ccc',
                        borderRadius: '.2em',
                        padding: '.2em .5em',
                        fontSize: '.9em',
                        color: selectedPageSet.has(page) ? 'white' : 'gray',
                        background: selectedPageSet.has(page)
                          ? '#579cff'
                          : 'none',
                        transition: 'all .1s',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {`【P${page.index}】${page.title}`}
                    </button>
                  ))}
                </div>
              </div>
              {resource.pages.length > 2 && (
                <button
                  aria-label={`${
                    pageListExpanded ? '收起' : '展开'
                  }全部分P列表`}
                  onClick={() => togglePageListExpanded()}
                  style={{
                    display: 'block',
                    border: 'none',
                    width: '100%',
                    color: 'grey',
                    fontSize: '.8em',
                    textAlign: 'center',
                    background:
                      'linear-gradient(0deg, white, rgba(255, 255, 255, 0))',
                    position: 'relative',
                    zIndex: '1',
                    cursor: 'pointer',
                    paddingTop: '1em',
                  }}
                >
                  {pageListExpanded ? '收起' : '展开'}全部{' '}
                  <i
                    className={`fa-solid fa-angles-${
                      pageListExpanded ? 'up' : 'down'
                    }`}
                  ></i>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </ResourceListItem>
  );
};

export default VideoResource;
