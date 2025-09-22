/**
 * Экран настроек приложения (Settings Screen).
 * Позволяет пользователю настраивать параметры приложения.
 * 
 * Основной функционал:
 * - Переключение темы (светлая/темная)
 * - Выбор языка интерфейса
 * - Настройки push-уведомлений
 * - Настройки уведомлений о заказах
 * - Управление конфиденциальностью
 * - Сохранение предпочтений пользователя
 * - Синхронизация с сервером
 * - Поддержка локализации
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../themes/colors';
import { FONT_WEIGHT } from '../constants/fontWeight';
import { SIZES } from '../constants/sizes';
import { useSelector, useDispatch } from 'react-redux';
import { selectLanguage, selectT, setLanguage } from '../store/appSlice';
import { toggleTheme } from '../store/themeSlice';
import { SCREENS } from '../navigation/ScreenNames';


import { updateUserPreferences } from '../store/userSlice';

const SettingsScreen = ({ navigation, onNavigate }) => {
  const theme = useSelector((state) => state.theme.theme);
  const isDarkTheme = useSelector((state) => state.theme.isDark);
  const language = useSelector(selectLanguage);
  const t = useSelector(selectT);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.profile); 
  const [pushNotifications, setPushNotifications] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);


  const savePreference = (key, value) => {
    if (user && user.userId) {
      dispatch(
        updateUserPreferences({
          userId: user.userId,
          preferences: {
            ...user.preferences,
            [key]: value,
            language,
            theme: isDarkTheme ? 'dark' : 'light',
          },
        })
      );
    }
  };

  const handleGoBack = () => {
    if (navigation?.goBack) {
      navigation.goBack();
    } else if (onNavigate) {
      onNavigate('profile');
    }
  };

  const handleAboutPress = () => {
    if (navigation?.navigate) {
      navigation.navigate(SCREENS.ABOUT);
    } else if (onNavigate) {
      onNavigate('about');
    }
  };

  const languages = [
    { id: 'ru', name: 'Русский', selected: language === 'ru' },
    { id: 'ua', name: 'Українська', selected: language === 'ua' },
    { id: 'en', name: 'English', selected: language === 'en' },
  ];

  const handleLanguageSelect = async (languageId) => {
    dispatch(setLanguage(languageId));

    if (user && user.userId) {
      dispatch(
        updateUserPreferences({
          userId: user.userId,
          preferences: {
            ...user.preferences,
            language: languageId,
            theme: isDarkTheme ? 'dark' : 'light',
          },
        })
      );
    }
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());

    if (user && user.userId) {
      dispatch(
        updateUserPreferences({
          userId: user.userId,
          preferences: {
            ...user.preferences,
            language: language,
            theme: !isDarkTheme ? 'dark' : 'light',
          },
        })
      );
    }
  };

  const handleSavePreferences = () => {
    if (user && user.userId) {
      dispatch(
        updateUserPreferences({
          userId: user.userId,
          preferences: {
            ...user.preferences,
            pushNotifications,
            orderUpdates,
            promotions,
            language,
            theme: isDarkTheme ? 'dark' : 'light',
          },
        })
      );
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
          {t('settings')}
        </Text>
        <View style={styles.placeholder} />
      </View>

  <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>
            {t('notifications')}
          </Text>

          <View
            style={[styles.settingItem, { backgroundColor: theme.cardColor }]}
          >
            <View style={styles.settingLeft}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color={theme.primaryText}
              />
              <View style={styles.settingTextContainer}>
                <Text
                  style={[styles.settingTitle, { color: theme.primaryText }]}
                >
                  {t('pushNotifications')}
                </Text>
                <Text
                  style={[
                    styles.settingSubtitle,
                    { color: theme.secondaryText },
                  ]}
                >
                  {t('pushNotificationsDesc')}
                </Text>
              </View>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={(val) => {
                setPushNotifications(val);
                savePreference('pushNotifications', val);
              }}
              trackColor={{ false: theme.borderColor, true: theme.brandColor }}
              thumbColor={'#fff'}
            />
          </View>

          <View
            style={[styles.settingItem, { backgroundColor: theme.cardColor }]}
          >
            <View style={styles.settingLeft}>
              <Ionicons
                name="receipt-outline"
                size={24}
                color={theme.primaryText}
              />
              <View style={styles.settingTextContainer}>
                <Text
                  style={[styles.settingTitle, { color: theme.primaryText }]}
                >
                  {t('orderUpdates')}
                </Text>
                <Text
                  style={[
                    styles.settingSubtitle,
                    { color: theme.secondaryText },
                  ]}
                >
                  {t('orderUpdatesDesc')}
                </Text>
              </View>
            </View>
            <Switch
              value={orderUpdates}
              onValueChange={(val) => {
                setOrderUpdates(val);
                savePreference('orderUpdates', val);
              }}
              trackColor={{ false: theme.borderColor, true: theme.brandColor }}
              thumbColor={'#fff'}
            />
          </View>

          <View
            style={[styles.settingItem, { backgroundColor: theme.cardColor }]}
          >
            <View style={styles.settingLeft}>
              <Ionicons
                name="gift-outline"
                size={24}
                color={theme.primaryText}
              />
              <View style={styles.settingTextContainer}>
                <Text
                  style={[styles.settingTitle, { color: theme.primaryText }]}
                >
                  {t('promotions')}
                </Text>
                <Text
                  style={[
                    styles.settingSubtitle,
                    { color: theme.secondaryText },
                  ]}
                >
                  {t('promotionsDesc')}
                </Text>
              </View>
            </View>
            <Switch
              value={promotions}
              onValueChange={(val) => {
                setPromotions(val);
                savePreference('promotions', val);
              }}
              trackColor={{ false: theme.borderColor, true: theme.brandColor }}
              thumbColor={'#fff'}
            />
          </View>
        </View>



        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>
            {t('language')}
          </Text>

          {languages.map((language) => (
            <TouchableOpacity
              key={language.id}
              style={[styles.settingItem, { backgroundColor: theme.cardColor }]}
              onPress={() => handleLanguageSelect(language.id)}
            >
              <View style={styles.settingLeft}>
                <Ionicons
                  name="language-outline"
                  size={24}
                  color={theme.primaryText}
                />
                <View style={styles.settingTextContainer}>
                  <Text
                    style={[styles.settingTitle, { color: theme.primaryText }]}
                  >
                    {language.name}
                  </Text>
                </View>
              </View>
              {language.selected && (
                <Ionicons name="checkmark" size={20} color={theme.brandColor} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>
            {t('theme')}
          </Text>

          <View
            style={[styles.settingItem, { backgroundColor: theme.cardColor }]}
          >
            <View style={styles.settingLeft}>
              <Ionicons
                name="moon-outline"
                size={24}
                color={theme.primaryText}
              />
              <View style={styles.settingTextContainer}>
                <Text
                  style={[styles.settingTitle, { color: theme.primaryText }]}
                >
                  {t('darkTheme')}
                </Text>
                <Text
                  style={[
                    styles.settingSubtitle,
                    { color: theme.secondaryText },
                  ]}
                >
                  {t('darkThemeDesc')}
                </Text>
              </View>
            </View>
            <Switch
              value={isDarkTheme}
              onValueChange={handleThemeToggle}
              trackColor={{ false: theme.borderColor, true: theme.brandColor }}
              thumbColor={'#fff'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>
            {t('other')}
          </Text>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: theme.cardColor }]}
            onPress={handleAboutPress}
          >
            <View style={styles.settingLeft}>
              <Ionicons
                name="shield-outline"
                size={24}
                color={theme.primaryText}
              />
              <View style={styles.settingTextContainer}>
                <Text
                  style={[styles.settingTitle, { color: theme.primaryText }]}
                >
                  {t('privacy')}
                </Text>
                <Text
                  style={[
                    styles.settingSubtitle,
                    { color: theme.secondaryText },
                  ]}
                >
                  {t('privacyDesc')}
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.lightText}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: theme.cardColor }]}
            onPress={handleAboutPress}
          >
            <View style={styles.settingLeft}>
              <Ionicons
                name="help-circle-outline"
                size={24}
                color={theme.primaryText}
              />
              <View style={styles.settingTextContainer}>
                <Text
                  style={[styles.settingTitle, { color: theme.primaryText }]}
                >
                  {t('help')}
                </Text>
                <Text
                  style={[
                    styles.settingSubtitle,
                    { color: theme.secondaryText },
                  ]}
                >
                  {t('helpDesc')}
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.lightText}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: theme.cardColor }]}
            onPress={handleAboutPress}
          >
            <View style={styles.settingLeft}>
              <Ionicons
                name="information-circle-outline"
                size={24}
                color={theme.primaryText}
              />
              <View style={styles.settingTextContainer}>
                <Text
                  style={[styles.settingTitle, { color: theme.primaryText }]}
                >
                  {t('about')}
                </Text>
                <Text
                  style={[
                    styles.settingSubtitle,
                    { color: theme.secondaryText },
                  ]}
                >
                  {t('aboutDesc')}
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.lightText}
            />
          </TouchableOpacity>
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
    paddingVertical: SIZES.padding,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: SIZES.paddingSmall,
  },
  headerTitle: {
    fontSize: SIZES.fontLarge,
    fontWeight: FONT_WEIGHT.semiBold,
  },
  placeholder: {
    width: SIZES.iconLarge * 1.5,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: SIZES.marginLarge,
  },
  sectionTitle: {
    fontSize: SIZES.fontMedium,
    fontWeight: FONT_WEIGHT.semiBold,
    marginBottom: SIZES.marginLarge - 8,
    marginHorizontal: SIZES.marginLarge,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.paddingLarge,
    paddingVertical: SIZES.paddingLarge,
    borderBottomWidth: 1,
  borderBottomColor: colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: SIZES.marginSmall * 3,
    flex: 1,
  },
  settingTitle: {
    fontSize: SIZES.fontMedium,
    fontWeight: FONT_WEIGHT.medium,
    marginBottom: SIZES.marginSmall,
  },
  settingSubtitle: {
    fontSize: SIZES.fontSmall,
  },
});

export default SettingsScreen;
