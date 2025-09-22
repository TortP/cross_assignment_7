/**
 * Компонент списка товаров (Product List).
 * Отображает сетку товаров с поддержкой поиска и фильтрации.
 * 
 * Props:
 * @param {Array} products - Массив товаров для отображения
 * @param {Function} onAddToCart - Callback для добавления товара в корзину
 * @param {boolean} loading - Флаг состояния загрузки
 * 
 * Функциональность:
 * - Индикатор загрузки
 * - Сообщение об отсутствии товаров
 * - Поддержка многоязычности
 * - Адаптация под тему приложения
 * - Оптимизированный рендеринг через FlatList
 */
import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../themes/colors';
import { SIZES } from '../constants/sizes';
import { FONT_WEIGHT } from '../constants/fontWeight';
import ProductCard from './ProductCard';
import { useSelector } from 'react-redux';
import { selectLanguage, selectT } from '../store/appSlice';

const ProductList = ({ products = [], onAddToCart, loading = false }) => {
  const theme = useSelector((state) => state.theme.theme);
  const language = useSelector(selectLanguage);
  const t = useSelector(selectT);

  const getProductName = (product) => {
    switch (language) {
      case 'ua':
        return product.nameUa || product.name;
      case 'en':
        return product.nameEn || product.name;
      default:
        return product.name;
    }
  };

  const getProductDescription = (product) => {
    switch (language) {
      case 'ua':
        return product.descriptionUa || product.description;
      case 'en':
        return product.descriptionEn || product.description;
      default:
        return product.description;
    }
  };

  const renderProduct = ({ item }) => (
    <ProductCard
      product={item}
      onAddToCart={() => onAddToCart && onAddToCart(item.id)}
    />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.brandColor} />
        <Text style={[styles.loadingText, { color: theme.primaryText }]}>
          {t('loadingProducts')}
        </Text>
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyTitle, { color: theme.primaryText }]}>
          {t('noProducts')}
        </Text>
        <Text style={[styles.emptySubtitle, { color: theme.secondaryText }]}>
          {t('noProductsHint')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>
        {t('catalog')}
      </Text>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SIZES.paddingLarge * 2.5, 
  },
  loadingText: {
    marginTop: SIZES.margin,
    fontSize: SIZES.fontMedium,
    textAlign: 'center',
    lineHeight: SIZES.fontMedium + 4, 
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SIZES.paddingLarge * 2.5, 
  },
  emptyTitle: {
    fontSize: SIZES.fontLarge,
    fontWeight: FONT_WEIGHT.semiBold,
    marginBottom: SIZES.marginSmall * 2,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: SIZES.fontSmall,
    textAlign: 'center',
    lineHeight: SIZES.fontSmall + 8, 
  },
  sectionTitle: {
    fontSize: SIZES.fontLarge,
    fontWeight: FONT_WEIGHT.semiBold,
    marginBottom: SIZES.marginLarge,
    marginTop: SIZES.marginSmall * 2,
  },
  listContainer: {
    paddingBottom: SIZES.paddingLarge,
  },
});

export default ProductList;
