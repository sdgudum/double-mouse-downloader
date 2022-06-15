import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { merge } from 'lodash';

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
});

export default loginStatusSlice;
