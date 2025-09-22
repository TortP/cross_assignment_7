
/**
 * Система цветов и тем оформления (Colors & Themes).
 * Определяет цветовые схемы для светлой и темной тем приложения.
 * 
 * Структура:
 * - colors: базовая палитра цветов
 * - lightTheme: цветовая схема светлой темы
 * - darkTheme: цветовая схема темной темы
 * 
 * Категории цветов:
 * - Основные: primary, secondary, accent
 * - Фоновые: background, surface, card
 * - Текстовые: primaryText, secondaryText, lightText
 * - Состояния: success, warning, error, disabled
 * - Интерфейс: borders, dividers, shadows
 * 
 * Используется в Redux themeSlice для переключения тем.
 * Обеспечивает консистентный дизайн и поддержку темной темы.
 */

export const colors = {
  primary: '#28a745',
  secondary: '#4CAF50',
  accent: '#2196F3',
  background: '#f5f5f5',
  card: '#f0f0f0',
  text: '#333',
  textLight: '#666',
  white: '#fff',
  black: '#000',
  border: '#f0f0f0',
  warning: '#FF9800',
  error: '#F44336',
  surface: '#F8F8F8',
  divider: '#E0E0E0',
  disabled: '#BDBDBD',
  success: '#4CAF50',
  info: '#2196F3',
  danger: '#F44336',
  // dark theme
  darkBackground: '#121212',
  darkSurface: '#1E1E1E',
  darkCard: '#2C2C2C',
  darkSecondaryText: '#B3B3B3',
  darkLightText: '#808080',
  darkBrand: '#66BB6A',
  darkAccent: '#4CAF50',
  darkSuccess: '#66BB6A',
  darkWarning: '#FFB74D',
  darkError: '#EF5350',
  darkBorder: '#404040',
  darkDivider: '#303030',
};

export const lightTheme = {
  backgroundColor: colors.white,
  surfaceColor: colors.surface,
  cardColor: colors.white,

  // Text colors
  primaryText: colors.text,
  secondaryText: colors.textLight,
  lightText: '#999999',

  // Brand colors
  brandColor: colors.secondary,
  accentColor: colors.primary,

  // Functional colors
  successColor: colors.secondary,
  warningColor: colors.warning,
  errorColor: colors.error,

  // Border and divider colors
  borderColor: colors.divider,
  dividerColor: colors.border,

  // Tab colors
  tabActiveColor: colors.text,
  tabInactiveColor: colors.textLight,
  tabActiveBackground: colors.white,
  tabInactiveBackground: colors.surface,

  // Status bar
  statusBarStyle: 'dark-content',

  // Shadow
  shadowColor: colors.black,

  // Navigation
  navigationBackgroundColor: colors.white,
};

export const darkTheme = {
  backgroundColor: colors.darkBackground,
  surfaceColor: colors.darkSurface,
  cardColor: colors.darkCard,

  // Text colors
  primaryText: colors.white,
  secondaryText: colors.darkSecondaryText,
  lightText: colors.darkLightText,

  // Brand colors
  brandColor: colors.darkBrand,
  accentColor: colors.darkAccent,

  // Functional colors
  successColor: colors.darkSuccess,
  warningColor: colors.darkWarning,
  errorColor: colors.darkError,

  // Border and divider colors
  borderColor: colors.darkBorder,
  dividerColor: colors.darkDivider,

  // Tab colors
  tabActiveColor: colors.white,
  tabInactiveColor: colors.darkLightText,
  tabActiveBackground: colors.darkCard,
  tabInactiveBackground: colors.darkSurface,

  // Status bar
  statusBarStyle: 'light-content',

  // Shadow
  shadowColor: colors.black,

  // Navigation
  navigationBackgroundColor: colors.darkSurface,
};
