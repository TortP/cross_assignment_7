/**
 * Redux slice для управления каталогом товаров.
 * Обрабатывает загрузку и фильтрацию товаров.
 * 
 * Async thunks:
 * - fetchProducts: загрузка товаров с сервера с поддержкой фильтров
 * 
 * State:
 * - items: массив товаров
 * - loading: состояние загрузки
 * - error: ошибки операций
 * 
 * Поддерживает фильтрацию по категориям.
 * Интеграция с API для получения актуальной информации о товарах.
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productApi } from '../services/apiService';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await productApi.getProducts(filters);
      if (response.status === 'success') {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to load products');
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default productsSlice.reducer;
