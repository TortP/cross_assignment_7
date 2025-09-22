/**
 * Redux slice для управления корзиной товаров.
 * Обрабатывает все операции с корзиной: добавление, удаление, изменение количества.
 *
 * Async thunks:
 * - fetchCart: загрузка корзины пользователя
 * - addToCart: добавление товара в корзину
 * - updateCartItemQuantity: изменение количества товара
 * - clearCartByUser: очистка корзины пользователя
 *
 * State:
 * - items: массив товаров в корзине
 * - loading: состояние загрузки
 * - error: ошибки операций
 *
 * Интеграция с API для синхронизации с сервером.
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartApi } from '../services/apiService';

export const clearCartByUser = createAsyncThunk(
  'cart/clearCartByUser',
  async (userId, { dispatch, rejectWithValue }) => {
    try {
      const response = await cartApi.getCart(userId);
      if (response.status !== 'success' || !Array.isArray(response.data)) {
        throw new Error('Failed to fetch cart');
      }
      const userCartItems = response.data.filter(
        (item) => item.userId === userId
      );
      for (const item of userCartItems) {
        await cartApi.removeFromCart(item.id, userId);
      }
      dispatch(fetchCart(userId));
      return true;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await cartApi.getCart(userId);
      if (response.status === 'success' && Array.isArray(response.data)) {
        return response.data.filter((item) => item.userId === userId);
      }
      return [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productData, userId }, { dispatch, rejectWithValue }) => {
    try {
      const cartResp = await cartApi.getCart(userId);
      let cartItem = null;
      let userCartItems = [];
      if (cartResp.status === 'success' && Array.isArray(cartResp.data)) {
        userCartItems = cartResp.data.filter((item) => item.userId === userId);
        cartItem = userCartItems.find(
          (item) => String(item.productId) === String(productData.id)
        );
      }
      let opResp;
      if (cartItem) {
        opResp = await cartApi.updateCartItem(
          cartItem.id,
          (cartItem.quantity || 1) + 1
        );
      } else {
        opResp = await cartApi.addToCart(productData, 1, userId);
      }
      if (opResp && opResp.status === 'success') {
        dispatch(fetchCart(userId));
      }
      return opResp;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateCartItemQuantity = createAsyncThunk(
  'cart/updateCartItemQuantity',
  async ({ id, newQuantity, userId }, { dispatch, rejectWithValue }) => {
    try {
      let opResp;
      if (newQuantity <= 0) {
        opResp = await cartApi.removeFromCart(id);
      } else {
        opResp = await cartApi.updateCartItem(id, newQuantity);
      }
      if (opResp && opResp.status === 'success') {
        dispatch(fetchCart(userId));
      }
      return opResp;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default cartSlice.reducer;
