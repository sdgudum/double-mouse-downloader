import { RawData, WebSocket } from 'ws';
import IService from './IService';
import { app, dialog, ipcRenderer } from 'electron';
import path from 'path';
import { getBinPath } from '../util';
import crypto from 'crypto';
import { sendToAllBrowserWindows } from '../event';
import fs from 'fs';
import { getPort } from 'get-port-please';
import cp from 'child_process';

const secret = crypto.randomBytes(16).toString('hex');
let ws: WebSocket;
let port: number;

export async function initAria2cRpc() {
  const aria2cPath = getBinPath('aria2c');
  port = await getPort({
    port: 6800,
  });

  // 启动 aria2c
  await new Promise((resolve, reject) => {
    const spawn = cp.spawn(aria2cPath, [
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
      reject(
        new Error(
          JSON.stringify({
            message: 'aria2 初始化失败',
            aria2cPath,
            args: spawn.spawnargs,
          })
        )
      );
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

let id = 0;

const fns = {
  async invoke(method: string, ...args: any[]): Promise<any> {
    if (ws.readyState !== WebSocket.OPEN) throw new Error('aria2 WS 未连接。');

    return new Promise((resolve, reject) => {
      const currentId = id++;

      let params;

      if (method === 'system.multicall') {
        params = [
          (args[0] as any[]).map((v) => ({
            methodName: v.methodName,
            params: [`token:${secret}`, ...(v.params || [])],
          })),
        ];
      } else {
        params = [`token:${secret}`, ...args];
      }
      const payload = JSON.stringify({
        jsonrpc: '2.0',
        id: currentId,
        method,
        params: params,
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

          if (resp.id !== currentId) return;

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
