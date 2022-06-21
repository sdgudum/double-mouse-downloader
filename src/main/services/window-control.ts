import { BrowserWindow } from 'electron';
import EventEmitter from 'events';
import IService from './IService';

const windowControlEventEmitter = new EventEmitter();

function makeWindowControlEventName(eventName: string, windowName: string) {
  return `${eventName}:${windowName}`;
}

const fns = {
  async close(windowName: string) {
    windowControlEventEmitter.emit(
      makeWindowControlEventName('close', windowName)
    );
  },

  async minimize(windowName: string) {
    windowControlEventEmitter.emit(
      makeWindowControlEventName('minimize', windowName)
    );
  },

  async focus(windowName: string) {
    windowControlEventEmitter.emit(
      makeWindowControlEventName('focus', windowName)
    );
  },

  async setResizable(windowName: string, resizable: boolean) {
    windowControlEventEmitter.emit(
      makeWindowControlEventName('setResizable', windowName),
      resizable
    );
  },
};

const windowControlService: IService<typeof fns> = {
  name: 'windowControl',
  fns,
};

export default windowControlService;

export function bindWindowEvent(win: BrowserWindow, windowName: string) {
  windowControlEventEmitter.on(
    makeWindowControlEventName('close', windowName),
    () => win.close()
  );
  windowControlEventEmitter.on(
    makeWindowControlEventName('minimize', windowName),
    () => win.minimize()
  );
  windowControlEventEmitter.on(
    makeWindowControlEventName('focus', windowName),
    () => win.focus()
  );
  windowControlEventEmitter.on(
    makeWindowControlEventName('setResizable', windowName),
    (resizable) => win.setResizable(resizable)
  );

  win.on('closed', () => {
    windowControlEventEmitter.removeAllListeners(
      makeWindowControlEventName('close', windowName)
    );
    windowControlEventEmitter.removeAllListeners(
      makeWindowControlEventName('minimize', windowName)
    );
    windowControlEventEmitter.removeAllListeners(
      makeWindowControlEventName('focus', windowName)
    );
    windowControlEventEmitter.removeAllListeners(
      makeWindowControlEventName('setResizable', windowName)
    );
  });
}
