/**
 * Redux slice для управления категориями товаров.
 * Обрабатывает загрузку и хранение категорий из API.
 * 
 * Async thunks:
 * - fetchCategories: загрузка списка категорий с сервера
 * 
 * State:
 * - items: массив категорий
 * - loading: состояние загрузки
 * - error: ошибки операций
 * 
 * Используется для фильтрации товаров по категориям.
 * Поддерживает многоязычные названия категорий.
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { categoryApi } from '../services/apiService';

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await categoryApi.getCategories();
      if (response.status === 'success') {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to load categories');
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default categoriesSlice.reducer;
