/**
 * Компонент карты локации (Location Map).
 * Отображает упрощенную карту для выбора адреса доставки.
 * 
 * Функциональность:
 * - Отображение стилизованной карты с сеткой
 * - Маркер текущего местоположения
 * - Кнопка выбора адреса
 * - Адаптация под тему приложения
 * - Заглушка для будущей интеграции с реальными картами
 * - Responsive дизайн
 * 
 * Примечание: Компонент использует статичное изображение карты.
 * В будущем может быть заменен на интеграцию с Google Maps или другими сервисами.
 */
import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from './CustomButton';
import { colors } from '../themes/colors';
import { SIZES } from '../constants/sizes';
import { FONT_WEIGHT } from '../constants/fontWeight';

const LocationMap = () => {
  const handleLocationPress = () => {
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{
          uri: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8cGF0aCBkPSJNIDIwIDAgTCAwIDAgMCAyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZGRkIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgIDwvcGF0dGVybj4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2Y4ZjlmYSIvPgogIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz4KPC9zdmc+',
        }}
        style={styles.mapContainer}
        imageStyle={styles.mapImage}
      >
        <View style={styles.mapOverlay}>
          <View style={styles.markerContainer}>
            <Ionicons
              name="location"
              size={SIZES.iconLarge}
              color={colors.primary}
            />
          </View>
        </View>
      </ImageBackground>

      <CustomButton
        title="Определить моё место"
        onPress={handleLocationPress}
        style={styles.locationButton}
        textStyle={styles.locationButtonText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.marginLarge,
  },
  mapContainer: {
    height: 200,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
    marginBottom: 15,
  },
  mapImage: {
    borderRadius: SIZES.radius,
  },
  mapOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  markerContainer: {
  backgroundColor: colors.white,
    borderRadius: SIZES.largeRadius,
    width: SIZES.iconLarge * 1.66, 
    height: SIZES.iconLarge * 1.66,
    justifyContent: 'center',
    alignItems: 'center',
  shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: SIZES.elevation,
  },
  locationButton: {
  backgroundColor: colors.primary,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.paddingSmall * 2 - 1, 
    alignItems: 'center',
  },
  locationButtonText: {
  color: colors.white,
    fontSize: SIZES.fontMedium,
    fontWeight: FONT_WEIGHT.semiBold,
  },
});

export default LocationMap;
