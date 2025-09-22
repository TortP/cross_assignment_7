import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderApi } from '../services/apiService';

export const loadOrdersData = createAsyncThunk(
  'orderStatus/loadOrdersData',
  async ({ userId, orderNumber }, { dispatch, rejectWithValue }) => {
    try {
      let currentOrder = null;
      if (orderNumber) {
        const response = await orderApi.getOrders(userId);
        if (response.status === 'success' && response.data.length > 0) {
          const matchingOrder = response.data.find(
            (order) => order.orderNumber === orderNumber
          );
          if (matchingOrder) {
            currentOrder = matchingOrder;
          }
        }
      } else {
        const response = await orderApi.getOrders(userId);
        if (response.status === 'success' && response.data.length > 0) {
          const inProgressOrders = response.data.filter(
            (order) => order.status === 'in_progress'
          );
          if (inProgressOrders.length > 0) {
            const sortedOrders = inProgressOrders.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            currentOrder = sortedOrders[0];
          }
        }
      }

      const previousOrdersResponse = await orderApi.getOrders(userId);
      let previousOrders = [];
      if (previousOrdersResponse.status === 'success') {
        previousOrders = previousOrdersResponse.data.filter(
          (order) => order.status !== 'in_progress'
        );
      }

      return { currentOrder, previousOrders };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateCurrentOrderStatus = createAsyncThunk(
  'orderStatus/updateCurrentOrderStatus',
  async ({ userId, currentOrderId }, { rejectWithValue }) => {
    try {
      const response = await orderApi.getOrderById(userId, currentOrderId);
      if (response.status === 'success') {
        return response.data;
      }
      return null;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const orderStatusSlice = createSlice({
  name: 'orderStatus',
  initialState: {
    activeTab: 'current',
    currentOrder: null,
    previousOrders: [],
    loading: false,
    refreshing: false,
    error: null,
  },
  reducers: {
    setActiveTab(state, action) {
      state.activeTab = action.payload;
    },
    setRefreshing(state, action) {
      state.refreshing = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadOrdersData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadOrdersData.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.currentOrder;
        state.previousOrders = action.payload.previousOrders;
      })
      .addCase(loadOrdersData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCurrentOrderStatus.fulfilled, (state, action) => {
        if (action.payload) {
          state.currentOrder = { ...state.currentOrder, ...action.payload };
        }
      });
  },
});

export const { setActiveTab, setRefreshing, setError } =
  orderStatusSlice.actions;
export default orderStatusSlice.reducer;
