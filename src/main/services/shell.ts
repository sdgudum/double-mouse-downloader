import { shell } from 'electron';
import IService from './IService';

const fns = {
  openExternal: shell.openExternal,
  showItemInFolder: shell.showItemInFolder,
};

const shellService: IService<typeof fns> = {
  name: 'shell',
  fns,
};

export default shellService;
