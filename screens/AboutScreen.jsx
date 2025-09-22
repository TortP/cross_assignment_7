/**
 * Экран информации о приложении (About Screen).
 * Содержит сведения о приложении, команде разработки и контактную информацию.
 * 
 * Основной функционал:
 * - Отображение информации о приложении и версии
 * - Контактная информация и социальные сети
 * - Ссылки на внешние ресурсы (телефон, email, соцсети)
 * - Информация о команде разработчиков
 * - Поддержка темизации и локализации
 * - Обработка нажатий на ссылки (звонки, email, браузер)
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { selectT } from '../store/appSlice';
import { colors } from '../themes/colors';
import { SIZES } from '../constants/sizes';
import { FONT_WEIGHT } from '../constants/fontWeight';

const AboutScreen = ({ navigation, onNavigate }) => {
  const theme = useSelector((state) => state.theme.theme);
  const t = useSelector(selectT);

  const handleGoBack = () => {
    if (navigation?.goBack) {
      navigation.goBack();
    } else if (onNavigate) {
      onNavigate('settings');
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      <StatusBar
        barStyle={theme.statusBarStyle}
        backgroundColor={theme.backgroundColor}
      />

      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.backgroundColor,
            borderBottomColor: theme.borderColor,
          },
        ]}
      >
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={theme.primaryText} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.primaryText }]}>
          {t('about')}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={[styles.scrollContainer, { backgroundColor: theme.backgroundColor }]}
      >
        <View
          style={[
            styles.contentHeader,
            {
              backgroundColor: theme.cardColor,
              borderBottomColor: theme.borderColor,
            },
          ]}
        >
        <View style={styles.logoContainer}>
          <MaterialCommunityIcons
            name="tree"
            size={60}
            color={theme.brandColor}
          />
        </View>
        <Text style={[styles.appName, { color: theme.primaryText }]}>
          {t('coffeepark')}
        </Text>
        <Text style={[styles.version, { color: theme.secondaryText }]}>
          {t('aboutDesc')}
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: theme.cardColor }]}>
        <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>
          {t('about')}
        </Text>
        <Text style={[styles.description, { color: theme.secondaryText }]}>
          {t('aboutCoffeeParkDesc') ||
            'CoffeePark — сервис для заказа кофе и десертов прямо в парке!'}
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: theme.cardColor }]}>
        <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>
          {t('contacts') || 'Контакты'}
        </Text>
        <View style={styles.contactItem}>
          <Ionicons name="call" size={20} color={theme.brandColor} />
          <Text style={[styles.contactText, { color: theme.primaryText }]}>
            +380 (44) 000-00-00
          </Text>
        </View>
        <View style={styles.contactItem}>
          <Ionicons name="mail" size={20} color={theme.brandColor} />
          <Text style={[styles.contactText, { color: theme.primaryText }]}>
            info@coffeepark.com
          </Text>
        </View>
        <View style={styles.contactItem}>
          <Ionicons name="location" size={20} color={theme.brandColor} />
          <Text style={[styles.contactText, { color: theme.primaryText }]}>
            г. Киев, Парк Кофе, 1
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.secondaryText }]}>
          © 2025 CoffeePark. {t('allRightsReserved') || 'Все права защищены.'}
        </Text>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.paddingSmall,
    borderBottomWidth: 1,
    height: 56,
  },
  backButton: {
    padding: SIZES.paddingSmall,
    borderRadius: SIZES.radius,
  },
  headerTitle: {
    fontSize: SIZES.fontLarge,
    fontWeight: FONT_WEIGHT.semiBold,
  },
  headerRight: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  contentHeader: {
    alignItems: 'center',
    padding: 30,
    borderBottomWidth: 1,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  version: {
    fontSize: 14,
  },
  section: {
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: SIZES.fontSmall + 2,
    marginLeft: SIZES.margin,
  },
  footer: {
    alignItems: 'center',
    padding: SIZES.paddingLarge,
    marginBottom: SIZES.marginLarge,
  },
  footerText: {
    fontSize: SIZES.fontSmall,
    textAlign: 'center',
  },
});

export default AboutScreen;
