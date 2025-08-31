import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchExpenses = createAsyncThunk('expenses/fetchExpenses', async (buildingId: number, { rejectWithValue }) => {
  try {
    const response = await axios.get(`http://localhost:5000/expenses/${buildingId}`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const createExpense = createAsyncThunk('expenses/createExpense', async (data: any, { rejectWithValue }) => {
  try {
    console.log('Sending to backend:', data);
    const response = await axios.post('http://localhost:5000/expenses', data);
    return response.data;
  } catch (error: any) {
    console.error('Create Expense Error:', error.response?.data || error.message);
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const updateExpense = createAsyncThunk('expenses/updateExpense', async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
  try {
    console.log('Sending PATCH to backend:', { id, data });
    const response = await axios.patch(`http://localhost:5000/expenses/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error('Update Expense Error:', error.response?.data || error.message);
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const deleteExpense = createAsyncThunk('expenses/deleteExpense', async (id: number, { rejectWithValue }) => {
  try {
    console.log('Sending DELETE to backend:', id);
    await axios.delete(`http://localhost:5000/expenses/${id}`);
    return id;
  } catch (error: any) {
    console.error('Delete Expense Error:', error.response?.data || error.message);
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

const expensesSlice = createSlice({
  name: 'expenses',
  initialState: { expenses: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.expenses = action.payload;
        state.status = 'succeeded';
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.expenses.push(action.payload);
        state.status = 'succeeded';
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        const index = state.expenses.findIndex((exp) => exp.id === action.payload.id);
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
        state.status = 'succeeded';
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter((exp) => exp.id !== action.payload);
        state.status = 'succeeded';
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

export default expensesSlice.reducer;