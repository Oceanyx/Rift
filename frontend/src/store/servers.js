// frontend/src/store/servers.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { csrfFetch } from './csrf';

export const fetchServers = createAsyncThunk('servers/fetch', async () => {
  const res = await csrfFetch('/api/servers/me');
  return res.json();
});

const serversSlice = createSlice({
  name: 'servers',
  initialState: { list: [], status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchServers.fulfilled, (state, { payload }) => {
        state.list = payload.servers;
        state.status = 'succeeded';
      });
  }
});

export default serversSlice.reducer;