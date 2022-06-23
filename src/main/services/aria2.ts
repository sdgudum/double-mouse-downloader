import { RawData, WebSocket } from 'ws';
import IService from './IService';
import { app, dialog, ipcRenderer } from 'electron';
import path from 'path';
import { getBinPath } from '../bin';
import crypto from 'crypto';
import { dynamicImport } from 'tsimportlib';
import { sendToAllBrowserWindows } from '../event';

const secret = crypto.randomBytes(16).toString('hex');
let ws: WebSocket;
let port: number;

export async function initAria2cRpc() {
  const { execa } = (await dynamicImport(
    'execa',
    module
  )) as typeof import('execa');
  const { default: getPort } = (await dynamicImport(
    'get-port',
    module
  )) as typeof import('get-port');
  const aria2cPath = getBinPath('aria2c');
  port = await getPort({
    port: 6800,
  });

  // 启动 aria2c
  await new Promise((resolve, reject) => {
    const spawn = execa(aria2cPath, [
      '--enable-rpc',
      `--rpc-secret=${secret}`,
      `--rpc-listen-port=${port}`,
    ]);
    if (spawn.stdout === null || spawn.stderr == null) {
      reject(new Error('启动 aria2c RPC 失败'));
      return;
    }
    spawn.stdout.on('data', (buf: Buffer) => {
      const msg = buf.toString('utf-8');

      if (msg.includes('IPv4 RPC: listening on TCP port')) {
        resolve(undefined);
      }
    });

    spawn.stderr.on('data', (buf: Buffer) => {
      const msg = buf.toString('utf-8');
      console.error(msg);
      spawn.kill();
      reject(new Error('aria2 初始化失败'));
    });
  });

  const initWs = async () => {
    return new Promise((resolve, reject) => {
      // 连接 ws
      ws = new WebSocket(`ws://127.0.0.1:${port}/jsonrpc`);

      ws.on('error', (err) => {
        console.error(err);
        initWs();
      })
        .on('open', () => {
          console.log('aria2 connected');
          resolve(undefined);
        })
        .on('message', (data) => {
          const msg = JSON.parse(data.toString('utf-8'));
          console.log('<', JSON.stringify(msg));

          if (!msg.method) return;
          sendToAllBrowserWindows(msg.method, ...msg.params);
        });
    });
  };

  await initWs();
}

const fns = {
  async invoke(method: string, ...args: any[]) {
    if (ws.readyState !== WebSocket.OPEN) throw new Error('aria2 WS 未连接。');

    return new Promise((resolve, reject) => {
      const id = crypto.randomUUID();
      const payload = JSON.stringify({
        jsonrpc: '2.0',
        id,
        method,
        params: [`token:${secret}`, ...args],
      });

      console.log('>', payload);

      ws.send(payload, (err) => {
        if (err) {
          reject(err);
        }

        const cb = function (
          this: WebSocket,
          data: RawData,
          isBinary: boolean
        ) {
          const resp = JSON.parse(data.toString('utf-8'));

          if (resp.id !== id) return;

          ws.off('message', cb);

          if (resp.error) {
            reject(new Error(JSON.stringify(resp.error)));
          } else {
            resolve(resp.result);
          }
        };

        ws.on('message', cb);
      });
    });
  },
};

const aria2Service: IService<typeof fns> = {
  name: 'aria2',
  fns,
};

export default aria2Service;
