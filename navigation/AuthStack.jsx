/**
 * Stack Navigator для экранов аутентификации.
 * Управляет навигацией между LoginScreen и SignUpScreen.
 * 
 * Заголовки скрыты (headerShown: false) для чистого интерфейса входа.
 * Используется когда пользователь не авторизован в приложении.
 */
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SCREENS } from './ScreenNames';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUp';

const Stack = createStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={SCREENS.LOGIN} component={LoginScreen} />
      <Stack.Screen name={SCREENS.SIGNUP} component={SignUpScreen} />
    </Stack.Navigator>
  );
}
