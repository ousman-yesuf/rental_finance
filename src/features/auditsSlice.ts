import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchAudits = createAsyncThunk('audits/fetchAudits', async (buildingId: number) => {
  const response = await axios.get(`http://localhost:5000/audits/${buildingId}`);
  return response.data;
});

const auditsSlice = createSlice({
  name: 'audits',
  initialState: { audits: [], status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchAudits.fulfilled, (state, action) => {
      state.audits = action.payload;
      state.status = 'succeeded';
    });
  },
});

export default auditsSlice.reducer;