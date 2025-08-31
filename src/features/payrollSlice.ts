import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchPayrolls = createAsyncThunk('payroll/fetchPayrolls', async (buildingId: number, { rejectWithValue }) => {
  try {
    console.log('Fetching payrolls for buildingId:', buildingId);
    const response = await axios.get(`http://localhost:5000/payrolls/${buildingId}`);
    return response.data;
  } catch (error: any) {
    console.error('Fetch Payrolls Error:', error.response?.data || error.message);
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const createPayroll = createAsyncThunk('payroll/createPayroll', async (data: any, { rejectWithValue }) => {
  try {
    console.log('Sending POST /payrolls:', data);
    const response = await axios.post('http://localhost:5000/payrolls', data);
    return response.data;
  } catch (error: any) {
    console.error('Create Payroll Error:', error.response?.data || error.message);
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const updatePayroll = createAsyncThunk('payroll/updatePayroll', async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
  try {
    console.log('Sending PATCH /payrolls:', { id, data });
    const response = await axios.patch(`http://localhost:5000/payrolls/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error('Update Payroll Error:', error.response?.data || error.message);
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const deletePayroll = createAsyncThunk('payroll/deletePayroll', async (id: number, { rejectWithValue }) => {
  try {
    console.log('Sending DELETE /payrolls:', id);
    await axios.delete(`http://localhost:5000/payrolls/${id}`);
    return id;
  } catch (error: any) {
    console.error('Delete Payroll Error:', error.response?.data || error.message);
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

const payrollSlice = createSlice({
  name: 'payroll',
  initialState: {
    payrolls: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayrolls.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPayrolls.fulfilled, (state, action) => {
        state.payrolls = action.payload;
        state.status = 'succeeded';
      })
      .addCase(fetchPayrolls.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(createPayroll.fulfilled, (state, action) => {
        state.payrolls.push(action.payload);
        state.status = 'succeeded';
      })
      .addCase(createPayroll.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(updatePayroll.fulfilled, (state, action) => {
        const index = state.payrolls.findIndex((pay) => pay.id === action.payload.id);
        if (index !== -1) {
          state.payrolls[index] = action.payload;
        }
        state.status = 'succeeded';
      })
      .addCase(updatePayroll.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(deletePayroll.fulfilled, (state, action) => {
        state.payrolls = state.payrolls.filter((pay) => pay.id !== action.payload);
        state.status = 'succeeded';
      })
      .addCase(deletePayroll.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

export default payrollSlice.reducer;