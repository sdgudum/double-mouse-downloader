import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DownloadTaskVideoPage } from '../../../types/models/DownloadTaskVideoPage';
import DownloadTask from '../../../types/models/DownloadTask';

const STORAGE_KEY = 'downloadState';

function getTaskItem(taskId: string): DownloadTask {
  const item = localStorage.getItem(`${STORAGE_KEY}/tasks/${taskId}`);
  return item ? JSON.parse(item) : null;
}

function setTaskItem(taskId: string, data: any) {
  localStorage.setItem(`${STORAGE_KEY}/tasks/${taskId}`, JSON.stringify(data));
}

function removeTaskItem(taskId: string) {
  localStorage.removeItem(`${STORAGE_KEY}/tasks/${taskId}`);
}

function getIndexes(): string[] {
  return JSON.parse(localStorage.getItem(`${STORAGE_KEY}/index`) || '[]');
}

function setIndexes(indexes: string[]) {
  localStorage.setItem(`${STORAGE_KEY}/index`, JSON.stringify(indexes));
}

function setAriaItem(gid: string, data: any) {
  localStorage.setItem(`${STORAGE_KEY}/aria/${gid}`, JSON.stringify(data));
}

function removeAriaItem(gid: string) {
  localStorage.removeItem(`${STORAGE_KEY}/aria/${gid}`);
}

function getAriaItem(gid: string): any {
  const item = localStorage.getItem(`${STORAGE_KEY}/aria/${gid}`);

  return item ? JSON.parse(item) : null;
}

const initialIndexes = getIndexes();
const initialState: {
  index: string[];
  taskMap: Record<string, DownloadTask>;
  ariaMap: Record<string, any>;
} = {
  index: initialIndexes,
  taskMap: {},
  ariaMap: {},
};

initialIndexes.forEach((taskId) => {
  const task = getTaskItem(taskId);
  initialState.taskMap[taskId] = task;

  if (task.type === 'videoPage') {
    initialState.ariaMap[task.taskVideo.gid] = getAriaItem(task.taskVideo.gid);
    initialState.ariaMap[task.taskAudio.gid] = getAriaItem(task.taskAudio.gid);
  }
});

const downloadSlice = createSlice({
  name: 'download',
  initialState,
  reducers: {
    putTask(state, { payload }: PayloadAction<DownloadTask>) {
      state.taskMap[payload.taskId] = payload;

      if (!state.index.includes(payload.taskId)) {
        state.index.unshift(payload.taskId);
        setIndexes(state.index);
      }

      setTaskItem(payload.taskId, payload);
    },

    /**
     *
     * @param state
     * @param action payload 为 taskId
     */
    removeTask(state, { payload }: PayloadAction<string>) {
      if (!state.taskMap[payload]) return;

      delete state.taskMap[payload];
      state.index = state.index.filter((taskId) => taskId !== payload);

      setIndexes(state.index);
      removeTaskItem(payload);
    },

    /**
     * @param action.payload.relativeOrder -Infinity 为移动到队头，Infinity 为队尾，其他数字为移动相对位置。
     */
    changeTaskOrder(
      state,
      action: PayloadAction<{ taskId: string; relativeOrder: number }>
    ) {
      const { relativeOrder, taskId } = action.payload;

      const index = state.index;
      const prevOrder = index.indexOf(taskId);

      index.splice(prevOrder, 1);
      const insertPosition = prevOrder + relativeOrder;
      index.splice(insertPosition, 0, taskId);

      setIndexes(index);
    },

    putAriaItem(state, action: PayloadAction<any>) {
      state.ariaMap[action.payload.gid] = action.payload;

      setAriaItem(action.payload.gid, action.payload);
    },

    removeAriaItem(state, action: PayloadAction<string>) {
      if (!state.ariaMap[action.payload]) return;

      delete state.ariaMap[action.payload];
      removeAriaItem(action.payload);
    },
  },
});

export default downloadSlice;
