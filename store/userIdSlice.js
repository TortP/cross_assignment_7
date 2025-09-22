/**
 * Redux slice для управления идентификатором пользователя.
 * Простое хранилище для текущего userId в приложении.
 * 
 * State:
 * - value: строка с идентификатором пользователя (по умолчанию 'default')
 * 
 * Actions:
 * - setUserId: установка нового идентификатора пользователя
 * 
 * Селекторы:
 * - selectUserId: получение текущего userId
 * 
 * Используется для связывания данных пользователя между разными slice'ами.
 */
import { createSlice } from '@reduxjs/toolkit';

const userIdSlice = createSlice({
  name: 'userId',
  initialState: {
    value: 'default',
  },
  reducers: {
    setUserId: (state, action) => {
      state.value = action.payload;
    },
  },
});


// Selector to get userId from state
export const selectUserId = (state) => state.userId.value;
export const { setUserId } = userIdSlice.actions;
export default userIdSlice.reducer;
