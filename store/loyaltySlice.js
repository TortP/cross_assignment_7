/**
 * Redux slice для управления программой лояльности.
 * Обрабатывает баллы лояльности, уровни и привилегии пользователя.
 *
 * State:
 * - info: информация о программе лояльности
 * - loading: состояние загрузки
 * - error: ошибки операций
 *
 * Прототип
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loyaltyApi } from '../services/apiService';

export const fetchLoyalty = createAsyncThunk(
  'loyalty/fetchLoyalty',
  async (userId = 'default', { rejectWithValue }) => {
    try {
      const response = await loyaltyApi.getLoyaltyInfo(userId);
      if (response.status === 'success') {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to load loyalty info');
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateLoyaltyPoints = createAsyncThunk(
  'loyalty/updateLoyaltyPoints',
  async ({ points, userId }, { getState, rejectWithValue }) => {
    try {
      const actualUserId = userId || getState().userId.value || 'default';
      const response = await loyaltyApi.updateLoyaltyPoints(
        actualUserId,
        points
      );
      if (response.status === 'success') {
        return response.data;
      }
      return rejectWithValue(
        response.message || 'Failed to update loyalty points'
      );
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const loyaltySlice = createSlice({
  name: 'loyalty',
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearLoyalty: (state) => {
      state.data = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLoyalty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLoyalty.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchLoyalty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateLoyaltyPoints.fulfilled, (state, action) => {
        state.data = action.payload;
      });
  },
});

export const { clearLoyalty } = loyaltySlice.actions;

export default loyaltySlice.reducer;
