import { configureStore } from '@reduxjs/toolkit';
import loginStatusSlice from './slices/login-status-slice';

const store = configureStore({
  reducer: {
    loginStatus: loginStatusSlice.reducer,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
