import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchVatReport = createAsyncThunk('vatReport/fetchVatReport', async (buildingId: number, { rejectWithValue }) => {
  try {
    console.log('Fetching VAT report for buildingId:', buildingId);
    const response = await axios.get(`http://localhost:5000/vat-report/${buildingId}`);
    return response.data;
  } catch (error: any) {
    console.error('Fetch VAT Report Error:', error.response?.data || error.message);
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

const vatReportSlice = createSlice({
  name: 'vatReport',
  initialState: {
    report: {
      expensesVAT: [],
      payrollsVAT: [],
      totalVAT: 0,
    },
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVatReport.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchVatReport.fulfilled, (state, action) => {
        state.report = action.payload;
        state.status = 'succeeded';
      })
      .addCase(fetchVatReport.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

export default vatReportSlice.reducer;