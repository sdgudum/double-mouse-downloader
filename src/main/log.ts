import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { getPackageJson, getTempPath } from './util';
import log4js from 'log4js';

interface CrashFileData {
  version: string;
  time: string;
  env: Record<string, unknown>;
  platform: string;
  arch: string;
  versions: any;
  systemVersion: string;
  detail: any;
}

export async function reportCrash(crashInfo: any) {
  const packageJson = await getPackageJson();

  const file: CrashFileData = {
    version: packageJson.version,
    time: new Date().toISOString(),
    env: process.env,
    platform: process.platform,
    arch: process.arch,
    versions: process.versions,
    systemVersion: process.version,
    detail: crashInfo,
  };

  const fileName = `crash-report ${file.time.replace(/:/g, '-')}.json`;
  const dir = path.join(getTempPath(), './crash-reports/');
  const filePath = path.join(dir, fileName);

  fs.existsSync(dir) ||
    fs.mkdirSync(dir, {
      recursive: true,
    });

  fs.writeFileSync(filePath, JSON.stringify(file, undefined, 2));

  return filePath;
}

export function configureLog4js() {
  log4js.configure({
    appenders: {
      stdout: {
        type: 'stdout',
        layout: {
          type: 'colored',
        },
      },
    },
    categories: {
      default: {
        appenders: ['stdout'],
        level: 'info',
      },
    },
  });
}
