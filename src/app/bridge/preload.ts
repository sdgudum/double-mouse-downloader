import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('jsBridge', {
  hello: () => 'world',
});
