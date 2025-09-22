import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { paymentMethodsApi } from '../services/apiService';

export const fetchPaymentMethods = createAsyncThunk(
  'paymentMethods/fetchPaymentMethods',
  async (userId = 'default', { rejectWithValue }) => {
    try {
      const response = await paymentMethodsApi.getPaymentMethods(userId);
      if (response.status === 'success') {
        return response.data;
      }
      return rejectWithValue(
        response.message || 'Failed to load payment methods'
      );
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createPaymentMethod = createAsyncThunk(
  'paymentMethods/createPaymentMethod',
  async (paymentData, { getState, rejectWithValue }) => {
    try {
      const userId = getState().userId.value || 'default';
      const response = await paymentMethodsApi.createPaymentMethod(
        { ...paymentData, userId },
        userId
      );
      if (response.status === 'success') {
        return response.data;
      }
      return rejectWithValue(
        response.message || 'Failed to create payment method'
      );
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updatePaymentMethod = createAsyncThunk(
  'paymentMethods/updatePaymentMethod',
  async ({ id, cardData }, { rejectWithValue }) => {
    try {
      const response = await paymentMethodsApi.updatePaymentMethod(
        id,
        cardData
      );
      if (response.status === 'success') {
        return response.data;
      }
      return rejectWithValue(
        response.message || 'Failed to update payment method'
      );
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deletePaymentMethod = createAsyncThunk(
  'paymentMethods/deletePaymentMethod',
  async (id, { rejectWithValue }) => {
    try {
      const response = await paymentMethodsApi.deletePaymentMethod(id);
      if (response.status === 'success') {
        return id;
      }
      return rejectWithValue(
        response.message || 'Failed to delete payment method'
      );
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const paymentMethodsSlice = createSlice({
  name: 'paymentMethods',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPaymentMethods.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPaymentMethods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createPaymentMethod.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updatePaymentMethod.fulfilled, (state, action) => {
        const idx = state.items.findIndex((i) => i.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deletePaymentMethod.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i.id !== action.payload);
      });
  },
});

export default paymentMethodsSlice.reducer;
