/**
 * Redux slice для управления темами оформления.
 * Обрабатывает переключение между светлой и темной темами.
 * 
 * State:
 * - isDark: флаг темной темы
 * - theme: объект с цветами текущей темы
 * 
 * Actions:
 * - toggleTheme: переключение между темами
 * - setTheme: установка конкретной темы
 * 
 * Поддерживает автоматическую инициализацию светлой темы.
 * Интегрируется с системой цветов из themes/colors.js
 */
import { createSlice } from '@reduxjs/toolkit';
import { lightTheme, darkTheme } from '../themes/colors';

const getInitialTheme = () => {
  return lightTheme;
};

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    isDark: false,
    theme: getInitialTheme(),
  },
  reducers: {
    toggleTheme: (state) => {
      state.isDark = !state.isDark;
      state.theme = state.isDark ? darkTheme : lightTheme;
    },
    setTheme: (state, action) => {
      state.isDark = action.payload === 'dark';
      state.theme = state.isDark ? darkTheme : lightTheme;
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
