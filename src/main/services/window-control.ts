import EventEmitter from 'events';
import IService from './IService';

export const WINDOW_CLOSE = 'window-close';
export const WINDOW_MINIMIZE = 'window-minimize';

export const windowControlEventEmitter = new EventEmitter();

export function makeWindowControlEventName(
  eventName: string,
  windowName: string
) {
  return `${eventName}:${windowName}`;
}

const fns = {
  async close(windowName: string) {
    windowControlEventEmitter.emit(`${WINDOW_CLOSE}:${windowName}`);
  },

  async minimize(windowName: string) {
    windowControlEventEmitter.emit(`${WINDOW_MINIMIZE}:${windowName}`);
  },
};

const windowControlService: IService<typeof fns> = {
  name: 'windowControl',
  fns,
};

export default windowControlService;
