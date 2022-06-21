import { dialog, OpenDialogOptions, SaveDialogOptions } from 'electron';
import { findBrowserWindowByUrl } from '../window-helper';
import IService from './IService';

const fns = {
  showSaveDialog: async (opts: SaveDialogOptions) =>
    dialog.showSaveDialog(opts),
  showOpenDialog: async (opts: OpenDialogOptions) =>
    dialog.showOpenDialog(opts),

  /**
   * ! 同步 API 会阻塞进程，慎用！
   */
  showErrorBox: async (title: string, content: string) =>
    dialog.showErrorBox(title, content),
  showMessageBox: async (
    windowUrl: string,
    opts: Electron.MessageBoxOptions
  ) => {
    const win = findBrowserWindowByUrl(windowUrl);

    if (!win) {
      throw new Error(`找不到 BrowserWindow，url=${windowUrl}`);
    }
    return dialog.showMessageBox(opts);
  },
};

const dialogService: IService<typeof fns> = {
  name: 'dialog',
  fns,
};

export default dialogService;
