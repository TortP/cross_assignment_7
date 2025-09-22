/**
 * Компонент последнего заказа (Last Order).
 * Отображает информацию о последнем заказе пользователя с возможностью повтора.
 * 
 * Props:
 * @param {Object} order - Объект последнего заказа (items, total, date)
 * @param {Function} onRepeat - Callback для повтора заказа
 * 
 * Функциональность:
 * - Отображение товаров из последнего заказа
 * - Расчет общей стоимости заказа
 * - Кнопка повтора заказа
 * - Поддержка многоязычности
 * - Адаптация под тему приложения
 * - Форматирование даты заказа
 * - Скрытие компонента при отсутствии данных
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import CustomButton from './CustomButton';
import { useSelector } from 'react-redux';
import { selectLanguage, selectT } from '../store/appSlice';
import { colors } from '../themes/colors';
import { SIZES } from '../constants/sizes';
import { FONT_WEIGHT } from '../constants/fontWeight';

const LastOrder = ({ order, onRepeat }) => {
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

  if (!order || !order.items) return null;
  const calculatedTotal = order.items.reduce(
    (sum, item) => sum + Number(item.quantity) * Number(item.price),
    0
  );
  const total =
    typeof order.total === 'number' && !isNaN(order.total)
      ? order.total
      : calculatedTotal;

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      <Text style={[styles.title, { color: theme.primaryText }]}>
        {t('lastOrder')}
      </Text>
      <View style={[styles.card, { backgroundColor: theme.cardColor }]}>
        <View
          style={[styles.orderHeader, { borderBottomColor: theme.borderColor }]}
        >
          <Text style={[styles.orderNumber, { color: theme.primaryText }]}>
            {t('orderNumber')} {order.orderNumber}
          </Text>
          <Text style={[styles.date, { color: theme.secondaryText }]}>
            {order.date}
          </Text>
        </View>
        <View style={styles.itemsList}>
          {order.items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <Text style={[styles.itemName, { color: theme.primaryText }]}>
                {getProductName(item)}
              </Text>
              <Text
                style={[styles.itemDetails, { color: theme.secondaryText }]}
              >
                {item.quantity} x {item.price}₴ = {item.quantity * item.price}₴
              </Text>
            </View>
          ))}
        </View>
        <View
          style={[styles.orderFooter, { borderTopColor: theme.borderColor }]}
        >
          <Text style={[styles.totalText, { color: theme.primaryText }]}>
            {t('total')}: {total}₴
          </Text>
          <CustomButton
            title={t('repeat')}
            onPress={() => typeof onRepeat === 'function' && onRepeat(order)}
            style={[styles.repeatButton, { backgroundColor: theme.brandColor }]}
            textStyle={styles.buttonText}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SIZES.paddingLarge,
    paddingVertical: SIZES.paddingSmall,
    paddingBottom: SIZES.margin,
  },
  title: {
    fontSize: SIZES.fontMedium,
    fontWeight: FONT_WEIGHT.semiBold,
    marginBottom: SIZES.marginSmall * 2,
  },
  card: {
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
  shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: SIZES.elevation,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.margin,
    paddingBottom: SIZES.paddingSmall,
    borderBottomWidth: SIZES.borderWidth,
  },
  orderNumber: {
    fontSize: SIZES.fontLarge,
    fontWeight: FONT_WEIGHT.semiBold,
  },
  date: {
    fontSize: SIZES.fontSmall - 2,
  },
  itemsList: {
    marginBottom: SIZES.margin,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.marginSmall,
  },
  itemName: {
    fontSize: SIZES.fontMedium,
    flex: 1,
    marginRight: SIZES.marginSmall * 2,
  },
  itemDetails: {
    fontSize: SIZES.fontSmall + 2,
    textAlign: 'right',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SIZES.paddingSmall,
    borderTopWidth: SIZES.borderWidth,
  },
  totalText: {
    fontSize: SIZES.fontLarge,
    fontWeight: FONT_WEIGHT.semiBold,
  },
  repeatButton: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.paddingSmall,
    borderRadius: SIZES.smallRadius,
  },
  buttonText: {
  color: colors.white,
    fontSize: SIZES.fontSmall - 1,
    fontWeight: FONT_WEIGHT.semiBold,
  },
});

export default LastOrder;
