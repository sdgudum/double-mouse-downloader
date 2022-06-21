import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { merge } from 'lodash';

export const fetchSelfInfoAction = createAsyncThunk(
  'loginStatus/fetchSelfInfo',
  async () => {
    const resp: any = await jsBridge.bilibili.getSelfInfo();

    if (resp.code !== 0) throw new Error(resp.message);
    return resp.data;
  }
);

interface LoginStatusState {
  login: boolean;
  avatar: string;
  userName: string;
  isVip: boolean;
}

const initialState: LoginStatusState = {
  login: false,
  avatar: '',
  userName: '',
  isVip: false,
};

const loginStatusSlice = createSlice({
  name: 'loginStatus',
  initialState,
  reducers: {
    setLoginStatus: (state, action: PayloadAction<LoginStatusState>) => {
      merge(state, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSelfInfoAction.fulfilled, (state, action) => {
        const payload = action.payload;

        state.login = true;
        state.avatar = payload.face;
        state.userName = payload.name;
        state.isVip = !!payload.vip.status;
      })
      .addCase(fetchSelfInfoAction.rejected, (state) => {
        state.login = false;
      });
  },
});

export default loginStatusSlice;
