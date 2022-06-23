import { app } from 'electron';
import path from 'path';

/**
 * 获取可执行文件路径
 * @param executableName 可执行文件名字（Win 不含后缀名 .exe）
 * @returns
 */
export function getBinPath(executableName: string) {
  const appPath = app.getAppPath();
  const ext = process.platform === 'win32' ? '.exe' : '';

  return process.env.NODE_ENV === 'development'
    ? path.join(
      appPath,
      `./bin/${process.platform}/${process.arch}/${executableName}${ext}`
    )
    : path.join(
      appPath,
      `${process.platform === 'darwin' ? './Contents/' : './'}resources/bin/${
        process.platform
      }/${process.arch}/${executableName}${ext}`
    );
}
