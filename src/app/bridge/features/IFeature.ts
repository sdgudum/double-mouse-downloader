import { ipcMain } from 'electron';

export default interface IFeature {
  name: string;
  devOnly?: boolean;
  apis: {
    [functionName: string]: Parameters<typeof ipcMain.handle>[1];
  };
  // eslint-disable-next-line semi
}
