/**
 * Главный Redux Store приложения.
 * Конфигурация центрального хранилища состояния с использованием Redux Toolkit.
 * 
 * Включает следующие slice'ы:
 * - orderStatus: управление статусами заказов
 * - cart: управление корзиной товаров
 * - products: управление каталогом товаров
 * - categories: управление категориями
 * - orders: история заказов
 * - user: профиль пользователя
 * - loyalty: программа лояльности
 * - paymentMethods: способы оплаты
 * - theme: темы оформления
 * - userId: идентификатор пользователя
 * - app: глобальные настройки приложения
 */
import { configureStore } from '@reduxjs/toolkit';

import orderStatusReducer from './orderStatusSlice';
import cartReducer from './cartSlice';
import productsReducer from './productsSlice';
import categoriesReducer from './categoriesSlice';
import ordersReducer from './ordersSlice';
import loyaltyReducer from './loyaltySlice';
import userReducer from './userSlice';
import paymentMethodsReducer from './paymentMethodsSlice';
import themeReducer from './themeSlice';
import userIdReducer from './userIdSlice';
import appReducer from './appSlice';

const store = configureStore({
  reducer: {
    orderStatus: orderStatusReducer,
    cart: cartReducer,
    products: productsReducer,
    categories: categoriesReducer,
    orders: ordersReducer,
    user: userReducer,
    loyalty: loyaltyReducer,
    paymentMethods: paymentMethodsReducer,
    theme: themeReducer,
    userId: userIdReducer,
    app: appReducer,
  },
});

export default store;
