import BilibiliVideo from '../../types/models/BilibiliVideo';
import { getAxiosInstance, cookieJar } from '../network';
import IService from './IService';
import crypto from 'crypto';
import GeetestCaptcha from '../../types/models/GeetestCaptcha';
import configService from './config-service';

async function getCSRF() {
  const config = await configService.fns.getAll();
  const tmp = `; ${config.cookieString}`.split('; bili_jct=').pop();

  if (!tmp) return '';
  return tmp.split('; ').shift();
}

const fns = {
  async getVideoInfo(bvid: string): Promise<any> {
    const axios = await getAxiosInstance();
    return (
      await axios.get('https://api.bilibili.com/x/web-interface/view', {
        params: {
          bvid,
        },
      })
    ).data as any;
  },

  async getVideoPlayUrl(bvid: string, cid: string): Promise<any> {
    const axios = await getAxiosInstance();
    return (
      await axios.get('https://api.bilibili.com/x/player/playurl', {
        params: {
          cid,
          bvid,
          fourk: 1,
          otype: 'json',
          fnver: 0,
          fnval: 976,
        },
      })
    ).data;
  },

  async getSelfInfo(): Promise<any> {
    const axios = await getAxiosInstance();
    return (await axios('https://api.bilibili.com/x/space/myinfo')).data;
  },

  async getCaptchaSettings(): Promise<any> {
    const axios = await getAxiosInstance();
    return (
      await axios('https://passport.bilibili.com/x/passport-login/captcha')
    ).data;
  },

  /**
   * 使用密码登录，不报错视为登录成功，会自动更新配置。
   * @param username
   * @param password
   * @param captcha
   */
  async loginWithPassword(
    username: string,
    password: string,
    captcha: GeetestCaptcha
  ): Promise<void> {
    const axios = await getAxiosInstance();

    // 获取加密配置
    const encryptionSettings: any = (
      await axios('https://passport.bilibili.com/x/passport-login/web/key')
    ).data;

    if (encryptionSettings.code !== 0)
      throw new Error(`获取加密配置错误：${encryptionSettings.message}`);

    // 加密密码
    const encryptedPassword = crypto
      .publicEncrypt(
        {
          key: crypto.createPublicKey(encryptionSettings.data.key),
          padding: crypto.constants.RSA_PKCS1_PADDING,
        },
        Buffer.from(`${encryptionSettings.data.hash}${password}`, 'utf-8')
      )
      .toString('base64');

    const loginResult = await axios.post(
      'https://passport.bilibili.com/x/passport-login/web/login',
      new URLSearchParams({
        source: 'main_web',
        username,
        password: encryptedPassword,
        keep: 'true',
        token: captcha.token,
        go_url: 'https://www.bilibili.com/',
        challenge: captcha.challenge,
        validate: captcha.validate,
        seccode: captcha.seccode,
      }).toString(),
      {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
      }
    );

    if (loginResult.data.code !== 0) return loginResult.data;

    // 更新配置
    configService.fns.set(
      'cookieString',
      await cookieJar.getCookieString('https://www.bilibili.com/')
    );

    return loginResult.data;
  },

  async getLoginQrCode() {
    const axios = await getAxiosInstance();
    return (await axios('https://passport.bilibili.com/qrcode/getLoginUrl'))
      .data;
  },

  async getLoginQrCodeStatus(oauthKey: string) {
    const got = await getAxiosInstance();
    const resp: any = (
      await got.post(
        'https://passport.bilibili.com/qrcode/getLoginInfo',
        new URLSearchParams({
          oauthKey,
        }).toString(),
        {
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
        }
      )
    ).data;

    if (resp.status) {
      // 登录成功，更新配置
      configService.fns.set(
        'cookieString',
        await cookieJar.getCookieString('https://www.bilibili.com/')
      );
    }

    return resp;
  },

  async logOut() {
    await cookieJar.removeAllCookies();
    configService.fns.set('cookieString', '');
  },

  async sendSms(cid: string, phoneNumber: string, captcha: GeetestCaptcha) {
    const axios = await getAxiosInstance();
    return (
      await axios.post(
        'https://passport.bilibili.com/x/passport-login/web/sms/send',
        new URLSearchParams({
          cid,
          tel: phoneNumber,
          source: 'main_mini',
          ...captcha,
        }).toString(),
        {
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
        }
      )
    ).data;
  },

  async loginWithSmsCode(
    cid: string,
    phoneNumber: string,
    code: string,
    captchaKey: string
  ) {
    const axios = await getAxiosInstance();
    const resp: any = (
      await axios.post(
        'https://passport.bilibili.com/x/passport-login/web/login/sms',
        new URLSearchParams({
          cid,
          tel: phoneNumber,
          code,
          source: 'main_mini',
          keep: '0',
          captcha_key: captchaKey,
          go_url: 'https://www.bilibili.com/',
        }).toString()
      )
    ).data;

    if (resp.code === 0) {
      // 登录成功，更新配置
      configService.fns.set(
        'cookieString',
        await cookieJar.getCookieString('https://www.bilibili.com/')
      );
    }

    return resp;
  },

  async loginWithCookie(cookieString: string): Promise<boolean> {
    try {
      cookieString
        .split(';')
        .filter((cookie) => !!cookie.trim())
        .forEach((cookie) =>
          cookieJar.setCookieSync(
            `${cookie}; Domain=.bilibili.com`,
            'https://www.bilibili.com/'
          )
        );
    } catch (err) {
      return false;
    }

    const resp = await bilibiliService.fns.getSelfInfo();

    if (resp.code === 0) {
      // 登录成功，更新配置
      configService.fns.set(
        'cookieString',
        await cookieJar.getCookieString('https://www.bilibili.com/')
      );
    }

    return resp.code === 0;
  },
};

const bilibiliService: IService<typeof fns> = {
  name: 'bilibili',
  fns,
};

export default bilibiliService;
