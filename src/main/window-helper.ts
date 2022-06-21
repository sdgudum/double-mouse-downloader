import { BrowserWindow } from 'electron';

export function findBrowserWindowByUrl(url: string): null | BrowserWindow {
  return (
    BrowserWindow.getAllWindows().find((w) => w.webContents.getURL() === url) ||
    null
  );
}
