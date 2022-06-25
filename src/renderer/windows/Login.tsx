import {
  useBoolean,
  useCounter,
  useInterval,
  useMount,
  useRequest,
  useTitle,
} from 'ahooks';
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import QRCode from 'qrcode.react';
import { Button, Form, Input, Select, Tabs } from 'antd';
import './login.less';
import { loadScripts } from '../utils/script';
import countryCallingCodes from '../../common/constants/country-calling-codes';

export interface LoginWindowProps {}

const LoginWindow: React.FC<LoginWindowProps> = () => {
  const [smsCooldown, setSmsCoolDown] = useState(-1);
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

  const onLoginSuccess = () => {
    const opener = window.opener as Window;
    opener.dispatchEvent(new CustomEvent('loginSuccess'));
  };

  const [smsLoginForm] = Form.useForm();

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
        onLoginSuccess();
        clearQrCodeLoginStatusRequestInterval();
      }
    },
    3000,
    {
      immediate: true,
    }
  );

  const [loginButtonDisabled, { set: setLoginButtonDisabled }] =
    useBoolean(false);

  const [isSendSmsButtonDisabled, { set: setIsSendSmsButtonDisabled }] =
    useBoolean(false);

  const [isCookieLoginButtonDisabled, { set: setIsCookieLoginButtonDisabled }] =
    useBoolean(false);

  const verifyGeetest = async () => {
    const captchaSettings = await jsBridge.bilibili.getCaptchaSettings();

    if (captchaSettings.code !== 0) {
      console.error(captchaSettings);
      throw new Error(
        `抱歉，获取验证码信息时出现了错误，请稍后再尝试。\n错误信息：${captchaSettings.message}`
      );
    }

    return new Promise<any>((resolve, reject) => {
      initGeetest(
        {
          ...captchaSettings.data.geetest,
          product: 'bind',
        },
        (captchaObj: any) => {
          captchaObj.appendTo('body');
          captchaObj.onSuccess(async () => {
            const result = captchaObj.getValidate();
            resolve({
              ...result,
              token: captchaSettings.data.token,
            });
          });
          captchaObj.onClose(() => resolve(null));
          captchaObj.onError((err: any) => {
            console.error(err);
            reject(
              new Error(
                `抱歉，验证码校验时出现了错误，请稍后再尝试！\n错误信息：${err.error_code} ${err.user_error}`
              )
            );
          });
          captchaObj.onReady(() => captchaObj.verify());
        }
      );
    });
  };

  const loginWithPassword = async (values: any) => {
    setLoginButtonDisabled(true);

    try {
      const result = await verifyGeetest();

      if (result === null) {
        setLoginButtonDisabled(false);
        return;
      }

      const resp: any = await jsBridge.bilibili.loginWithPassword(
        values.username,
        values.password,
        {
          challenge: result.geetest_challenge,
          seccode: result.geetest_seccode,
          validate: result.geetest_validate,
          token: result.token,
        }
      );

      if (resp.code !== 0) {
        jsBridge.dialog.showMessageBox(location.href, {
          type: 'error',
          title: '登录失败',
          message: `登录失败，理由：${resp.message}`,
        });
      } else {
        onLoginSuccess();
      }
    } catch (err: any) {
      console.error(err);
      jsBridge.dialog.showMessageBox(location.href, {
        type: 'error',
        title: '错误',
        message: err.message,
      });
    } finally {
      setLoginButtonDisabled(false);
    }
  };

  const loginWithSmsCode = async (values: any) => {
    const cid = values.cid.split(',')[0];
    const code = values.code;
    const phoneNumber = values.phoneNumber;
    const captchaKey = values.captchaKey;

    setIsSendSmsButtonDisabled(true);

    const resp = await jsBridge.bilibili.loginWithSmsCode(
      cid,
      phoneNumber,
      code,
      captchaKey
    );

    if (resp.code === 0) {
      onLoginSuccess();
    } else {
      jsBridge.dialog.showMessageBox(location.href, {
        type: 'error',
        title: '失败',
        message: `登录失败：${resp.message}`,
      });
      setIsSendSmsButtonDisabled(false);
    }
  };

  const sendSmsCode = async () => {
    if (smsLoginForm.getFieldError('phoneNumber').length !== 0) return;

    const cid = smsLoginForm.getFieldValue('cid').split(',')[0];
    const phoneNumber = smsLoginForm.getFieldValue('phoneNumber');

    if (!phoneNumber) return;

    setIsSendSmsButtonDisabled(true);

    try {
      const result = await verifyGeetest();

      if (result) {
        const resp: any = await jsBridge.bilibili.sendSms(cid, phoneNumber, {
          challenge: result.geetest_challenge,
          seccode: result.geetest_seccode,
          validate: result.geetest_validate,
          token: result.token,
        });

        if (resp.code !== 0) {
          throw new Error(`发送验证码失败：${resp.message}`);
        }

        smsLoginForm.setFieldsValue({ captchaKey: resp.data.captcha_key });

        setSmsCoolDown(59);

        const coolDown = () => {
          setSmsCoolDown((value) => {
            const newValue = value - 1;

            if (newValue >= 0) {
              setTimeout(coolDown, 1000);
            }
            return newValue;
          });
        };

        setTimeout(coolDown, 1000);
      }
    } catch (err: any) {
      console.error(err);
      jsBridge.dialog.showMessageBox(location.href, {
        type: 'error',
        title: '错误',
        message: err.message,
      });
    } finally {
      setIsSendSmsButtonDisabled(false);
    }
  };

  const loginWithCookie = async (values: any) => {
    const cookieString = values.cookie;

    setIsCookieLoginButtonDisabled(true);
    const result = await jsBridge.bilibili.loginWithCookie(cookieString);

    if (result) {
      onLoginSuccess();
    } else {
      jsBridge.dialog.showMessageBox(location.href, {
        type: 'error',
        title: '登录失败',
        message: '请检查 Cookie 是否正确。',
      });
    }
    setIsCookieLoginButtonDisabled(false);
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
          <div
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
            {qrCodeLoginRequest.loading && '正在加载二维码...'}
            {!qrCodeLoginRequest.loading && !qrCodeLoginRequest.error && (
              <QRCode
                aria-label="二维码"
                value={qrCodeLoginRequest.data.data.url}
              />
            )}
          </div>
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
            role="tooltip"
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
          <Tabs
            tabBarGutter={25}
            size="small"
            centered
            defaultActiveKey="password"
          >
            <Tabs.TabPane tab="密码登录" key="password">
              <Form requiredMark={false} onFinish={loginWithPassword}>
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
                  <Input
                    onContextMenu={() =>
                      jsBridge.contextMenu.showBasicContextMenu()
                    }
                  />
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
                  <Input
                    onContextMenu={() =>
                      jsBridge.contextMenu.showBasicContextMenu()
                    }
                    type="password"
                  />
                </Form.Item>
                <Button
                  disabled={loginButtonDisabled}
                  block
                  type="primary"
                  htmlType="submit"
                >
                  登录
                </Button>
              </Form>
            </Tabs.TabPane>
            <Tabs.TabPane tab="短信登录" key="sms">
              <Form
                form={smsLoginForm}
                labelCol={{
                  offset: 0,
                  span: 7,
                }}
                requiredMark={false}
                onFinish={loginWithSmsCode}
              >
                <Form.Item initialValue={'86,中国大陆'} label="区号" name="cid">
                  <Select
                    showSearch
                    options={countryCallingCodes.map((c) => ({
                      label: `${c.name}(${c.cid})`,
                      // 区号有重复情况（比如美国和加拿大都是 +1）
                      value: `${c.cid.slice(1)},${c.name}`,
                    }))}
                  />
                </Form.Item>
                <Form.Item
                  label="手机号"
                  name="phoneNumber"
                  rules={[
                    {
                      type: 'string',
                      required: true,
                      pattern: /^\d+$/,
                      message: '请输入正确的手机号。',
                    },
                  ]}
                >
                  <Input
                    onContextMenu={() =>
                      jsBridge.contextMenu.showBasicContextMenu()
                    }
                  />
                </Form.Item>
                <Form.Item
                  label="验证码"
                  name="code"
                  required
                  rules={[
                    {
                      type: 'string',
                      required: true,
                      pattern: /^\d{6}$/,
                      message: '请输入正确的验证码。',
                    },
                  ]}
                >
                  <Input
                    onContextMenu={() =>
                      jsBridge.contextMenu.showBasicContextMenu()
                    }
                    type="code"
                  />
                </Form.Item>
                <Form.Item name="captchaKey" hidden>
                  <Input
                    onContextMenu={() =>
                      jsBridge.contextMenu.showBasicContextMenu()
                    }
                  />
                </Form.Item>
                <p>
                  <Button
                    onClick={sendSmsCode}
                    style={{
                      padding: '0',
                    }}
                    type="link"
                    htmlType="button"
                    disabled={isSendSmsButtonDisabled || smsCooldown >= 0}
                  >
                    {smsCooldown >= 0
                      ? `${smsCooldown} 秒后可重新获取验证码`
                      : '获取验证码'}
                  </Button>
                </p>
                <Button
                  disabled={loginButtonDisabled}
                  block
                  type="primary"
                  htmlType="submit"
                >
                  登录
                </Button>
              </Form>
            </Tabs.TabPane>
            <Tabs.TabPane tab="Cookie 登录" key="cookie">
              <Form onFinish={loginWithCookie}>
                <Form.Item
                  name="cookie"
                  label="Cookie"
                  rules={[
                    {
                      type: 'string',
                      required: true,
                      message: '请输入 Cookie。',
                    },
                  ]}
                >
                  <Input.TextArea
                    onContextMenu={() =>
                      jsBridge.contextMenu.showBasicContextMenu()
                    }
                    style={{
                      resize: 'none',
                    }}
                    rows={6}
                    autoSize={false}
                  />
                </Form.Item>
                <Button
                  disabled={isCookieLoginButtonDisabled}
                  htmlType="submit"
                  type="primary"
                  block
                >
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
