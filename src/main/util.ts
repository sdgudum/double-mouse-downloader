import { app } from 'electron';
import path from 'path';
import fs from 'fs';

/**
 * 获取可执行文件路径
 * @param executableName 可执行文件名字（Win 不含后缀名 .exe）
 * @returns
 */
export function getBinPath(executableName: string) {
  const ext = process.platform === 'win32' ? '.exe' : '';

  return process.env.NODE_ENV === 'development'
    ? path.join(
      app.getAppPath(),
      `./bin/${process.platform}/${process.arch}/${executableName}${ext}`
    )
    : path.join(
      process.resourcesPath,
      `./bin/${process.platform}/${process.arch}/${executableName}${ext}`
    );
}

export async function getPackageJson() {
  const t = await fs.promises.readFile(
    path.join(app.getAppPath(), './package.json'),
    {
      encoding: 'utf-8',
    }
  );
  return JSON.parse(t);
}

export function getTempPath() {
  return path.join(app.getPath('temp'), './double-mouse-downloader/');
}

export function getLogPath() {
  return path.join(getTempPath(), './logs/');
}
