/**
 * Redux slice для управления профилем пользователя.
 * Обрабатывает аутентификацию, профиль и предпочтения пользователя.
 * 
 * Async thunks:
 * - fetchUserProfile: загрузка профиля пользователя
 * - updateUserPreferences: обновление настроек пользователя
 * 
 * State:
 * - profile: данные профиля пользователя
 * - isAuthenticated: статус аутентификации
 * - loading: состояние загрузки
 * - error: ошибки операций
 * 
 * Интеграция с API для синхронизации с сервером.
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userApi } from '../services/apiService';

export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (userId, { rejectWithValue }) => {
    if (!userId) return rejectWithValue('No userId provided');
    try {
      const response = await userApi.getProfile(userId);
      if (response.status === 'success') {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to load user profile');
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Thunk для обновления только preferences пользователя
export const updateUserPreferences = createAsyncThunk(
  'user/updateUserPreferences',
  async ({ userId, preferences }, { rejectWithValue, getState }) => {
    if (!userId) return rejectWithValue('No userId provided');
    try {
      // Получаем текущий профиль пользователя из state
      const state = getState();
      const currentProfile = state.user.profile || {};
      const userRecordId = currentProfile.id; // mockapi id
      if (!userRecordId) return rejectWithValue('No user record id');
      // Обновляем только preferences, остальные поля не трогаем
      const updatedProfile = {
        ...currentProfile,
        preferences: {
          ...currentProfile.preferences,
          ...preferences,
        },
      };
      const response = await userApi.updateProfile(userRecordId, updatedProfile);
      if (response.status === 'success') {
        return response.data;
      }
      return rejectWithValue(
        response.message || 'Failed to update preferences'
      );
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async ({ userId, profileData }, { rejectWithValue }) => {
    if (!userId) return rejectWithValue('No userId provided');
    try {
      const response = await userApi.updateProfile(userId, profileData);
      if (response.status === 'success') {
        return response.data;
      }
      return rejectWithValue(
        response.message || 'Failed to update user profile'
      );
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.profile = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    logout: (state) => {
      state.profile = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      });
  },
});

export const { loginSuccess, logout, clearError } = userSlice.actions;

// Selectors
export const selectUser = (state) => state.user.profile;
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;
export const selectUserLoading = (state) => state.user.loading;
export const selectUserError = (state) => state.user.error;

export default userSlice.reducer;
