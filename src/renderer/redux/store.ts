import { configureStore } from '@reduxjs/toolkit';
import configSlice from './slices/config-slice';
import loginStatusSlice from './slices/login-status-slice';
import updateSlice from './slices/update-slice';

const store = configureStore({
  reducer: {
    loginStatus: loginStatusSlice.reducer,
    config: configSlice.reducer,
    update: updateSlice.reducer,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
