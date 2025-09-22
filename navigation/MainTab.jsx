/**
 * Bottom Tab Navigator для основных разделов приложения.
 * Включает 4 основных экрана: Home, Cart, OrderStatus, Profile.
 * 
 * Функциональность:
 * - Кастомизированные иконки для каждой вкладки
 * - Отображение счетчика товаров в корзине
 * - Поддержка темизации и локализации
 * - Анимации для улучшения UX
 * - Адаптивный дизайн для разных платформ
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { SCREENS } from './ScreenNames';
import HomeScreen from '../screens/HomeScreen';
import CartScreen from '../screens/CartScreen';
import OrderStatusScreen from '../screens/OrderStatusScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { Ionicons } from '@expo/vector-icons';
import { Animated, Easing } from 'react-native';
import { useSelector } from 'react-redux';
import { selectT } from '../store/appSlice';

const Tab = createBottomTabNavigator();

export default function MainTab() {
  const theme = useSelector((state) => state.theme.theme);
  const t = useSelector(selectT);
  const cartItems = useSelector((state) => state.cart.items);
  const cartItemsCount = cartItems.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: route.name === SCREENS.HOME,
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
        tabBarActiveTintColor: theme.brandColor,
        tabBarInactiveTintColor: theme.lightText,
        tabBarStyle: {
          flexDirection: 'row',
          backgroundColor: theme.backgroundColor,
          borderTopColor: theme.borderColor,
          borderTopWidth: 1,
          paddingVertical: 10,
          paddingHorizontal: 20,
          minHeight: 64,
        },

        tabBarOptions: Platform.OS === 'web' ? {
          'aria-hidden': false,
          tabBarButtonProps: {
            'aria-hidden': false,
          }
        } : {},
        tabBarIcon: ({ color, size, focused }) => {
          const [anim] = React.useState(() => new Animated.Value(0));
          const prevCount = React.useRef(cartItemsCount);
          React.useEffect(() => {
            if (
              route.name === SCREENS.CART &&
              prevCount.current !== cartItemsCount
            ) {
              Animated.sequence([
                Animated.timing(anim, {
                  toValue: 1,
                  duration: 250,
                  easing: Easing.out(Easing.ease),
                  useNativeDriver: false,
                }),
                Animated.timing(anim, {
                  toValue: 0,
                  duration: 0,
                  useNativeDriver: false,
                }),
                Animated.timing(anim, {
                  toValue: 1,
                  duration: 250,
                  easing: Easing.out(Easing.ease),
                  useNativeDriver: false,
                }),
                Animated.timing(anim, {
                  toValue: 0,
                  duration: 0,
                  useNativeDriver: false,
                }),
              ]).start();
              prevCount.current = cartItemsCount;
            }
          }, [cartItemsCount]);
          if (route.name === SCREENS.CART) {
            const rotateY = anim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '180deg'],
            });
            return (
              <>
                <Ionicons name="bag-outline" size={size} color={color} />
                {cartItemsCount > 0 && (
                  <Animated.View
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: 0,
                      backgroundColor: '#F44336',
                      borderRadius: 8,
                      minWidth: 16,
                      height: 16,
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingHorizontal: 3,
                      zIndex: 2,
                      transform: [{ rotateY }],
                    }}

                    accessible={true}
                    accessibilityRole="text"
                    accessibilityLabel={`Товаров в корзине: ${cartItemsCount}`}
                  >
                    <Animated.Text
                      style={{
                        color: '#fff',
                        fontSize: 10,
                        fontWeight: 'bold',
                        textAlign: 'center',
                      }}
                    >
                      {cartItemsCount}
                    </Animated.Text>
                  </Animated.View>
                )}
              </>
            );
          }
          let iconName;
          if (route.name === SCREENS.HOME) iconName = 'home-outline';
          else if (route.name === SCREENS.ORDER_STATUS)
            iconName = 'location-outline';
          else if (route.name === SCREENS.PROFILE) iconName = 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name={SCREENS.HOME}
        component={HomeScreen}
        options={{
          tabBarLabel: t('home'),
          headerShown: false,

          ...(Platform.OS === 'web' && {
            tabBarAccessibilityLabel: t('home'),
            tabBarButtonProps: {
              'aria-hidden': false,
              'aria-label': t('home'),
            }
          })
        }}
      />
      <Tab.Screen
        name={SCREENS.CART}
        component={CartScreen}
        options={{
          tabBarLabel: t('cart'),
          ...(Platform.OS === 'web' && {
            tabBarAccessibilityLabel: `${t('cart')} (${cartItemsCount} товаров)`,
            tabBarButtonProps: {
              'aria-hidden': false,
              'aria-label': `${t('cart')} (${cartItemsCount} товаров)`,
            }
          })
        }}
      />
      <Tab.Screen
        name={SCREENS.ORDER_STATUS}
        component={OrderStatusScreen}
        options={{
          tabBarLabel: t('orders'),
          ...(Platform.OS === 'web' && {
            tabBarAccessibilityLabel: t('orders'),
            tabBarButtonProps: {
              'aria-hidden': false,
              'aria-label': t('orders'),
            }
          })
        }}
      />
      <Tab.Screen
        name={SCREENS.PROFILE}
        component={ProfileScreen}
        options={{
          tabBarLabel: t('profile'),
          ...(Platform.OS === 'web' && {
            tabBarAccessibilityLabel: t('profile'),
            tabBarButtonProps: {
              'aria-hidden': false,
              'aria-label': t('profile'),
            }
          })
        }}
      />
    </Tab.Navigator>
  );
}
