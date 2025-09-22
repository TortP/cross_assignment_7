/**
 * Компонент карточки товара (Product Card).
 * Отображает информацию о товаре с возможностью добавления в корзину.
 * 
 * Props:
 * @param {Object} product - Объект товара (id, name, price, image, description)
 * @param {Function} onAddToCart - Callback для добавления товара в корзину
 * 
 * Функциональность:
 * - Отображение изображения, названия, описания, цены товара
 * - Кнопка добавления в корзину
 * - Поддержка многоязычности (UA/EN/RU)
 * - Адаптивный дизайн под разные размеры экрана
 * - Адаптация под выбранную тему
 */
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import CustomButton from './CustomButton';
import { useSelector } from 'react-redux';
import { selectLanguage, selectT } from '../store/appSlice';
import { colors } from '../themes/colors';
import { SIZES } from '../constants/sizes';
import { FONT_WEIGHT } from '../constants/fontWeight';

const ProductCard = ({ product, onAddToCart }) => {
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

  return (
    <View style={[styles.productCard, { backgroundColor: theme.cardColor }]}>
      <Image
        source={{ uri: product.image || 'https://via.placeholder.com/80x80' }}
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: theme.primaryText }]}>
          {getProductName(product)}
        </Text>
        {product.description && (
          <Text
            style={[styles.productDescription, { color: theme.secondaryText }]}
          >
            {getProductDescription(product)}
          </Text>
        )}
        <Text style={[styles.productPrice, { color: theme.brandColor }]}>
          {product.price} ₴
        </Text>
      </View>
      <CustomButton
        title={product.isAvailable ? t('addToCart') : t('notAvailable')}
        onPress={onAddToCart}
        disabled={!product.isAvailable}
        style={[
          styles.addButton,
          !product.isAvailable && { backgroundColor: theme.disabledButton },
        ]}
        textStyle={styles.buttonText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
  shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: SIZES.elevation,
  },
  productImage: {
    width: SIZES.image,
    height: SIZES.image,
    borderRadius: SIZES.radius,
    marginRight: SIZES.margin,
  backgroundColor: colors.background,
  },
  productInfo: {
    flex: 1,
    marginRight: SIZES.marginLarge - 4,
  },
  productName: {
    fontSize: SIZES.fontMedium,
    fontWeight: FONT_WEIGHT.semiBold,
    marginBottom: SIZES.marginSmall,
  },
  productDescription: {
    fontSize: SIZES.fontSmall,
    marginBottom: SIZES.marginSmall * 2,
    lineHeight: SIZES.fontSmall + 4, 
  },
  productPrice: {
    fontSize: SIZES.fontMedium,
    fontWeight: FONT_WEIGHT.bold,
  },
  addButton: {
    paddingVertical: SIZES.paddingSmall,
    paddingHorizontal: SIZES.padding,
    borderRadius: SIZES.smallRadius,
    alignItems: 'center',
    minWidth: SIZES.image,
  },
  buttonText: {
  color: colors.white,
    fontSize: SIZES.fontSmall,
    fontWeight: FONT_WEIGHT.semiBold,
  },
});

export default ProductCard;
