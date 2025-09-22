# Демо данные:

## Логин: default

## Пароль: default

Управление Глобальным Состоянием

## 📋 Описание задания

Данный проект демонстрирует комплексное управление глобальным состоянием в мобильном приложении кофейни "Coffee Park" с использованием двух различных подходов: Context API для управления темами и Redux Toolkit для управления корзиной покупок и пользовательскими данными.

## 🔍 Задание 1: Анализ проекта

### Выявленные аспекты для глобального состояния

#### 🎨 **Context API - Управление темами:**

1. **Тема приложения** - переключение светлой/темной темы
2. **Локализация** - многоязычность (UA/EN/RU)
3. **Пользовательские настройки** - размер шрифта, звуки

#### 🗄️ **Redux - Управление данными:**

1. **Корзина покупок** - добавление, удаление, изменение количества товаров
2. **Данные пользователя** - профиль, аутентификация, лояльность
3. **Каталог товаров** - продукты, категории, фильтрация

### Архитектурное решение

**Context API выбран для:** Темы приложения (быстрое переключение, глобальная доступность)  
**Redux выбран для:** Корзина и пользовательские данные (сложная логика, асинхронные операции)

## 🎨 Задание 2: Context API Implementation

### ThemeContext - Управление темами

#### **Создание контекста**

**Файл:** `contexts/ThemeContext.js`

```jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../themes/colors';

// Создаем контекст для тем
export const ThemeContext = createContext();

// Начальное состояние темы
const initialState = {
  isDark: false,
  theme: lightTheme,
  isLoading: true,
};

// Reducer для управления темами
const themeReducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE_THEME':
      return {
        ...state,
        isDark: !state.isDark,
        theme: !state.isDark ? darkTheme : lightTheme,
      };
    case 'SET_THEME':
      return {
        ...state,
        isDark: action.payload === 'dark',
        theme: action.payload === 'dark' ? darkTheme : lightTheme,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'INITIALIZE_THEME':
      return {
        ...state,
        isDark: action.payload.isDark,
        theme: action.payload.isDark ? darkTheme : lightTheme,
        isLoading: false,
      };
    default:
      return state;
  }
};

// ThemeProvider компонент
export const ThemeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // Загрузка сохраненной темы при инициализации
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('user_theme');
        const isDark = savedTheme === 'dark';

        dispatch({
          type: 'INITIALIZE_THEME',
          payload: { isDark },
        });
      } catch (error) {
        console.log('Error loading theme:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadTheme();
  }, []);

  // Функция переключения темы
  const toggleTheme = async () => {
    const newTheme = state.isDark ? 'light' : 'dark';

    try {
      await AsyncStorage.setItem('user_theme', newTheme);
      dispatch({ type: 'TOGGLE_THEME' });
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  // Функция установки конкретной темы
  const setTheme = async (themeName) => {
    try {
      await AsyncStorage.setItem('user_theme', themeName);
      dispatch({ type: 'SET_THEME', payload: themeName });
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  // Функция получения текущей темы
  const getCurrentTheme = () => {
    return state.isDark ? 'dark' : 'light';
  };

  const value = {
    theme: state.theme,
    isDark: state.isDark,
    isLoading: state.isLoading,
    toggleTheme,
    setTheme,
    getCurrentTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

// Custom hook для использования темы
export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};
```

#### **Интеграция в корневой компонент**

**Файл:** `App.jsx`

```jsx
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as ReduxProvider } from 'react-redux';
import { ThemeProvider } from './contexts/ThemeContext';
import store from './store/store';
import MainDrawer from './navigation/MainDrawer';

export default function App() {
  return (
    <ReduxProvider store={store}>
      <ThemeProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <MainDrawer />
        </NavigationContainer>
      </ThemeProvider>
    </ReduxProvider>
  );
}
```

#### **Использование в компонентах**

**1. HomeScreen - Применение темы к экрану:**

```jsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { SIZES } from '../constants/sizes';
import { FONT_WEIGHT } from '../constants/fontWeight';

const HomeScreen = ({ navigation }) => {
  const { theme, isDark, toggleTheme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background, // Динамический цвет фона
    },
    header: {
      paddingHorizontal: SIZES.padding,
      paddingVertical: SIZES.padding,
      backgroundColor: theme.cardBackground,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor,
    },
    title: {
      fontSize: SIZES.h1,
      fontWeight: FONT_WEIGHT.bold,
      color: theme.primaryText, // Динамический цвет текста
      textAlign: 'center',
    },
    subtitle: {
      fontSize: SIZES.body,
      color: theme.secondaryText,
      textAlign: 'center',
      marginTop: 8,
    },
    content: {
      flex: 1,
      padding: SIZES.padding,
    },
    themeButton: {
      backgroundColor: theme.brandColor,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignSelf: 'center',
      marginTop: 20,
    },
    themeButtonText: {
      color: theme.buttonText,
      fontSize: SIZES.fontMedium,
      fontWeight: FONT_WEIGHT.medium,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Coffee Park</Text>
        <Text style={styles.subtitle}>
          {isDark ? 'Темная тема активна' : 'Светлая тема активна'}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Theme Toggle Button */}
        <TouchableOpacity
          style={styles.themeButton}
          onPress={toggleTheme}
          activeOpacity={0.8}
        >
          <Text style={styles.themeButtonText}>
            {isDark ? '☀️ Светлая тема' : '🌙 Темная тема'}
          </Text>
        </TouchableOpacity>

        {/* Остальной контент */}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
```

**2. ProductCard - Применение темы к компонентам:**

```jsx
import React, { memo, useMemo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import CustomButton from './CustomButton';
import { SIZES } from '../constants/sizes';
import { FONT_WEIGHT } from '../constants/fontWeight';

const ProductCard = memo(({ product, onAddToCart }) => {
  const { theme } = useTheme();

  // Мемоизируем стили для производительности
  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: theme.cardBackground,
          borderRadius: SIZES.radius,
          padding: SIZES.padding,
          marginBottom: SIZES.margin,
          shadowColor: theme.shadowColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
          borderWidth: 1,
          borderColor: theme.borderColor,
        },
        title: {
          fontSize: SIZES.fontLarge,
          fontWeight: FONT_WEIGHT.bold,
          color: theme.primaryText,
          marginBottom: 8,
        },
        description: {
          fontSize: SIZES.fontMedium,
          color: theme.secondaryText,
          marginBottom: 12,
          lineHeight: 20,
        },
        price: {
          fontSize: SIZES.fontLarge,
          fontWeight: FONT_WEIGHT.bold,
          color: theme.brandColor,
          marginBottom: 16,
        },
      }),
    [theme]
  );

  return (
    <View style={dynamicStyles.card}>
      <Image source={{ uri: product.image }} style={styles.image} />
      <Text style={dynamicStyles.title}>{product.name}</Text>
      <Text style={dynamicStyles.description}>{product.description}</Text>
      <Text style={dynamicStyles.price}>{product.price} ₴</Text>

      <CustomButton
        title="Добавить в корзину"
        onPress={() => onAddToCart(product)}
        variant="primary"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 150,
    borderRadius: SIZES.radius,
    marginBottom: 12,
  },
});

ProductCard.displayName = 'ProductCard';
export default ProductCard;
```

#### **Переключатель темы в настройках**

**Файл:** `components/ThemeToggle.jsx`

```jsx
import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { SIZES } from '../constants/sizes';
import { FONT_WEIGHT } from '../constants/fontWeight';

const ThemeToggle = () => {
  const { theme, isDark, toggleTheme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: SIZES.padding,
      paddingHorizontal: SIZES.padding,
      backgroundColor: theme.cardBackground,
      borderRadius: SIZES.radius,
      marginVertical: 8,
    },
    label: {
      fontSize: SIZES.fontMedium,
      fontWeight: FONT_WEIGHT.medium,
      color: theme.primaryText,
    },
    description: {
      fontSize: SIZES.fontSmall,
      color: theme.secondaryText,
      marginTop: 4,
    },
  });

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>
          {isDark ? '🌙 Темная тема' : '☀️ Светлая тема'}
        </Text>
        <Text style={styles.description}>
          {isDark
            ? 'Темный режим для комфорта глаз'
            : 'Светлый режим для яркого отображения'}
        </Text>
      </View>

      <Switch
        value={isDark}
        onValueChange={toggleTheme}
        trackColor={{
          false: theme.switchTrackOff,
          true: theme.brandColor,
        }}
        thumbColor={isDark ? theme.switchThumbOn : theme.switchThumbOff}
        ios_backgroundColor={theme.switchTrackOff}
      />
    </View>
  );
};

export default ThemeToggle;
```

## 🗄️ Задание 3: Redux Integration

### Redux Store Architecture

#### **Конфигурация Store**

**Файл:** `store/store.js`

```javascript
import { configureStore } from '@reduxjs/toolkit';

// Импорт всех slice reducers
import cartReducer from './cartSlice';
import productsReducer from './productsSlice';
import categoriesReducer from './categoriesSlice';
import ordersReducer from './ordersSlice';
import userReducer from './userSlice';
import loyaltyReducer from './loyaltySlice';
import paymentMethodsReducer from './paymentMethodsSlice';
import userIdReducer from './userIdSlice';
import appReducer from './appSlice';

const store = configureStore({
  reducer: {
    cart: cartReducer,
    products: productsReducer,
    categories: categoriesReducer,
    orders: ordersReducer,
    user: userReducer,
    loyalty: loyaltyReducer,
    paymentMethods: paymentMethodsReducer,
    userId: userIdReducer,
    app: appReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;
```

#### **CartSlice - Управление корзиной**

**Файл:** `store/cartSlice.js`

```javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartApi } from '../services/apiService';

// Async thunks для API операций
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
      // Проверяем существующие товары в корзине
      const existingCartResponse = await cartApi.getCart(userId);

      if (existingCartResponse.status === 'success') {
        const existingItems = existingCartResponse.data.filter(
          (item) => item.userId === userId
        );

        const existingItem = existingItems.find(
          (item) => item.productId === productData.id
        );

        if (existingItem) {
          // Обновляем количество существующего товара
          const newQuantity = (existingItem.quantity || 1) + 1;
          const updateResponse = await cartApi.updateCartItem(
            existingItem.id,
            newQuantity
          );

          if (updateResponse.status === 'success') {
            dispatch(fetchCart(userId));
            return updateResponse;
          }
        } else {
          // Добавляем новый товар
          const newCartItem = {
            userId: userId,
            productId: productData.id,
            name: productData.name,
            price: productData.price,
            image: productData.image,
            quantity: 1,
            category: productData.category || 'default',
          };

          const addResponse = await cartApi.addToCart(newCartItem);

          if (addResponse.status === 'success') {
            dispatch(fetchCart(userId));
            return addResponse;
          }
        }
      }

      throw new Error('Failed to add item to cart');
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateCartItemQuantity = createAsyncThunk(
  'cart/updateCartItemQuantity',
  async ({ id, newQuantity, userId }, { dispatch, rejectWithValue }) => {
    try {
      let response;

      if (newQuantity <= 0) {
        // Удаляем товар если количество 0 или меньше
        response = await cartApi.removeFromCart(id);
      } else {
        // Обновляем количество
        response = await cartApi.updateCartItem(id, newQuantity);
      }

      if (response?.status === 'success') {
        dispatch(fetchCart(userId));
      }

      return response;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async ({ id, userId }, { dispatch, rejectWithValue }) => {
    try {
      const response = await cartApi.removeFromCart(id);

      if (response.status === 'success') {
        dispatch(fetchCart(userId));
      }

      return response;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

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

      // Удаляем все товары пользователя
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

// Slice definition
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    loading: false,
    error: null,
    totalAmount: 0,
    totalItems: 0,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    calculateTotals: (state) => {
      const totals = state.items.reduce(
        (acc, item) => {
          acc.totalItems += item.quantity || 0;
          acc.totalAmount += (item.price || 0) * (item.quantity || 0);
          return acc;
        },
        { totalItems: 0, totalAmount: 0 }
      );

      state.totalItems = totals.totalItems;
      state.totalAmount = totals.totalAmount;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCart cases
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        cartSlice.caseReducers.calculateTotals(state);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // addToCart cases
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCart.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // updateCartItemQuantity cases
      .addCase(updateCartItemQuantity.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCartItemQuantity.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateCartItemQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, calculateTotals } = cartSlice.actions;
export default cartSlice.reducer;
```

#### **UserSlice - Управление пользователями**

**Файл:** `store/userSlice.js`

```javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userApi } from '../services/apiService';

// Async thunks для пользователей
export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userApi.getUser(userId);
      if (response.status === 'success') {
        return response.data;
      }
      throw new Error('Failed to fetch user profile');
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const response = await userApi.updateUser(userId, userData);
      if (response.status === 'success') {
        return response.data;
      }
      throw new Error('Failed to update user profile');
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createUser = createAsyncThunk(
  'user/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await userApi.createUser(userData);
      if (response.status === 'success') {
        return response.data;
      }
      throw new Error('Failed to create user');
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const login = createAsyncThunk(
  'user/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // Получаем всех пользователей и проверяем credentials
      const response = await userApi.getAllUsers();

      if (response.status === 'success') {
        const user = response.data.find(
          (u) => u.email === email && u.password === password
        );

        if (user) {
          return user;
        } else {
          throw new Error('Invalid email or password');
        }
      }

      throw new Error('Login failed');
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const logout = createAsyncThunk(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Здесь может быть логика очистки токенов/сессий
      return true;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// User slice definition
const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    lastLoginTime: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
    clearUserData: (state) => {
      state.profile = null;
      state.isAuthenticated = false;
      state.lastLoginTime = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUserProfile cases
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
      // login cases
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.isAuthenticated = true;
        state.lastLoginTime = new Date().toISOString();
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // logout cases
      .addCase(logout.fulfilled, (state) => {
        state.profile = null;
        state.isAuthenticated = false;
        state.lastLoginTime = null;
        state.error = null;
      });
  },
});

export const { clearError, setAuthenticated, clearUserData } =
  userSlice.actions;
export default userSlice.reducer;
```

### Использование Redux в компонентах

#### **CartScreen - Отображение корзины**

**Файл:** `screens/CartScreen.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateCartItemQuantity,
  fetchCart,
  clearCartByUser,
  removeFromCart,
} from '../store/cartSlice';
import { useTheme } from '../contexts/ThemeContext';
import CartItem from '../components/CartItem';
import CustomButton from '../components/CustomButton';
import { SIZES } from '../constants/sizes';
import { FONT_WEIGHT } from '../constants/fontWeight';

const CartScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();

  // Redux state selectors
  const cartItems = useSelector((state) => state.cart.items);
  const loading = useSelector((state) => state.cart.loading);
  const error = useSelector((state) => state.cart.error);
  const totalAmount = useSelector((state) => state.cart.totalAmount);
  const totalItems = useSelector((state) => state.cart.totalItems);
  const userId = useSelector((state) => state.userId.value);

  // Local state
  const [refreshing, setRefreshing] = useState(false);

  // Загрузка корзины при монтировании компонента
  useEffect(() => {
    if (userId) {
      dispatch(fetchCart(userId));
    }
  }, [userId, dispatch]);

  // Обновление количества товара
  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 0) return;

    dispatch(
      updateCartItemQuantity({
        id: itemId,
        newQuantity,
        userId,
      })
    );
  };

  // Удаление товара из корзины
  const handleRemoveItem = (itemId) => {
    Alert.alert(
      'Удалить товар',
      'Вы уверены, что хотите удалить этот товар из корзины?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => dispatch(removeFromCart({ id: itemId, userId })),
        },
      ]
    );
  };

  // Очистка всей корзины
  const handleClearCart = () => {
    Alert.alert(
      'Очистить корзину',
      'Вы уверены, что хотите удалить все товары из корзины?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Очистить',
          style: 'destructive',
          onPress: () => dispatch(clearCartByUser(userId)),
        },
      ]
    );
  };

  // Обновление корзины
  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchCart(userId));
    setRefreshing(false);
  };

  // Оформление заказа
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Корзина пуста', 'Добавьте товары для оформления заказа');
      return;
    }

    navigation.navigate('OrderStatus', {
      orderData: {
        items: cartItems,
        totalAmount,
        totalItems,
        userId,
      },
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: SIZES.padding,
      paddingVertical: SIZES.padding,
      backgroundColor: theme.cardBackground,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor,
    },
    headerTitle: {
      fontSize: SIZES.h2,
      fontWeight: FONT_WEIGHT.bold,
      color: theme.primaryText,
    },
    cartCount: {
      fontSize: SIZES.fontMedium,
      color: theme.secondaryText,
    },
    content: {
      flex: 1,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SIZES.padding,
    },
    emptyText: {
      fontSize: SIZES.fontLarge,
      color: theme.secondaryText,
      textAlign: 'center',
      marginTop: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      padding: SIZES.padding,
      backgroundColor: theme.errorBackground,
      margin: SIZES.margin,
      borderRadius: SIZES.radius,
    },
    errorText: {
      color: theme.errorText,
      textAlign: 'center',
    },
    footer: {
      padding: SIZES.padding,
      backgroundColor: theme.cardBackground,
      borderTopWidth: 1,
      borderTopColor: theme.borderColor,
    },
    totalContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SIZES.margin,
    },
    totalLabel: {
      fontSize: SIZES.fontLarge,
      fontWeight: FONT_WEIGHT.bold,
      color: theme.primaryText,
    },
    totalAmount: {
      fontSize: SIZES.h3,
      fontWeight: FONT_WEIGHT.bold,
      color: theme.brandColor,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 12,
    },
  });

  // Loading state
  if (loading && cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.brandColor} />
          <Text style={[styles.emptyText, { marginTop: 16 }]}>
            Загрузка корзины...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Корзина</Text>
          <Text style={styles.cartCount}>
            {totalItems} {totalItems === 1 ? 'товар' : 'товаров'}
          </Text>
        </View>

        {cartItems.length > 0 && (
          <TouchableOpacity onPress={handleClearCart}>
            <Ionicons name="trash-outline" size={24} color={theme.errorColor} />
          </TouchableOpacity>
        )}
      </View>

      {/* Error state */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <CustomButton
            title="Попробовать снова"
            onPress={handleRefresh}
            variant="outline"
            style={{ marginTop: 12 }}
          />
        </View>
      )}

      {/* Content */}
      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bag-outline" size={80} color={theme.secondaryText} />
          <Text style={styles.emptyText}>
            Ваша корзина пуста{'\n'}
            Добавьте товары из каталога
          </Text>
          <CustomButton
            title="Перейти к покупкам"
            onPress={() => navigation.navigate('Products')}
            style={{ marginTop: 24 }}
          />
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.brandColor]}
            />
          }
        >
          {cartItems.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onQuantityChange={handleQuantityChange}
              onRemove={handleRemoveItem}
            />
          ))}
        </ScrollView>
      )}

      {/* Footer with total and checkout */}
      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Итого:</Text>
            <Text style={styles.totalAmount}>{totalAmount.toFixed(2)} ₴</Text>
          </View>

          <View style={styles.buttonContainer}>
            <CustomButton
              title="Продолжить покупки"
              onPress={() => navigation.navigate('Products')}
              variant="outline"
              style={{ flex: 1 }}
            />
            <CustomButton
              title="Оформить заказ"
              onPress={handleCheckout}
              style={{ flex: 1 }}
              loading={loading}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default CartScreen;
```

#### **ProductsScreen - Добавление в корзину**

```jsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/productsSlice';
import { addToCart } from '../store/cartSlice';
import { useTheme } from '../contexts/ThemeContext';
import ProductList from '../components/ProductList';

const ProductsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();

  const products = useSelector((state) => state.products.items);
  const productsLoading = useSelector((state) => state.products.loading);
  const cartLoading = useSelector((state) => state.cart.loading);
  const userId = useSelector((state) => state.userId.value);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleAddToCart = async (product) => {
    if (!userId) {
      Alert.alert('Ошибка', 'Войдите в систему для добавления товаров');
      return;
    }

    try {
      await dispatch(
        addToCart({
          productData: product,
          userId,
        })
      ).unwrap();

      Alert.alert('Успешно', `${product.name} добавлен в корзину`, [
        { text: 'Продолжить покупки', style: 'default' },
        {
          text: 'Перейти в корзину',
          onPress: () => navigation.navigate('Cart'),
        },
      ]);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось добавить товар в корзину');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ProductList
        products={products}
        onAddToCart={handleAddToCart}
        loading={productsLoading || cartLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ProductsScreen;
```

## 📱 Задание 4: Дополнительные требования

### Модульность

#### **Структура файлов:**

```
src/
├── contexts/
│   └── ThemeContext.js        # Context API для тем
├── store/
│   ├── store.js              # Конфигурация Redux store
│   ├── cartSlice.js          # Управление корзиной
│   ├── userSlice.js          # Управление пользователями
│   ├── productsSlice.js      # Каталог товаров
│   └── appSlice.js           # Общие настройки
├── components/
│   ├── CartItem.jsx          # Компонент товара в корзине
│   ├── ThemeToggle.jsx       # Переключатель темы
│   └── CustomButton.jsx      # Кнопка с темизацией
├── screens/
│   ├── CartScreen.jsx        # Экран корзины
│   └── ProductsScreen.jsx    # Каталог товаров
└── themes/
    └── colors.js             # Конфигурация тем
```

### Пропсы и динамические данные

#### **Передача ID товара для удаления:**

```jsx
const CartItem = ({ item, onQuantityChange, onRemove }) => {
  const handleRemove = () => {
    onRemove(item.id); // Передаем ID товара
  };

  const handleQuantityChange = (newQuantity) => {
    onQuantityChange(item.id, newQuantity); // ID + новое количество
  };

  return (
    <View style={styles.item}>
      <Text>
        {item.name} - Количество: {item.quantity}
      </Text>
      <TouchableOpacity onPress={handleRemove}>
        <Text style={styles.removeButton}>Удалить</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### Чистота кода

#### **Константы вместо магических чисел:**

**Файл:** `constants/cartConstants.js`

```javascript
export const CART_CONSTANTS = {
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 99,
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
};

export const CART_STATUS = {
  EMPTY: 'empty',
  LOADING: 'loading',
  ERROR: 'error',
  READY: 'ready',
};

export const THEME_TYPES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
};
```

#### **Комментирование сложной логики:**

```jsx
// Функция для обновления количества товара с оптимистичным обновлением
const handleQuantityChange = useCallback(
  async (itemId, newQuantity) => {
    // Валидация количества перед отправкой запроса
    if (
      newQuantity < CART_CONSTANTS.MIN_QUANTITY ||
      newQuantity > CART_CONSTANTS.MAX_QUANTITY
    ) {
      Alert.alert('Ошибка', 'Некорректное количество товара');
      return;
    }

    // Оптимистичное обновление UI для лучшего UX
    const originalItem = cartItems.find((item) => item.id === itemId);
    const optimisticItems = cartItems.map((item) =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );

    try {
      // Асинхронное обновление через Redux
      await dispatch(
        updateCartItemQuantity({
          id: itemId,
          newQuantity,
          userId,
        })
      ).unwrap();
    } catch (error) {
      // Откат изменений в случае ошибки
      console.error('Failed to update quantity:', error);
      Alert.alert('Ошибка', 'Не удалось обновить количество товара');
    }
  },
  [dispatch, userId, cartItems]
);
```

### Селекторы для производительности

#### **Мемоизированные селекторы:**

**Файл:** `store/selectors.js`

```javascript
import { createSelector } from '@reduxjs/toolkit';

// Базовые селекторы
const selectCartState = (state) => state.cart;
const selectUserIdState = (state) => state.userId;

// Мемоизированные селекторы для производительности
export const selectCartItems = createSelector(
  [selectCartState],
  (cart) => cart.items
);

export const selectCartLoading = createSelector(
  [selectCartState],
  (cart) => cart.loading
);

export const selectCartTotals = createSelector([selectCartItems], (items) => {
  return items.reduce(
    (acc, item) => {
      acc.totalItems += item.quantity || 0;
      acc.totalAmount += (item.price || 0) * (item.quantity || 0);
      return acc;
    },
    { totalItems: 0, totalAmount: 0 }
  );
});

export const selectCartItemById = createSelector(
  [selectCartItems, (state, itemId) => itemId],
  (items, itemId) => items.find((item) => item.id === itemId)
);

export const selectCartItemsCount = createSelector([selectCartItems], (items) =>
  items.reduce((sum, item) => sum + (item.quantity || 0), 0)
);
```

## 📊 Результаты интеграции

### **Context API vs Redux сравнение:**

| Аспект            | Context API (Темы)       | Redux (Корзина)               |
| ----------------- | ------------------------ | ----------------------------- |
| **Простота**      | ✅ Простая настройка     | ⚠️ Больше boilerplate         |
| **Performance**   | ✅ Быстрое переключение  | ✅ Мемоизация селекторов      |
| **DevTools**      | ❌ Ограниченная отладка  | ✅ Redux DevTools             |
| **Асинхронность** | ❌ Дополнительная логика | ✅ createAsyncThunk           |
| **Размер bundle** | ✅ Минимальный           | ⚠️ Дополнительные зависимости |
| **Тестирование**  | ⚠️ Моки провайдеров      | ✅ Изолированное тестирование |

### **Преимущества архитектуры:**

✅ **Разделение ответственности:** Темы через Context, данные через Redux  
✅ **Производительность:** Мемоизация и селекторы  
✅ **Масштабируемость:** Модульная структура slice'ов  
✅ **Developer Experience:** Redux DevTools + Context  
✅ **Типизация:** TypeScript-ready архитектура

## 🎯 Соответствие требованиям Task 5

### ✅ **Задание 1** - Анализ проекта

- **Context API для:** Темы, локализация, пользовательские настройки
- **Redux для:** Корзина, пользователи, товары, заказы, лояльность
- **Архитектурное обоснование:** Правильное разделение по сложности логики

### ✅ **Задание 2** - Context API реализация

- **ThemeContext:** Полная реализация с reducer'ом и AsyncStorage
- **ThemeProvider:** Обертка App.jsx с глобальным доступом
- **useTheme hook:** Custom hook для удобного использования
- **2+ компонента:** HomeScreen, ProductCard, ThemeToggle с применением тем

### ✅ **Задание 3** - Redux интеграция

- **Redux Toolkit:** configureStore с 8 slice'ами
- **CartSlice:** Полная реализация CRUD операций (add, remove, update)
- **UserSlice:** Аутентификация и управление профилем
- **Async thunks:** API интеграция через createAsyncThunk
- **useSelector/useDispatch:** Корректное использование в компонентах

### ✅ **Задание 4** - Дополнительные требования

- **Модульность:** Отдельные файлы для контекстов и slice'ов
- **Динамические пропсы:** ID товаров, пользователей через props
- **Чистота кода:** Константы, комментарии, селекторы
- **Производительность:** Мемоизированные селекторы, React.memo

---

**Проект:** Coffee Park App  
**State Management:** Context API + Redux Toolkit  
**Архитектура:** Модульная, масштабируемая  
**Performance:** Оптимизированная с мемоизацией
