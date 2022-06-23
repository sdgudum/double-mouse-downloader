import { BrowserWindow } from 'electron';

export function sendToAllBrowserWindows(channel: string, ...args: any[]) {
  BrowserWindow.getAllWindows().forEach((w) =>
    w.webContents.send(channel, ...args)
  );
}
