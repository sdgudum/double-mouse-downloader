import { dialog, OpenDialogOptions, SaveDialogOptions } from 'electron';
import IService from './IService';

const fns = {
  showSaveDialog: async (opts: SaveDialogOptions) =>
    dialog.showSaveDialog(opts),
  showOpenDialog: async (opts: OpenDialogOptions) =>
    dialog.showOpenDialog(opts),
};

const dialogService: IService<typeof fns> = {
  name: 'dialog',
  fns,
};

export default dialogService;
