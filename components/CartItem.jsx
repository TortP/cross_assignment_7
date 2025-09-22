/**
 * Компонент элемента корзины (Cart Item).
 * Отображает товар в корзине с возможностью изменения количества.
 * 
 * Props:
 * @param {Object} item - Объект товара в корзине (id, name, price, quantity, image)
 * @param {Function} onUpdateQuantity - Callback для изменения количества товара
 * @param {boolean} updating - Флаг состояния обновления
 * 
 * Функциональность:
 * - Отображение изображения, названия, цены товара
 * - Кнопки увеличения/уменьшения количества
 * - Поддержка многоязычности (UA/EN/RU)
 * - Адаптация под выбранную тему
 * - Индикатор загрузки при обновлении
 */
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '../themes/colors';
import { SIZES } from '../constants/sizes';
import { FONT_WEIGHT } from '../constants/fontWeight';
import CustomButton from './CustomButton';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { selectLanguage } from '../store/appSlice';

const CartItem = ({ item, onUpdateQuantity, updating }) => {
  const theme = useSelector((state) => state.theme.theme);
  const language = useSelector(selectLanguage);

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

  return (
    <View style={[styles.container, { backgroundColor: theme.cardColor }]}>
      <Image source={{ uri: item.image }} style={styles.image} />

      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.primaryText }]}>
          {getProductName(item)}
        </Text>
        {item.subtitle && (
          <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
            — {item.subtitle}
          </Text>
        )}
        <Text style={[styles.price, { color: theme.brandColor }]}>
          {item.price} ₴
        </Text>
      </View>

      <View style={styles.quantityControls}>
        <CustomButton
          onPress={() => onUpdateQuantity(item.id, item.quantity - 1)}
          style={styles.quantityButton}
          title={''}
          icon={<Ionicons name="remove" size={20} color={theme.brandColor} />}
          variant="outline"
          disabled={updating}
        />
        <Text style={styles.quantity}>{item.quantity}</Text>
        <CustomButton
          onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
          style={styles.quantityButton}
          title={''}
          icon={<Ionicons name="add" size={20} color={theme.brandColor} />}
          variant="outline"
          disabled={updating}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  backgroundColor: colors.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
  shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: SIZES.elevation,
  },
  image: {
    width: SIZES.image * 0.75, 
    height: SIZES.image * 0.75,
    borderRadius: SIZES.smallRadius,
    marginRight: SIZES.marginLarge - 4,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: SIZES.fontMedium,
    fontWeight: FONT_WEIGHT.semiBold,
  color: colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: SIZES.fontSmall,
  color: colors.textLight,
    marginBottom: SIZES.marginSmall,
  },
  price: {
    fontSize: SIZES.fontSmall,
  color: colors.textLight,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  backgroundColor: colors.background,
    borderRadius: SIZES.smallRadius,
    paddingHorizontal: SIZES.marginSmall,
  },
  quantityButton: {
    padding: SIZES.paddingSmall,
    backgroundColor: 'transparent',
    borderRadius: 0,
    minWidth: 0,
    minHeight: 0,
    elevation: 0,
    borderWidth: 0,
  },
  quantity: {
    fontSize: SIZES.fontMedium,
    fontWeight: '600',
  color: colors.text,
    marginHorizontal: SIZES.marginLarge - 4,
    minWidth: SIZES.iconLarge,
    textAlign: 'center',
  },
});

export default CartItem;
