/**
 * Экран корзины товаров (Cart Screen).
 * Позволяет пользователю управлять товарами в корзине и оформлять заказы.
 * 
 * Основной функционал:
 * - Отображение товаров в корзине с возможностью изменения количества
 * - Расчет общей стоимости заказа
 * - Выбор адреса доставки на карте
 * - Выбор способа оплаты
 * - Оформление заказа с проверкой данных
 * - Интеграция с внешними сервисами (API заказов, пользователей)
 */
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
import { colors } from '../themes/colors';
import { FONT_WEIGHT } from '../constants/fontWeight';
import { SIZES } from '../constants/sizes';
import { cartApi, orderApi, userApi, productApi } from '../services/apiService';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateCartItemQuantity,
  fetchCart,
  clearCartByUser,
} from '../store/cartSlice';
import CartItem from '../components/CartItem';
import LocationMap from '../components/LocationMap';
import PaymentSection from '../components/PaymentSection';
import { selectT } from '../store/appSlice';

const CartScreen = ({ navigation, onCompleteOrder, refreshCart = false }) => {
  const theme = useSelector((state) => state.theme.theme);
  const userId = useSelector((state) => state.userId.value);
  const t = useSelector(selectT);
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const cartLoading = useSelector((state) => state.cart.loading);
  const [updating, setUpdating] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      dispatch(fetchCart(userId));
    }
  }, [dispatch, userId, refreshCart]);

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }
    dispatch(updateCartItemQuantity({ id: itemId, newQuantity, userId }));
  };

  const handleRemoveItem = (itemId) => {
    dispatch(updateCartItemQuantity({ id: itemId, newQuantity: 0, userId }));
  };

  const handleClearCart = () => {
    dispatch(clearCartByUser(userId));
  };

  const handleCompleteOrder = async () => {
    if (cartItems.length === 0) {
      return;
    }

    try {
      const [profileResponse, locationsResponse, paymentMethodsResponse] =
        await Promise.all([
          userApi.getProfile(userId),
          (
            await import('services/apiService')
          ).locationsApi.getSavedLocations(userId),
          (
            await import('services/apiService')
          ).paymentMethodsApi.getPaymentMethods(userId),
        ]);

      if (
        profileResponse.status !== 'success' ||
        locationsResponse.status !== 'success' ||
        paymentMethodsResponse.status !== 'success'
      ) {
        throw new Error('Failed to load user data for order');
      }

      const defaultLocation = locationsResponse.data.find(
        (loc) => loc.isDefault
      );
      const defaultPaymentMethod = paymentMethodsResponse.data.find(
        (pm) => pm.isDefault
      );

      if (!defaultLocation) {
        return;
      }

      if (!defaultPaymentMethod) {
        return;
      }

      const orderData = {
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: totalAmount,
        deliveryLocation: defaultLocation,
        paymentMethod: defaultPaymentMethod,
        notes: '',
      };

      const response = await orderApi.createOrder(orderData, userId);

      if (response.status === 'success') {
        await cartApi.clearCart(userId);

        if (onCompleteOrder) {
          onCompleteOrder(response.data);
        }
        navigation.navigate('OrderStatus', {
          orderNumber: response.data.orderNumber,
        });
      } else {
        throw new Error(response.message || 'Failed to create order');
      }
    } catch (err) {
    } finally {
      setSubmittingOrder(false);
    }
  };

  const handleBackPress = () => {
    navigation.navigate('Home');
  };

  const handleTabPress = (tabId) => {
    navigation.navigate(tabId);
  };

  const totalAmount = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.price) || 0;
    const quantity = parseInt(item.quantity) || 0;
    return sum + price * quantity;
  }, 0);
  const totalItemsInCart = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  if (cartLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.backgroundColor }]}
      >
        <View
          style={[
            styles.header,
            {
              backgroundColor: theme.backgroundColor,
              borderBottomColor: theme.borderColor,
            },
          ]}
        >
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={theme.primaryText} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.primaryText }]}>
            {t('cart')}
          </Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.brandColor} />
          <Text style={[styles.loadingText, { color: theme.primaryText }]}>
            {t('loading')}...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.backgroundColor,
            borderBottomColor: theme.borderColor,
          },
        ]}
      >
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={theme.primaryText} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.primaryText }]}>
          {t('cart')}
        </Text>
        {cartItems.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              handleClearCart();
            }}
            style={styles.clearButton}
            disabled={updating}
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color={updating ? theme.lightText : theme.secondaryText}
            />
          </TouchableOpacity>
        )}
        {cartItems.length === 0 && <View style={styles.placeholder} />}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.cartItems}>
          {cartItems.length > 0 ? (
            cartItems.map((item) => {
              return (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  updating={updating}
                />
              );
            })
          ) : (
            <View style={styles.emptyCart}>
              <Ionicons
                name="bag-outline"
                size={64}
                color={theme.secondaryText}
              />
              <Text
                style={[styles.emptyCartText, { color: theme.primaryText }]}
              >
                {t('emptyCart')}
              </Text>
              <Text
                style={[
                  styles.emptyCartSubtext,
                  { color: theme.secondaryText },
                ]}
              >
                {t('emptyCartSubtext')}
              </Text>
              <TouchableOpacity
                style={[
                  styles.continueShoppingButton,
                  { backgroundColor: theme.brandColor },
                ]}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.continueShoppingText}>
                  {t('continueShopping')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {cartItems.length > 0 && (
          <>
            <View style={styles.locationSection}>
              <Text
                style={[styles.locationTitle, { color: theme.primaryText }]}
              >
                {t('myLocation')}
              </Text>
              <LocationMap />
            </View>

            <PaymentSection
              totalAmount={totalAmount}
              onCompleteOrder={handleCompleteOrder}
              loading={submittingOrder}
              disabled={updating || submittingOrder}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.paddingSmall * 2, 
    borderBottomWidth: SIZES.borderWidth,
  },
  backButton: {
    padding: SIZES.paddingSmall,
  },
  headerTitle: {
    fontSize: SIZES.fontLarge,
    fontWeight: FONT_WEIGHT.semiBold,
  },
  placeholder: {
    width: SIZES.iconLarge * 1.5,
  },
  clearButton: {
    padding: SIZES.paddingSmall,
  },
  content: {
    flex: 1,
  },
  cartItems: {
    paddingHorizontal: SIZES.paddingLarge,
    paddingTop: SIZES.paddingLarge,
  },
  emptyCart: {
    alignItems: 'center',
    paddingVertical: SIZES.paddingLarge * 3,
    paddingHorizontal: SIZES.paddingLarge * 2,
  },
  emptyCartText: {
    fontSize: SIZES.fontLarge,
    fontWeight: FONT_WEIGHT.semiBold,
    marginBottom: SIZES.margin,
    marginTop: SIZES.marginLarge - 4,
    textAlign: 'center',
  },
  emptyCartSubtext: {
    fontSize: SIZES.fontSmall,
    textAlign: 'center',
    marginBottom: SIZES.marginLarge + 4,
  },
  continueShoppingButton: {
    paddingHorizontal: SIZES.paddingLarge + 4,
    paddingVertical: SIZES.padding,
    borderRadius: SIZES.radius,
  },
  continueShoppingText: {
  color: colors.white,
    fontSize: SIZES.fontMedium,
    fontWeight: FONT_WEIGHT.semiBold,
  },
  locationSection: {
    paddingHorizontal: SIZES.paddingLarge,
    paddingVertical: SIZES.paddingLarge,
  },
  locationTitle: {
    fontSize: SIZES.fontMedium,
    fontWeight: FONT_WEIGHT.semiBold,
    marginBottom: SIZES.marginLarge - 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.paddingLarge,
  },
  loadingText: {
    marginTop: SIZES.marginLarge - 4,
    fontSize: SIZES.fontMedium,
    fontWeight: FONT_WEIGHT.medium,
  },
});

export default CartScreen;
