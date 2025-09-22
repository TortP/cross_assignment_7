/**
 * Универсальный компонент кнопки (Custom Button).
 * Настраиваемая кнопка с поддержкой различных вариантов оформления.
 * 
 * Props:
 * @param {string} title - Текст кнопки
 * @param {Function} onPress - Обработчик нажатия
 * @param {Object} style - Дополнительные стили кнопки
 * @param {Object} textStyle - Дополнительные стили текста
 * @param {boolean} disabled - Состояние недоступности
 * @param {boolean} loading - Показать индикатор загрузки
 * @param {ReactNode} icon - Иконка для кнопки
 * @param {string} variant - Вариант оформления ('primary', 'secondary', 'outline', 'danger')
 * 
 * Функциональность:
 * - Поддержка разных вариантов дизайна
 * - Состояния disabled и loading
 * - Адаптация под тему приложения
 */
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { colors } from '../themes/colors';
import { SIZES } from '../constants/sizes';
import { FONT_WEIGHT } from '../constants/fontWeight';

const CustomButton = ({
  title,
  onPress,
  style = {},
  textStyle = {},
  disabled = false,
  loading = false,
  icon = null,
  variant = 'primary',
  ...props
}) => {
  const theme = useSelector((state) => state.theme.theme);

  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: theme.secondaryButton,
          borderColor: theme.secondaryButton,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: theme.brandColor,
          borderWidth: 1,
        };
      default:
        return {
          backgroundColor: theme.brandColor,
          borderColor: theme.brandColor,
        };
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={theme.buttonText} />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={[styles.text, { color: theme.buttonText }, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: SIZES.iconLarge + 20,
    minWidth: SIZES.image + 40,
    paddingHorizontal: SIZES.paddingLarge,
    paddingVertical: SIZES.paddingSmall + 2,
    borderRadius: SIZES.smallRadius,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginVertical: SIZES.marginSmall,
  },
  text: {
    fontSize: SIZES.fontMedium,
    fontWeight: FONT_WEIGHT.semiBold,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default CustomButton;
