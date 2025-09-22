/**
 * Компонент секции оплаты (Payment Section).
 * Отображает итоговую сумму заказа и кнопку оформления.
 * 
 * Props:
 * @param {number} totalAmount - Общая сумма заказа
 * @param {Function} onCompleteOrder - Callback для завершения заказа
 * 
 * Функциональность:
 * - Отображение итоговой суммы заказа
 * - Кнопка завершения заказа
 * - Адаптация под тему приложения
 * - Поддержка локализации
 * - Responsive дизайн
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CustomButton from './CustomButton';
import { useSelector } from 'react-redux';
import { selectT } from '../store/appSlice';
import { colors } from '../themes/colors';
import { SIZES } from '../constants/sizes';
import { FONT_WEIGHT } from '../constants/fontWeight';

const PaymentSection = ({ totalAmount, onCompleteOrder }) => {
  const theme = useSelector((state) => state.theme.theme);
  const t = useSelector(selectT);

  const handlePayment = () => {
    if (onCompleteOrder) {
      onCompleteOrder();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.cardColor }]}>
      <View style={styles.totalRow}>
        <Text style={[styles.totalLabel, { color: theme.primaryText }]}>
          {t('total')}:
        </Text>
        <Text style={[styles.totalAmount, { color: theme.brandColor }]}>
          {totalAmount} ₴
        </Text>
      </View>

      <CustomButton
        title={t('pay')}
        onPress={handlePayment}
        style={[styles.paymentButton, { backgroundColor: theme.brandColor }]}
        textStyle={styles.paymentButtonText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SIZES.paddingLarge,
    paddingVertical: SIZES.paddingLarge,
  backgroundColor: colors.white,
    borderTopLeftRadius: SIZES.largeRadius,
    borderTopRightRadius: SIZES.largeRadius,
    marginTop: SIZES.marginLarge,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.marginLarge,
  },
  totalLabel: {
    fontSize: SIZES.fontLarge,
    fontWeight: FONT_WEIGHT.semiBold,
  color: colors.text,
  },
  totalAmount: {
    fontSize: SIZES.fontLarge,
    fontWeight: FONT_WEIGHT.bold,
  color: colors.text,
  },
  paymentButton: {
  backgroundColor: colors.primary,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.padding,
    alignItems: 'center',
  },
  paymentButtonText: {
  color: colors.white,
    fontSize: SIZES.fontMedium,
    fontWeight: FONT_WEIGHT.semiBold,
  },
});

export default PaymentSection;
