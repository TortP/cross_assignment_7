/**
 * Stack Navigator для основных экранов приложения.
 * Использует SCREENS для навигации между Home, Cart, Products, Profile и др.
 *
 * Параметры между экранами передаются через navigation.navigate и route.params.
 * Например, для ProductDetailsScreen: navigation.navigate(SCREENS.PRODUCTS, { productId })
 */
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SCREENS } from './ScreenNames';
import HomeScreen from '../screens/HomeScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import OrderStatusScreen from '../screens/OrderStatusScreen';
import AboutScreen from '../screens/AboutScreen';

const Stack = createStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
        headerStyle: { height: 64 },
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: '500',
          textAlign: 'center',
          marginHorizontal: 0,
        },
        headerTitleContainerStyle: {
          alignItems: 'center',
          justifyContent: 'center',
          height: 64,
        },
      }}
    >
      <Stack.Screen
        name={SCREENS.HOME}
        component={HomeScreen}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name={SCREENS.CART}
        component={CartScreen}
        options={{ title: 'Корзина' }}
      />
      <Stack.Screen
        name={SCREENS.PRODUCTS}
        component={ProductsScreen}
        options={{ title: 'Каталог' }}
      />
      <Stack.Screen
        name={SCREENS.PROFILE}
        component={ProfileScreen}
        options={{ title: 'Профиль' }}
      />
      <Stack.Screen
        name={SCREENS.ORDER_STATUS}
        component={OrderStatusScreen}
        options={{ title: 'Статус заказа' }}
      />
      <Stack.Screen
        name={SCREENS.ABOUT}
        component={AboutScreen}
        options={{ title: 'О приложении' }}
      />
    </Stack.Navigator>
  );
}
