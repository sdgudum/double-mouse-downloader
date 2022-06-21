import { Form, Input, InputRef, Select, Switch } from 'antd';
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  Ref,
} from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import styles from './config.module.less';
import {
  AudioQuality,
  VideoQuality,
} from '../../common/constants/media-quality';

import { VALID_FILENAME_PATTERN } from '../../common/constants/regex';
import { useBoolean } from 'ahooks';
import configSlice, { fetchConfigAction } from '../redux/slices/config-slice';
import { debounce } from 'lodash';
import Joi from 'joi';
import { fetchReleaseInfoAction } from '../redux/slices/update-slice';
import semver from 'semver';
import OuterLink from '../components/OuterLink';

export interface ConfigPageProps {}

const ConfigPage: React.FC<ConfigPageProps> = () => {
  const config = useAppSelector((state) => state.config).data;
  const dispatch = useAppDispatch();
  const fileNamePatternRef = useRef<InputRef>();
  const [formDownload] = Form.useForm();
  const latestRelease = useAppSelector((state) => state.update);

  if (!config) return null;

  const insertFilenamePatternTemplate = (template: string) => {
    if (!fileNamePatternRef.current) return;

    const el = fileNamePatternRef.current;
    el.focus();

    const input = el.input;
    if (!input) return;

    const offset = input.selectionStart as number;
    const value = formDownload.getFieldValue('videoFileNamePattern') as string;
    const newValue = `${value.slice(0, offset)}${template}${value.slice(
      offset
    )}`;
    formDownload.setFieldsValue({
      videoFileNamePattern: newValue,
    });

    setTimeout(() => {
      input.setSelectionRange(
        offset + template.length,
        offset + template.length
      );
    }, 0);
  };

  /**
   * @param key 必须为 `a.b` 的格式
   */
  const updateConfig = (key: string, value: any) => {
    dispatch(
      configSlice.actions.set({
        [key.split('.')[0]]: {
          [key.split('.')[1]]: value,
        },
      })
    );

    jsBridge.config.set(key, value);
  };

  return (
    <main
      className={styles.configPage}
      style={{
        background: 'white',
        borderRadius: '.5em',
        margin: '0 2em',
        height: '90%',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '1em',
      }}
    >
      <Form.Provider
        onFormChange={(formName, info) => {
          if (
            info.changedFields.every((f) =>
              f.errors ? f.errors.length === 0 : true
            )
          ) {
            const field = info.changedFields[0].name.toString();
            const value = info.changedFields[0].value;

            // antd 存在 bug 有时候会导致错误值会走到这里，因此需要再次校验。
            if (formName === 'proxy' && field === 'url') {
              if (Joi.string().uri().validate(value).error) return;
            }

            if (formName === 'download' && field === 'videoFileNamePattern') {
              if (
                Joi.string().regex(VALID_FILENAME_PATTERN).validate(value).error
              )
                return;
            }

            updateConfig(`${formName}.${field}`, value);
          }
        }}
      >
        <Form
          aria-label="下载设置"
          form={formDownload}
          requiredMark={false}
          name="download"
          initialValues={config.download}
        >
          <h1>下载设置</h1>
          <Form.Item name="path" label="下载路径">
            <Input
              aria-readonly="false"
              aria-label="选择下载路径"
              role="button"
              title="点击选择下载路径位置"
              style={{
                cursor: 'pointer',
              }}
              readOnly
              onClick={async () => {
                const chosen = await jsBridge.dialog.showOpenDialog({
                  defaultPath: formDownload.getFieldValue('path'),
                  properties: ['openDirectory'],
                });

                if (chosen.canceled) return;

                const newPath = chosen.filePaths[0];
                formDownload.setFieldsValue({
                  path: newPath,
                });

                // 手动更新配置文件
                updateConfig('download.path', newPath);
              }}
            />
          </Form.Item>
          <section aria-label="视频文件名格式">
            <section
              aria-label="插入模板"
              className={styles.fileNamePatternHelper}
            >
              <button onClick={() => insertFilenamePatternTemplate('{BV号}')}>
                BV号
              </button>
              <button
                onClick={() => insertFilenamePatternTemplate('{分P索引}')}
              >
                分P索引
              </button>
              <button
                onClick={() => insertFilenamePatternTemplate('{视频标题}')}
              >
                视频标题
              </button>
              <button
                onClick={() => insertFilenamePatternTemplate('{分P标题}')}
              >
                分P标题
              </button>
              <button
                onClick={() => insertFilenamePatternTemplate('{发布时间}')}
              >
                发布时间
              </button>
              <button
                onClick={() => insertFilenamePatternTemplate('{UP主UID}')}
              >
                UP主UID
              </button>
              <button
                onClick={() => insertFilenamePatternTemplate('{UP主昵称}')}
              >
                UP主昵称
              </button>
              <button onClick={() => insertFilenamePatternTemplate('{画质}')}>
                画质
              </button>
            </section>
            <Form.Item
              name="videoFileNamePattern"
              label="视频文件名格式"
              tooltip="不包含扩展名（如“.mp4”）"
              rules={[
                {
                  type: 'string',
                  message: '请输入正确的文件名（不能包括以下字符：<>:"/\\|?*）',
                  pattern: VALID_FILENAME_PATTERN,
                  required: true,
                },
              ]}
            >
              <Input
                onContextMenu={() =>
                  jsBridge.contextMenu.showBasicContextMenu()
                }
                ref={fileNamePatternRef as Ref<InputRef>}
              />
            </Form.Item>
          </section>
          <Form.Item
            name="showDownloadGuidance"
            label="显示下载引导"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <div
            style={{
              display: 'flex',
            }}
          >
            <Form.Item name="videoQuality" label="视频品质">
              <Select
                options={Object.values(VideoQuality).map((q) => ({
                  label: q.name,
                  value: q.id,
                }))}
              />
            </Form.Item>
            <Form.Item
              name="audioQuality"
              label="音频品质"
              style={{
                marginLeft: '1em',
              }}
            >
              <Select
                options={Object.values(AudioQuality).map((q) => ({
                  label: q.name,
                  value: q.id,
                }))}
              />
            </Form.Item>
          </div>
        </Form>
        <Form
          aria-label="代理设置"
          requiredMark={false}
          name="proxy"
          initialValues={config.proxy}
        >
          <h1>代理设置</h1>
          <Form.Item name="enable" label="启用代理" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item
            name="useSystemProxy"
            label="使用系统代理"
            valuePropName="checked"
          >
            <Switch disabled={!config.proxy.enable} />
          </Form.Item>
          <Form.Item
            name="url"
            label="代理 URL"
            rules={[
              {
                type: 'url',
                message: '请输入正确的代理地址。',
                required: true,
              },
            ]}
          >
            <Input
              onContextMenu={() => jsBridge.contextMenu.showBasicContextMenu()}
              disabled={!config.proxy.enable || config.proxy.useSystemProxy}
            />
          </Form.Item>
        </Form>
        <Form aria-label="更新设置" name="update" initialValues={config.update}>
          <h1>更新设置</h1>
          <Form.Item
            style={{
              marginBottom: '.5em',
            }}
            label="自动检查更新"
            name="autoCheck"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <p>
            <button
              type="button"
              disabled={latestRelease.status === 'pending'}
              onClick={() => dispatch(fetchReleaseInfoAction())}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                color:
                  latestRelease.status === 'pending' ? '#bcbcbc' : '#1890ff',
              }}
            >
              检查更新{latestRelease.status === 'pending' ? '中...' : ''}
            </button>
          </p>
          <p>当前版本：{__APP_VERSION__}</p>
          <p>
            最新版本：
            {latestRelease.status === 'error' ? (
              <span style={{ color: 'red' }}>出现了错误，请稍后重试</span>
            ) : semver.gt(latestRelease.latestVersion, __APP_VERSION__) ? (
              <span style={{ color: 'green' }}>
                1.0.0{' '}
                <OuterLink
                  style={{
                    color: '#1890ff',
                  }}
                  href={latestRelease.url}
                >
                  （下载最新版本）
                </OuterLink>
              </span>
            ) : (
              <span>{latestRelease.latestVersion}</span>
            )}
          </p>
        </Form>
      </Form.Provider>
    </main>
  );
};

export default ConfigPage;
