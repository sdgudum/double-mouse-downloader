import { BrowserWindow } from 'electron';
import EventEmitter from 'events';
import IService from './IService';

const windowControlEventEmitter = new EventEmitter();

function makeWindowControlEventName(eventName: string, windowName: string) {
  return `${eventName}:${windowName}`;
}

const fns = {
  async close(hash: string, force = false) {
    windowControlEventEmitter.emit(
      makeWindowControlEventName('close', hash),
      force
    );
  },

  async minimize(hash: string) {
    windowControlEventEmitter.emit(
      makeWindowControlEventName('minimize', hash)
    );
  },

  async focus(hash: string) {
    windowControlEventEmitter.emit(makeWindowControlEventName('focus', hash));
  },

  async setResizable(hash: string, resizable: boolean) {
    windowControlEventEmitter.emit(
      makeWindowControlEventName('setResizable', hash),
      resizable
    );
  },
};

const windowControlService: IService<typeof fns> = {
  name: 'windowControl',
  fns,
};

export default windowControlService;

export function bindWindowEvent(win: BrowserWindow, hash: string) {
  windowControlEventEmitter.on(
    makeWindowControlEventName('close', hash),
    (force = false) => {
      if (force) {
        win.destroy();
      } else {
        win.close();
      }
    }
  );
  windowControlEventEmitter.on(
    makeWindowControlEventName('minimize', hash),
    () => win.minimize()
  );
  windowControlEventEmitter.on(makeWindowControlEventName('focus', hash), () =>
    win.focus()
  );
  windowControlEventEmitter.on(
    makeWindowControlEventName('setResizable', hash),
    (resizable) => win.setResizable(resizable)
  );

  win.on('closed', () => {
    windowControlEventEmitter.removeAllListeners(
      makeWindowControlEventName('close', hash)
    );
    windowControlEventEmitter.removeAllListeners(
      makeWindowControlEventName('minimize', hash)
    );
    windowControlEventEmitter.removeAllListeners(
      makeWindowControlEventName('focus', hash)
    );
    windowControlEventEmitter.removeAllListeners(
      makeWindowControlEventName('setResizable', hash)
    );
  });
}
