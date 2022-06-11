import EventEmitter from 'events';

export const WINDOW_CLOSE_EVENT = 'window-close';
export const WINDOW_MINIMIZE_EVENT = 'window-minimize';

export const windowControlEventEmitter = new EventEmitter();

export interface WindowControlEvent {
  windowName: string;
}

export function close(windowName: string) {
  const payload: WindowControlEvent = {
    windowName,
  };
  windowControlEventEmitter.emit(WINDOW_CLOSE_EVENT, payload);
}

export function minimize(windowName: string) {
  const payload: WindowControlEvent = {
    windowName,
  };
  windowControlEventEmitter.emit(WINDOW_MINIMIZE_EVENT, payload);
}
