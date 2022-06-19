import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const UPDATE_STATE_KEY = 'updateState';

export const fetchReleaseInfoAction = createAsyncThunk(
  'update/checkForUpdate',
  async () => {
    const resp = await fetch(
      'https://api.github.com/repos/MoyuScript/double-mouse-downloader/releases'
    );
    return resp.json();
  }
);

interface UpdateState {
  latestVersion: string;
  url: string;
  status: 'idle' | 'pending' | 'ok' | 'error';
}

function getStorageState(): UpdateState {
  const storageState = localStorage.getItem(UPDATE_STATE_KEY);

  if (!storageState) {
    return {
      latestVersion: __APP_VERSION__,
      status: 'idle',
      url: '',
    };
  }

  return JSON.parse(storageState);
}

function saveStorageState(state: UpdateState): void {
  localStorage.setItem(UPDATE_STATE_KEY, JSON.stringify(state));
}

const updateSlice = createSlice({
  name: 'update',
  initialState: getStorageState(),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReleaseInfoAction.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(fetchReleaseInfoAction.rejected, (state) => {
        state.status = 'error';
      })
      .addCase(fetchReleaseInfoAction.fulfilled, (state, action) => {
        state.status = 'ok';
        const resp = (action.payload as any[]).filter((r) => !r.prerelease);

        if (resp.length === 0) return;

        const release = resp[0];
        state.latestVersion = release.tag_name.slice(1);
        state.url = release.html_url;

        saveStorageState(state);

        const noti = new Notification('鼠鼠下载器有新版本啦~', {
          body: `${__APP_VERSION__} -> ${state.latestVersion}\n点击这里跳转到新版本下载页面。`,
        });

        noti.onclick = function () {
          jsBridge.openInBrowser.open(release.html_url);
        };
      });
  },
});

export default updateSlice;
