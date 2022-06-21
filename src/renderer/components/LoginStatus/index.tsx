import { Avatar } from 'antd';
import React, { useRef } from 'react';
import loginStatusSlice, {
  fetchSelfInfoAction,
} from '../../redux/slices/login-status-slice';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import styles from './index.module.less';
import { useMount } from 'ahooks';

export interface LoginStatusProps {}

const LoginStatus: React.FC<LoginStatusProps> = () => {
  const loginStatus = useAppSelector((state) => state.loginStatus);
  const dispatch = useAppDispatch();
  const loginWindowRef = useRef<Window | null>();

  const login = async () => {
    if (loginWindowRef.current) {
      if (!loginWindowRef.current.closed) {
        jsBridge.windowControl.focus('login');
        return;
      }
    }

    const url = new URL(location.href);
    url.hash = '#login';
    const loginWindow = window.open(
      url,
      '_blank',
      'popup=1,height=494,width=800'
    );

    if (!loginWindow) {
      jsBridge.dialog.showMessageBox(location.href, {
        title: '错误',
        message: '错误：打开登录窗口失败\n这可能是一个 BUG，请向作者反馈。',
        type: 'error',
      });
      return;
    }
    // 透传 JSbridge
    loginWindow.jsBridge = window.jsBridge;

    loginWindowRef.current = loginWindow;

    loginWindow.addEventListener('unload', () => {
      setTimeout(() => {
        if (loginWindow.closed) {
          loginWindowRef.current = null;
        }
      }, 50);
    });

    loginWindow.addEventListener('load', () => {
      jsBridge.windowControl.setResizable('login', false);
    });

    window.addEventListener(
      'loginSuccess',
      async () => {
        loginWindow.close();
        dispatch(fetchSelfInfoAction());
      },
      {
        once: true,
      }
    );
  };

  const logout = () => {
    jsBridge.bilibili.logOut();
    dispatch(
      loginStatusSlice.actions.setLoginStatus({
        login: false,
        avatar: '',
        isVip: false,
        userName: '',
      })
    );
  };

  return (
    <div
      aria-label={`登录管理-${loginStatus.login ? '已登录' : '未登录'}`}
      style={{
        position: 'absolute',
        top: '0',
        right: '0',
        margin: '.5em .5em 0 0',
        color: 'white',
        zIndex: 1,
      }}
    >
      {loginStatus.login ? (
        <>
          <div
            style={{
              display: 'inline-block',
              position: 'relative',
            }}
          >
            <Avatar src={loginStatus.avatar} draggable={false} alt="用户头像" />
            {loginStatus.isVip && (
              <span
                style={{
                  position: 'absolute',
                  left: '0',
                  bottom: '-.5em',
                  width: '100%',
                  textAlign: 'center',
                  backgroundColor: 'rgb(251, 114, 153)',
                  verticalAlign: 'middle',
                  borderRadius: '.5em',
                  fontSize: '.6em',
                }}
              >
                大会员
              </span>
            )}
          </div>
          <strong
            style={{
              fontSize: '1.2em',
              marginLeft: '.2em',
              verticalAlign: 'middle',
            }}
          >
            {loginStatus.userName}
          </strong>
          <button
            aria-label="登出"
            className={styles.logoutButton}
            onClick={logout}
            style={{
              background: 'none',
              border: 'none',
              verticalAlign: 'middle',
              cursor: 'pointer',
            }}
          >
            <i
              style={{
                verticalAlign: 'middle',
              }}
              className="fa-solid fa-right-from-bracket"
            ></i>
          </button>
        </>
      ) : (
        <button
          aria-label="登录"
          onClick={login}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <Avatar className={styles.avatar}>
            <span
              style={{
                color: '#00aeec',
              }}
            >
              登录
            </span>
          </Avatar>
        </button>
      )}
    </div>
  );
};

export default LoginStatus;
