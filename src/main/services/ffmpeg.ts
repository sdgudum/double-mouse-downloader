import { dynamicImport } from 'tsimportlib';
import { getBinPath } from '../util';
import IService from './IService';

const fns = {
  async merge(videoPath: string, audioPath: string, outputPath: string) {
    const { execa } = (await dynamicImport(
      'execa',
      module
    )) as typeof import('execa');
    const ffmpegPath = getBinPath('ffmpeg');

    const { stderr, stdout } = await execa(ffmpegPath, [
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
    return { stderr, stdout };
  },
};

const ffmpegService: IService<typeof fns> = {
  name: 'ffmpeg',
  fns,
};

export default ffmpegService;
