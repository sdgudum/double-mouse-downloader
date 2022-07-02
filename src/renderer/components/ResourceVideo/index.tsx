import { useRequest, useSet, useSize, useToggle } from 'ahooks';
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import BilibiliVideo from '../../../types/models/BilibiliVideo';
import OuterLink from '../OuterLink';
import ResourceListItem from '../ResourceListItem';
import TextBadge from '../TextBadge';
import styles from './index.module.less';
import filenamify from 'filenamify';
import BilibiliVideoPage from '../../../types/models/BilibiliVideoPage';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { message } from 'antd';
import { downloadVideo } from '../../utils/download';
import ResourceOperatorButton from '../ResourceOperatorButton';

export interface ResourceVideoProps {
  bvid: string;
}

const ResourceVideo: React.FC<ResourceVideoProps> = ({ bvid }) => {
  const [
    selectedPageSet,
    {
      add: addSelectedPage,
      remove: removeSelectedPage,
      reset: resetSelectedPage,
    },
  ] = useSet<BilibiliVideoPage>();
  const {
    data: resource,
    loading,
    error,
  } = useRequest(
    async () => {
      const info = await jsBridge.bilibili.getVideoInfo(bvid);
      if (info.code !== 0) {
        throw new Error(`调用接口错误：${info.message}`);
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

      resetSelectedPage();
      video.pages.forEach((page) => addSelectedPage(page));
      return video;
    },
    {
      refreshDeps: [bvid],
      loadingDelay: 1000,
    }
  );
  const [pageListExpanded, { toggle: togglePageListExpanded }] = useToggle();
  const pageListRef = useRef<HTMLDivElement>(null);
  const pageListSize = useSize(pageListRef);
  const loginStatus = useAppSelector((state) => state.loginStatus);
  const [downloadButtonDisabled, setDownloadButtonDisabled] = useState(false);

  const selectAllPages = () => {
    if (!resource) return;
    resource.pages.forEach((page) => addSelectedPage(page));
  };

  const invertSelectedPages = () => {
    if (!resource) return;
    resource.pages.forEach((page) =>
      selectedPageSet.has(page)
        ? removeSelectedPage(page)
        : addSelectedPage(page)
    );
  };

  const saveCoverPicture = async () => {
    if (!resource) return;
    const url = new URL(resource.cover);
    const ext = await jsBridge.path.extname(
      url.pathname.split('/').pop() as string
    );
    const filename = `${resource.id} - ${filenamify(resource.title)}${ext}`;
    const saveDialogReturnValue = await jsBridge.dialog.showSaveDialog({
      defaultPath: filename,
    });
    const savePath = saveDialogReturnValue.filePath;

    if (!savePath) return;
    const gid = await jsBridge.aria2.invoke('aria2.addUri', [url.href], {
      out: await jsBridge.path.basename(savePath),
      dir: await jsBridge.path.dirname(savePath),
      'auto-file-renaming': 'false',
      'allow-overwrite': 'true',
    });

    const onDownloadComplete = (event: any) => {
      if (event.gid !== gid) return;

      const noti = new Notification('保存封面成功', {
        body: `${savePath}\n点我打开封面所在路径。`,
      });

      noti.onclick = () => jsBridge.shell.showItemInFolder(savePath);
      jsBridge.off('aria2.onDownloadComplete', onDownloadComplete);
    };

    const onDownloadError = (event: any) => {
      if (event.gid !== gid) return;

      new Notification('保存封面失败', {
        body: `${savePath}\n请稍后再尝试一下。`,
      });
      jsBridge.off('aria2.onDownloadError', onDownloadError);
    };

    jsBridge.on('aria2.onDownloadError', onDownloadError);
    jsBridge.on('aria2.onDownloadComplete', onDownloadComplete);
  };

  const startDownload = async (userPickPath = false) => {
    if (!resource) return;
    if (selectedPageSet.size === 0) {
      jsBridge.dialog.showMessageBox(location.href, {
        title: '提示',
        message: '请选择要下载的分 P。',
        type: 'question',
      });
      return;
    }
    const config = await jsBridge.config.getAll();
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
    const closeLoading = message.loading('创建任务中，请稍候...');

    const task = await downloadVideo(
      {
        ...resource,
        pages: [...selectedPageSet.values()],
      },
      savePath
    );

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
  };

  let children: ReactNode = null;

  if (loading) {
    children = <p style={{ margin: 0 }}>加载视频 {bvid} 中，请稍候...</p>;
  } else if (error) {
    children = (
      <p role="alert" style={{ margin: 0, color: 'red' }}>
        加载视频 {bvid} 失败：{error.message}
      </p>
    );
  } else if (resource) {
    let canDownload = true;
    if (resource.needVip && !loginStatus.isVip) {
      canDownload = false;
    }

    children = (
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
          {resource.needVip && (
            <TextBadge
              style={{
                display: 'block',
                position: 'absolute',
                bottom: '0',
                background: 'rgb(253 107 162)',
                fontSize: '.8em',
                padding: '0 .5em',
              }}
            >
              大会员
            </TextBadge>
          )}
          {resource.needPay && (
            <TextBadge
              style={{
                display: 'block',
                position: 'absolute',
                bottom: '0',
                background: 'rgb(255 173 0)',
                padding: '0 .5em',
                fontSize: '.8em',
              }}
            >
              付费
            </TextBadge>
          )}
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
                  backgroundColor: 'rgb(253 107 162)',
                  marginRight: '.2em',
                  fontSize: '.95em',
                  padding: '.1em .2em',
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
              <ResourceOperatorButton onClick={() => saveCoverPicture()}>
                <i className="fa-solid fa-image" /> 保存封面
              </ResourceOperatorButton>
              {canDownload && (
                <>
                  <ResourceOperatorButton onClick={selectAllPages}>
                    全选
                  </ResourceOperatorButton>
                  <ResourceOperatorButton onClick={invertSelectedPages}>
                    反选
                  </ResourceOperatorButton>
                  <ResourceOperatorButton
                    disabled={downloadButtonDisabled}
                    onClick={() => startDownload(false)}
                    aria-label="下载"
                    style={{
                      color: '#3c83ff',
                    }}
                  >
                    <i className="fa-solid fa-download" /> 下载
                  </ResourceOperatorButton>
                  <ResourceOperatorButton
                    disabled={downloadButtonDisabled}
                    onClick={() => startDownload(true)}
                    aria-label="下载到..."
                    style={{
                      color: '#3c83ff',
                    }}
                  >
                    <i className="fa-solid fa-download" /> 下载到...
                  </ResourceOperatorButton>
                </>
              )}
            </div>
            {canDownload && (
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
                        aria-checked={selectedPageSet.has(page)}
                        role="checkbox"
                        key={page.cid}
                        style={{
                          border: '1px solid #ccc',
                          borderRadius: '.2em',
                          padding: '.2em .5em',
                          fontSize: '.9em',
                          color: selectedPageSet.has(page) ? 'white' : 'black',
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
                        'linear-gradient(0deg, white 30%, rgba(255, 255, 255, 0))',
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
            )}
            {!canDownload && (
              <p
                style={{
                  color: 'red',
                  margin: '0',
                }}
              >
                你没有下载权限。
              </p>
            )}
          </div>
        </div>
      </div>
    );
  } else {
    children = <p>加载视频 {bvid} 失败：出现了未知错误</p>;
  }

  return (
    <ResourceListItem
      aria-label={`视频-${resource ? resource.title : bvid}`}
      style={{
        padding: '.5em',
      }}
    >
      {children}
    </ResourceListItem>
  );
};

export default ResourceVideo;
