/**
 * Главный экран приложения (Home Screen).
 * Отображает категории товаров, список продуктов и последний заказ пользователя.
 * 
 * Основной функционал:
 * - Загрузка и отображение категорий товаров
 * - Фильтрация продуктов по выбранной категории  
 * - Добавление товаров в корзину
 * - Повтор последнего заказа
 * - Навигация к экрану товаров и корзины
 * - Поддержка темизации и локализации
 */
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectT } from '../store/appSlice';
import { View, StyleSheet, Alert, ActivityIndicator, Text, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { productApi, cartApi } from '../services/apiService';
import { colors } from '../themes/colors';
import { SIZES } from '../constants/sizes';
import { FONT_WEIGHT } from '../constants/fontWeight';
import Categories from '../components/Categories';
import ProductList from '../components/ProductList';

import LastOrder from '../components/LastOrder';
import { useRepeatOrder } from '../hooks/useRepeatOrder';

const HomeScreen = ({ onNavigate, onAddToCart }) => {
  const onRepeatOrder = useRepeatOrder();
  const theme = useSelector((state) => state.theme.theme);
  const userId = useSelector((state) => state.userId.value);
  const t = useSelector(selectT);
  const cartItems = useSelector((state) => state.cart.items);
  const cartItemsCount = cartItems.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.categories.items);
  const categoriesLoading = useSelector((state) => state.categories.loading);
  const products = useSelector((state) => state.products.items);
  const productsLoading = useSelector((state) => state.products.loading);
  const orders = useSelector((state) => state.orders.items);
  const ordersLoading = useSelector((state) => state.orders.loading);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastCompletedOrder, setLastCompletedOrder] = useState(null);

  useEffect(() => {
    dispatch(require('../store/categoriesSlice').fetchCategories());
    dispatch(
      require('../store/productsSlice').fetchProducts({ available: true })
    );
    dispatch(require('../store/ordersSlice').fetchOrders(userId));
  }, [dispatch, userId]);

  useEffect(() => {
    if (categories && categories.length > 0 && selectedCategory === null) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  useEffect(() => {
    if (selectedCategory) {
      dispatch(
        require('../store/productsSlice').fetchProducts({
          available: true,
          categoryId: selectedCategory,
        })
      );
    }
  }, [selectedCategory, dispatch]);

  useEffect(() => {
    if (orders && orders.length > 0) {
      const completedOrders = orders.filter(
        (order) => order.status === 'completed' || order.status === 'delivered'
      );
      if (completedOrders.length > 0) {
        const sortedOrders = completedOrders.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setLastCompletedOrder(sortedOrders[0]);
      }
    }
  }, [orders]);

  const handleTabPress = (tabId) => {
    if (onNavigate) {
      onNavigate(tabId);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleAddToCart = async (productOrId) => {
    try {
      let productId = productOrId;
      if (typeof productOrId === 'object' && productOrId !== null) {
        productId = productOrId.id;
      }
      if (!productId) {
        Alert.alert(t('error'), 'productId не передан!');
        return;
      }
      const resp = await productApi.getProductById(productId);
      if (resp.status !== 'success' || !resp.data) {
        throw new Error(
          t('error') + ': ' + (resp.message || 'Product not found')
        );
      }
      const realProduct = resp.data;
      await dispatch(
        require('../store/cartSlice').addToCart({
          productData: realProduct,
          userId,
        })
      );
    } catch (err) {
      Alert.alert('Ошибка', err.message || String(err));
    }
  };

  const handleRetry = () => {
    if (error) {
      loadInitialData();
    }
  };

  if (categoriesLoading || productsLoading || ordersLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.backgroundColor }]}
  edges={['top', 'left', 'right', 'bottom']}
      >
        <StatusBar barStyle={theme.statusBarStyle || 'dark-content'} backgroundColor={theme.backgroundColor} />
        <View
          style={[
            styles.header,
            {
              backgroundColor: theme.backgroundColor,
              borderBottomColor: theme.borderColor,
            },
          ]}
        >
          <View style={styles.placeholder} />
          <Text style={[styles.headerTitle, { color: theme.primaryText }]}> 
            CoffeePark
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
      edges={['top', 'left', 'right', 'bottom']}
    >
      <StatusBar barStyle={theme.statusBarStyle || 'dark-content'} backgroundColor={theme.backgroundColor} />
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.backgroundColor,
            borderBottomColor: theme.borderColor,
          },
        ]}
      >
        <View style={styles.placeholder} />
        <Text style={[styles.headerTitle, { color: theme.primaryText }]}> 
          CoffeePark
        </Text>
        <View style={styles.placeholder} />
      </View>
      <View style={styles.content}>
        <Categories selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} />
        <ProductList products={products} onAddToCart={handleAddToCart} />
        {lastCompletedOrder && (
          <LastOrder order={lastCompletedOrder} onRepeat={onRepeatOrder} />
        )}
      </View>
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
  borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: SIZES.fontLarge,
    fontWeight: FONT_WEIGHT.semiBold,
  color: colors.black,
  },
  placeholder: {
    width: SIZES.iconLarge * 1.5,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.paddingLarge,
  },
  loadingText: {
    marginTop: SIZES.padding,
    fontSize: SIZES.fontMedium,
    fontWeight: FONT_WEIGHT.medium,
  },
});

export default HomeScreen;
