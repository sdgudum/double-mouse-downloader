import EventEmitter from 'events';

export const WINDOW_CLOSE_REQUEST = 'window-close';
export const WINDOW_MINIMIZE_REQUEST = 'window-minimize';

export const windowControlEventEmitter = new EventEmitter();

export interface WindowControlEvent {
  windowName: string;
}

export function close(windowName: string) {
  const payload: WindowControlEvent = {
    windowName,
  };
  windowControlEventEmitter.emit(WINDOW_CLOSE_REQUEST, payload);
}

export function minimize(windowName: string) {
  const payload: WindowControlEvent = {
    windowName,
  };
  windowControlEventEmitter.emit(WINDOW_MINIMIZE_REQUEST, payload);
}
