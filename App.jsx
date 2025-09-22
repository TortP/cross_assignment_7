/**
 * Главный компонент приложения (App).
 * Корневой компонент, который настраивает провайдеры и навигацию.
 * 
 * Структура:
 * - SafeAreaProvider: безопасная область для разных устройств
 * - ReduxProvider: подключение Redux store
 * - NavigationContainer: контейнер для навигации
 * - Условная навигация: MainDrawer для авторизованных, AuthStack для неавторизованных
 * 
 * Логика авторизации:
 * Проверяет наличие профиля пользователя в Redux store
 * и отображает соответствующий навигатор.
 */
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import store from './store/store';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import MainDrawer from './navigation/MainDrawer.jsx';
import AuthStack from './navigation/AuthStack.jsx';
import { useSelector } from 'react-redux';

function AppContent() {
  const userProfile = useSelector((state) => state.user.profile);
  return (
    <NavigationContainer>
      {userProfile ? <MainDrawer /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ReduxProvider store={store}>
        <AppContent />
        <StatusBar style="auto" />
      </ReduxProvider>
    </SafeAreaProvider>
  );
}
