import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchRentalUnits = createAsyncThunk('rentalUnits/fetchRentalUnits', async (buildingId: number, { rejectWithValue }) => {
  try {
    const response = await axios.get(`http://localhost:5000/units/${buildingId}`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const createRentalUnit = createAsyncThunk(
  'rentalUnits/createRentalUnit',
  async (data: any, { rejectWithValue }) => {
    try {
      console.log('Sending to backend:', data);
      const response = await axios.post('http://localhost:5000/units', data);
      return response.data;
    } catch (error: any) {
      console.error('Create Rental Unit Error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const updateRentalUnit = createAsyncThunk(
  'rentalUnits/updateRentalUnit',
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`http://localhost:5000/units/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const deleteRentalUnit = createAsyncThunk(
  'rentalUnits/deleteRentalUnit',
  async (id: number, { rejectWithValue }) => {
    try {
      await axios.delete(`http://localhost:5000/units/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const rentalUnitsSlice = createSlice({
  name: 'rentalUnits',
  initialState: { units: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRentalUnits.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchRentalUnits.fulfilled, (state, action) => {
        state.units = action.payload;
        state.status = 'succeeded';
      })
      .addCase(fetchRentalUnits.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(createRentalUnit.fulfilled, (state, action) => {
        state.units.push(action.payload);
        state.status = 'succeeded';
      })
      .addCase(createRentalUnit.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(updateRentalUnit.fulfilled, (state, action) => {
        const index = state.units.findIndex(unit => unit.id === action.payload.id);
        if (index !== -1) {
          state.units[index] = action.payload;
        }
        state.status = 'succeeded';
      })
      .addCase(updateRentalUnit.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(deleteRentalUnit.fulfilled, (state, action) => {
        state.units = state.units.filter(unit => unit.id !== action.payload);
        state.status = 'succeeded';
      })
      .addCase(deleteRentalUnit.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

export default rentalUnitsSlice.reducer;