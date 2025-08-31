import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchBuildings = createAsyncThunk('buildings/fetchBuildings', async () => {
  const response = await axios.get('http://localhost:5000/buildings');
  return response.data;
});

export const createBuilding = createAsyncThunk('buildings/createBuilding', async (data: any) => {
  const response = await axios.post('http://localhost:5000/buildings', data);
  return response.data;
});

const buildingsSlice = createSlice({
  name: 'buildings',
  initialState: { buildings: [], status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBuildings.fulfilled, (state, action) => {
        state.buildings = action.payload;
        state.status = 'succeeded';
      })
      .addCase(createBuilding.fulfilled, (state, action) => {
        state.buildings.push(action.payload);
      });
  },
});

export default buildingsSlice.reducer;