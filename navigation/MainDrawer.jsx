/**
 * Drawer Navigator для боковой навигации приложения.
 * Обеспечивает доступ к дополнительным экранам: настройки, способы оплаты, 
 * сохраненные адреса и информация о приложении.
 * 
 * Поддерживает темизацию через Redux store и локализацию.
 * Включает поддержку веб-платформы с aria-labels для доступности.
 */
import React from 'react';
import { Platform } from 'react-native';
import { useSelector } from 'react-redux';
import { selectT } from '../store/appSlice';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { SCREENS } from './ScreenNames';
import MainTab from './MainTab';
import AboutScreen from '../screens/AboutScreen';
import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';
import SavedLocationsScreen from '../screens/SavedLocationsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Drawer = createDrawerNavigator();

export default function MainDrawer() {
  const theme = useSelector((state) => state.theme.theme);
  const t = useSelector(selectT);
  return (
    <Drawer.Navigator
      initialRouteName="Main"
      screenOptions={() => ({
        headerShown: false,
        drawerStyle: {
          backgroundColor: theme.navigationBackgroundColor,
        },
        drawerActiveTintColor: theme.brandColor,
        drawerInactiveTintColor: theme.primaryText,
        drawerLabelStyle: {
          fontSize: 16,
        },

        ...(Platform.OS === 'web' && {
          drawerContentOptions: {
            'aria-hidden': false,
          },
        }),
      })}
    >
      <Drawer.Screen
        name="Main"
        component={MainTab}
        options={{ 
          drawerLabel: t('home'),
          ...(Platform.OS === 'web' && {
            drawerItemProps: {
              'aria-hidden': false,
              'aria-label': t('home'),
            }
          })
        }}
      />

      <Drawer.Screen
        name={SCREENS.PAYMENT_METHODS}
        component={PaymentMethodsScreen}
        options={{ 
          drawerLabel: t('paymentMethods'),
          ...(Platform.OS === 'web' && {
            drawerItemProps: {
              'aria-hidden': false,
              'aria-label': t('paymentMethods'),
            }
          })
        }}
      />
      <Drawer.Screen
        name={SCREENS.SAVED_LOCATIONS}
        component={SavedLocationsScreen}
        options={{ 
          drawerLabel: t('savedLocations'),
          ...(Platform.OS === 'web' && {
            drawerItemProps: {
              'aria-hidden': false,
              'aria-label': t('savedLocations'),
            }
          })
        }}
      />
      <Drawer.Screen
        name={SCREENS.SETTINGS}
        component={SettingsScreen}
        options={{ 
          drawerLabel: t('settings'),
          ...(Platform.OS === 'web' && {
            drawerItemProps: {
              'aria-hidden': false,
              'aria-label': t('settings'),
            }
          })
        }}
      />
      <Drawer.Screen
        name={SCREENS.ABOUT}
        component={AboutScreen}
        options={{ 
          drawerLabel: t('about'),
          ...(Platform.OS === 'web' && {
            drawerItemProps: {
              'aria-hidden': false,
              'aria-label': t('about'),
            }
          })
        }}
      />
    </Drawer.Navigator>
  );
}
