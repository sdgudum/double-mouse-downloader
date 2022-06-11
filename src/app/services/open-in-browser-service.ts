import { shell } from 'electron';

export async function open(url: string) {
  shell.openExternal(url);
}
