import { useCounter, useInterval, useRequest, useTitle } from 'ahooks';
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import QRCode from 'qrcode.react';
import { Button, Form, Input, Tabs } from 'antd';
import './login.less';

export interface LoginWindowProps {}

const LoginWindow: React.FC<LoginWindowProps> = () => {
  const [
    smsCooldown,
    { set: setSmsCooldownCounter, dec: decSmsCooldownCounter },
  ] = useCounter(-1, {
    max: 60,
    min: -1,
  });
  const qrCodeLoginRequest = useRequest(async () => {
    const resp: any = await jsBridge.bilibili.getLoginQrCode();
    if (resp.code !== 0) throw new Error(resp.message);
    return resp;
  });
  const qrCodeLoginStatusRequest = useRequest(
    async (oauthKey: string) => {
      const resp = await jsBridge.bilibili.getLoginQrCodeStatus(oauthKey);
      return resp;
    },
    {
      loadingDelay: 1000,
      manual: true,
    }
  );
  useTitle('登录哔哩哔哩');

  const clearQrCodeLoginStatusRequestInterval = useInterval(
    async () => {
      if (
        qrCodeLoginRequest.loading ||
        qrCodeLoginRequest.error ||
        !qrCodeLoginRequest.data
      )
        return;

      const data = qrCodeLoginRequest.data;
      const oauthKey: string = data.data.oauthKey;
      const resp = await qrCodeLoginStatusRequest.runAsync(oauthKey);
      if (resp.data === -2) {
        // 二维码过期
        qrCodeLoginRequest.refresh();
      } else if (resp.status) {
        // 登录成功
        const opener = window.opener as Window;
        opener.dispatchEvent(new CustomEvent('loginSuccess'));
        clearQrCodeLoginStatusRequestInterval();
      }
    },
    3000,
    {
      immediate: true,
    }
  );

  const loginWithPassword = () => {
    // TODO 密码登录
  };

  return (
    <main
      className="login-window"
      style={{
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-evenly',
          position: 'relative',
        }}
      >
        <section
          aria-label="二维码登录"
          style={{
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              marginBottom: '1em',
            }}
          >
            扫描二维码登录
          </h1>
          <section
            style={{
              padding: '1em',
              border: '1px solid #ccc',
              borderRadius: '.5em',
              marginBottom: '1em',
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '150px',
              width: '150px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            {!!qrCodeLoginRequest.error && '获取二维码错误'}
            {qrCodeLoginRequest.loading && (
              <p
                style={{
                  height: '100%',
                }}
              >
                正在加载二维码...
              </p>
            )}
            {!qrCodeLoginRequest.loading && !qrCodeLoginRequest.error && (
              <QRCode
                aria-label="二维码"
                value={qrCodeLoginRequest.data.data.url}
              />
            )}
          </section>
          {qrCodeLoginStatusRequest.data?.data === -5 && (
            <p
              style={{
                color: 'green',
                textAlign: 'center',
              }}
            >
              扫描成功，请在客户端内点击确认登录
            </p>
          )}
          {qrCodeLoginStatusRequest.data?.status && (
            <p
              style={{
                color: 'green',
                textAlign: 'center',
              }}
            >
              登录成功，正在跳转请稍候...
            </p>
          )}
          <p
            role="comment"
            style={{
              textAlign: 'center',
            }}
          >
            请使用哔哩哔哩客户端扫码登录
          </p>
        </section>
        <div
          style={{
            width: '1px',
            background: '#e7e7e7',
          }}
        />
        <section
          aria-label="账号登录"
          style={{
            width: '250px',
          }}
        >
          <Tabs className="username-login-tabs" defaultActiveKey="password">
            <Tabs.TabPane tab="密码登录" key="password">
              <Form
                requiredMark={false}
                onFinish={(values) => {
                  console.log(values);
                }}
              >
                <Form.Item
                  label="账号"
                  name="username"
                  rules={[
                    {
                      type: 'string',
                      required: true,
                      message: '请输入账号。',
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="密码"
                  name="password"
                  rules={[
                    {
                      type: 'string',
                      required: true,
                      message: '请输入密码。',
                    },
                  ]}
                >
                  <Input type="password" />
                </Form.Item>
                <Button block type="primary" htmlType="submit">
                  登录
                </Button>
              </Form>
            </Tabs.TabPane>
            <Tabs.TabPane tab="短信登录" key="sms">
              <Form
                labelCol={{
                  offset: 0,
                  span: 7,
                }}
                requiredMark={false}
                onFinish={(values) => {
                  // TODO 短信登录
                }}
              >
                <Form.Item
                  tooltip='非中国大陆手机号请包含国际区号（如中国台湾"+886"）'
                  label="手机号"
                  name="cellphone"
                  rules={[
                    {
                      type: 'string',
                      required: true,
                      message: '请输入手机号。',
                    },
                    {
                      type: 'string',
                      pattern: /^\+?\d+$/,
                      message: '手机号格式不正确。',
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="验证码"
                  name="code"
                  required
                  rules={[
                    {
                      type: 'number',
                      required: true,
                      len: 6,
                      message: '请输入正确的验证码。',
                    },
                  ]}
                >
                  <Input type="code" />
                </Form.Item>
                <p>
                  <Button
                    onClick={() => setSmsCooldownCounter(60)}
                    style={{
                      padding: '0',
                    }}
                    type="link"
                    htmlType="button"
                    disabled={smsCooldown >= 0}
                  >
                    {smsCooldown >= 0
                      ? `${smsCooldown} 秒后可重新获取验证码`
                      : '获取验证码'}
                  </Button>
                </p>
                <Button block type="primary" htmlType="submit">
                  登录
                </Button>
              </Form>
            </Tabs.TabPane>
          </Tabs>
        </section>
      </div>
    </main>
  );
};

export default LoginWindow;
