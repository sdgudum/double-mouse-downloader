import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { merge } from 'lodash';
import Config from '../../../types/models/Config';

export const fetchConfigAction = createAsyncThunk('config/fetch', () =>
  jsBridge.config.getAll()
);

const initialState = {
  data: null,
} as {
  data: Config | null;
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    set(state, action: PayloadAction<any>) {
      merge(state.data, action.payload);
    },
  },
  extraReducers(builder) {
    builder.addCase(fetchConfigAction.fulfilled, (state, action) => {
      state.data = action.payload;
    });
  },
});

export default configSlice;
