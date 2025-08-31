import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchSummary = createAsyncThunk('summary/fetchSummary', async (buildingId: number, { rejectWithValue }) => {
  try {
    console.log('Fetching summary for buildingId:', buildingId);
    const response = await axios.get(`http://localhost:5000/summary/${buildingId}`);
    return response.data;
  } catch (error: any) {
    console.error('Fetch Summary Error:', error.response?.data || error.message);
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

const summarySlice = createSlice({
  name: 'summary',
  initialState: {
    summary: {
      totalRent: 0,
      totalExpenses: 0,
      totalPayroll: 0,
      totalVAT: 0,
      outstandingRent: 0,
      numUnits: 0,
      numTenants: 0,
      recentPayments: [],
      topTenants: [],
    },
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSummary.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
        state.status = 'succeeded';
      })
      .addCase(fetchSummary.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

export default summarySlice.reducer;