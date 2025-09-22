/**
 * Компонент интерактивной карты (Map Component).
 * Отображает стилизованную карту с маркерами для отслеживания доставки.
 *
 * Прототип:
 * - Схематичное отображение карты города
 * - Маркеры пользователя и курьера
 * - Адаптация под тему приложения
 * - Responsive дизайн
 *
 * Используется для:
 * - Отслеживания статуса доставки
 * - Отображения местоположения курьера
 * - Визуализации маршрута доставки
 */
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../themes/colors';
import { SIZES } from '../constants/sizes';

const MapComponent = () => {
  return (
    <View style={styles.container}>
      <View style={styles.mapBackground}>
        <View style={[styles.street, styles.street1]} />
        <View style={[styles.street, styles.street2]} />
        <View style={[styles.street, styles.street3]} />
        <View style={[styles.street, styles.street4]} />
        <View style={[styles.street, styles.street5]} />
        <View style={[styles.street, styles.street6]} />

        <View style={[styles.streetVertical, styles.streetV1]} />
        <View style={[styles.streetVertical, styles.streetV2]} />
        <View style={[styles.streetVertical, styles.streetV3]} />
        <View style={[styles.streetVertical, styles.streetV4]} />

        <View style={[styles.marker, styles.userMarker]}>
          <Ionicons
            name="location"
            size={SIZES.iconMedium}
            color={colors.accent}
          />
        </View>

        <View style={[styles.marker, styles.courierMarker]}>
          <Ionicons
            name="location"
            size={SIZES.iconMedium}
            color={colors.secondary}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
  },
  mapBackground: {
    flex: 1,
    backgroundColor: colors.background,
    position: 'relative',
  },
  street: {
    position: 'absolute',
    height: SIZES.borderWidthThick,
    backgroundColor: colors.card,
    left: 0,
    right: 0,
  },
  street1: {
    top: '15%',
  },
  street2: {
    top: '30%',
  },
  street3: {
    top: '45%',
  },
  street4: {
    top: '60%',
  },
  street5: {
    top: '75%',
  },
  street6: {
    top: '90%',
  },
  streetVertical: {
    position: 'absolute',
    width: SIZES.borderWidthThick,
    backgroundColor: colors.card,
    top: 0,
    bottom: 0,
  },
  streetV1: {
    left: '20%',
  },
  streetV2: {
    left: '40%',
  },
  streetV3: {
    left: '60%',
  },
  streetV4: {
    left: '80%',
  },
  marker: {
    position: 'absolute',
    width: SIZES.iconLarge + 6,
    height: SIZES.iconLarge + 6,
    borderRadius: (SIZES.iconLarge + 6) / 2,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: SIZES.elevation,
  },
});

export default MapComponent;
