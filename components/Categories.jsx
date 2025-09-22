/**
 * Компонент категорий товаров (Categories).
 * Горизонтальный список категорий для фильтрации товаров.
 * 
 * Props:
 * @param {Function} onCategoryChange - Callback при выборе категории
 * @param {string} selectedCategory - Текущая выбранная категория
 * 
 * Функциональность:
 * - Загрузка категорий с сервера
 * - Горизонтальная прокрутка категорий
 * - Выделение активной категории
 * - Поддержка многоязычности названий
 * - Индикатор загрузки
 * - Адаптация под тему приложения
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { selectLanguage, selectT } from '../store/appSlice';
import { colors } from '../themes/colors';
import { SIZES } from '../constants/sizes';
import { FONT_WEIGHT } from '../constants/fontWeight';
import { categoryApi } from '../services/apiService';
import CustomButton from './CustomButton';

const Categories = ({ onCategoryChange, selectedCategory }) => {
  const theme = useSelector((state) => state.theme.theme);
  const language = useSelector(selectLanguage);
  const t = useSelector(selectT);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(
    selectedCategory || null
  );

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory !== activeCategory) {
      setActiveCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const response = await categoryApi.getCategories();
      setCategories(response.data);

      if (!selectedCategory && response.data.length > 0) {
        setActiveCategory(response.data[0].id);
        if (onCategoryChange) {
          onCategoryChange(response.data[0].id);
        }
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (category) => {
    switch (language) {
      case 'ua':
        return category.nameUa || category.name;
      case 'en':
        return category.nameEn || category.name;
      default:
        return category.name;
    }
  };

  const handleCategoryPress = (categoryId) => {
    setActiveCategory(categoryId);
    if (onCategoryChange) {
      onCategoryChange(categoryId);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="small" color={theme.brandColor} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {categories.map((category) => (
          <CustomButton
            key={category.id || category.name || JSON.stringify(category)}
            title={getCategoryName(category)}
            onPress={() => handleCategoryPress(category.id)}
            style={[
              styles.categoryButton,
              activeCategory === category.id && {
                backgroundColor: theme.brandColor,
              },
            ]}
            textStyle={[
              styles.categoryText,
              activeCategory === category.id
                ? { color: colors.white }
                : { color: theme.primaryText },
            ]}
            variant={activeCategory === category.id ? 'primary' : 'outline'}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SIZES.paddingSmall,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: SIZES.iconLarge * 2 + 2, 
  },
  scrollContainer: {
    paddingHorizontal: SIZES.padding,
    gap: SIZES.marginSmall * 2,
  },
  categoryButton: {
    paddingHorizontal: SIZES.paddingLarge,
    paddingVertical: SIZES.paddingSmall,
    borderRadius: SIZES.largeRadius,
    marginRight: SIZES.marginSmall * 2,
  },
  categoryText: {
    fontSize: SIZES.fontSmall,
    fontWeight: FONT_WEIGHT.medium,
  },
});

export default Categories;
