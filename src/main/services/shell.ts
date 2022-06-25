import { shell } from 'electron';
import IService from './IService';
import path from 'path';
import fs from 'fs';

const fns = {
  openExternal: shell.openExternal,
  showItemInFolder: async (fullPath: string) => {
    shell.showItemInFolder(path.normalize(fullPath));
  },
  rm: async (filePath: string) => {
    await fs.promises.rm(filePath);
  },
  openPath: shell.openPath,
};

const shellService: IService<typeof fns> = {
  name: 'shell',
  fns,
};

export default shellService;
