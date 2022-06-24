import IService from './IService';
import path from 'path';

const fns = {
  extname: async (p: string) => path.extname(p),
  basename: async (p: string, ext?: string) => path.basename(p, ext),
  dirname: async (p: string) => path.dirname(p),
  getSep: async () => path.sep,
  join: async (...paths: string[]) => path.join(...paths),
};

const pathService: IService<typeof fns> = {
  name: 'path',
  fns,
};

export default pathService;
