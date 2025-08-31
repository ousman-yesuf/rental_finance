import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchPayments = createAsyncThunk('payments/fetchPayments', async (rentalUnitId: number) => {
  const response = await axios.get(`http://localhost:5000/payments/${rentalUnitId}`);
  return response.data;
});

export const createPayment = createAsyncThunk('payments/createPayment', async (data: any) => {
  const response = await axios.post('http://localhost:5000/payments', data);
  return response.data;
});

const paymentsSlice = createSlice({
  name: 'payments',
  initialState: { payments: [], status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.payments = action.payload;
        state.status = 'succeeded';
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.payments.push(action.payload);
      });
  },
});

export default paymentsSlice.reducer;