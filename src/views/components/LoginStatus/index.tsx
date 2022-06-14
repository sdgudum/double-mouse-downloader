import { Avatar } from 'antd';
import React from 'react';
import loginStatusSlice from '../../redux/slices/login-status-slice';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import styles from './index.module.less';

export interface LoginStatusProps {}

const LoginStatus: React.FC<LoginStatusProps> = () => {
  const loginStatus = useAppSelector((state) => state.loginStatus);
  const dispatch = useAppDispatch();

  const login = () => {
    /**TODO: 测试用删除 */
    dispatch(
      loginStatusSlice.actions.setLoginStatus({
        login: true,
        avatar:
          'http://i0.hdslb.com/bfs/face/99895125d7ea820dc13f15b499b5c9b73dd576de.jpg',
        isVip: true,
        userName: 'MoyuScript',
      })
    );
  };

  const logout = () => {
    /**TODO: 测试用删除 */
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
