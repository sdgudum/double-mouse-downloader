import { getBinPath } from '../util';
import IService from './IService';
import cp from 'child_process';

const fns = {
  async merge(
    videoPath: string,
    audioPath: string,
    outputPath: string
  ): Promise<{
    stdout: string;
    stderr: string;
  }> {
    const ffmpegPath = getBinPath('ffmpeg');

    const sp = cp.spawn(ffmpegPath, [
      '-i',
      videoPath,
      '-i',
      audioPath,
      '-c:v',
      'copy',
      '-c:a',
      'copy',
      outputPath,
      '-y',
    ]);

    return new Promise((resolve, reject) => {
      let stdout = '';
      let stderr = '';

      sp.stdout.on('data', (chunk: Buffer) => {
        stdout += chunk.toString('utf-8');
      });

      sp.stderr.on('data', (chunk: Buffer) => {
        stderr += chunk.toString('utf-8');
      });

      sp.on('exit', (code) => {
        if (code !== 0) {
          // error
          reject(`退出码：${code}，stderr：${stderr}`);
        } else {
          resolve({ stdout, stderr });
        }
      });

      sp.on('error', (err) => {
        console.error(err);
        reject(err.message);
      });
    });
  },
};

const ffmpegService: IService<typeof fns> = {
  name: 'ffmpeg',
  fns,
};

export default ffmpegService;
