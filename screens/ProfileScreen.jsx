/**
 * Экран профиля пользователя (Profile Screen).
 * Отображает информацию о пользователе.
 * 
 * Основной функционал:
 * - Отображение данных профиля пользователя
 * - Функция выхода из аккаунта
 * - Pull-to-refresh для обновления данных
 * - Навигация к настройкам и другим экранам
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { selectT } from '../store/appSlice';
import { fetchUserProfile, logout } from '../store/userSlice';
import apiService, { userApi, orderApi } from '../services/apiService';
import {
  fetchLoyalty,
  updateLoyaltyPoints,
  clearLoyalty,
} from '../store/loyaltySlice';
import { clearCartByUser } from '../store/cartSlice';
import { colors } from '../themes/colors';
import { FONT_WEIGHT } from '../constants/fontWeight';
import { SIZES } from '../constants/sizes';
import { SCREENS } from '../navigation/ScreenNames';

const ProfileScreen = ({ navigation }) => {
  const themeState = useSelector((state) => state.theme?.theme);
  const theme = themeState || {
    backgroundColor: '#ffffff',
    cardColor: '#ffffff',
    primaryText: '#000000',
    secondaryText: '#666666',
    lightText: '#999999',
    statusBarStyle: 'dark-content',
  };
  const t = useSelector(selectT);
  const dispatch = useDispatch();
  const userProfile = useSelector((state) => state.user.profile);
  const userLoading = useSelector((state) => state.user.loading);
  const userError = useSelector((state) => state.user.error);
  let loyaltyDataRaw = useSelector((state) => state.loyalty.data);

  const loyaltyData = Array.isArray(loyaltyDataRaw)
    ? loyaltyDataRaw.find((ld) => ld.userId === userId) || loyaltyDataRaw[0]
    : loyaltyDataRaw;
  const loyaltyLoading = useSelector((state) => state.loyalty.loading);
  const loyaltyError = useSelector((state) => state.loyalty.error);
  const [userOrders, setUserOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {}, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfileData();
    setRefreshing(false);
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleTabPress = (tabId) => {
    navigation.navigate(tabId);
  };

  const userId = useSelector((state) => state.userId.value);
  const handleUseFreeCard = async () => {
    if (!loyaltyData || loyaltyData.currentPoints < loyaltyData.maxPoints) {
      return;
    }
    try {
      await dispatch(updateLoyaltyPoints({ userId, points: 0 }));
    } catch (err) {

    }
  };

  const handlePaymentMethods = () => {
    navigation.navigate(SCREENS.PAYMENT_METHODS);
  };

  const handleSavedLocations = () => {
    navigation.navigate(SCREENS.SAVED_LOCATIONS);
  };

  const handleSettings = () => {
    navigation.navigate(SCREENS.SETTINGS);
  };

  const handleLogout = () => {
    try {
 
      dispatch(clearLoyalty());
      dispatch(logout());
    } catch (error) {}
  };

  if (userLoading && !userProfile) {
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
            {t('profile')}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.brandColor} />
          <Text style={[styles.loadingText, { color: theme.primaryText }]}>
            {t('loadingProfile')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
          {t('profile')}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.brandColor]}
            tintColor={theme.brandColor}
          />
        }
      >
        {userProfile ? (
          <View
            style={[styles.userInfoCard, { backgroundColor: theme.cardColor }]}
          >
            <Text style={[styles.userName, { color: theme.primaryText }]}> 
              {userProfile.name || userProfile.userId}
            </Text>
            <Text style={[styles.greeting, { color: theme.primaryText }]}> 
              {t('hello')}, {userProfile.userId || userProfile.name || ''}!
            </Text>
            {/* userId теперь основной идентификатор */}
            {userProfile.phone && (
              <Text style={[styles.userPhone, { color: theme.secondaryText }]}>
                {userProfile.phone}
              </Text>
            )}
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.loginButton, { marginTop: 32, marginBottom: 16 }]}
            onPress={() => navigation.navigate('Login')}
          >
            <Ionicons
              name="log-in-outline"
              size={22}
              color={colors.white}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.buttonText}>{t('login') || 'Войти'}</Text>
          </TouchableOpacity>
        )}

        {loyaltyData && (
          <View
            style={[styles.loyaltyCard, { backgroundColor: theme.cardColor }]}
          >
            <Text style={[styles.loyaltyTitle, { color: theme.primaryText }]}>
              {t('myPoints')}: {loyaltyData.currentPoints} {t('of')}{' '}
              {loyaltyData.maxPoints}
            </Text>

            <View
              style={[
                styles.progressBarContainer,
                { backgroundColor: theme.borderColor },
              ]}
            >
              <View
                style={[
                  styles.progressBar,
                  {
                    backgroundColor: theme.brandColor,
                    width: `${
                      loyaltyData.maxPoints > 0
                        ? Math.min(
                            100,
                            Math.round(
                              (loyaltyData.currentPoints /
                                loyaltyData.maxPoints) *
                                100
                            )
                          )
                        : 0
                    }%`,
                  },
                ]}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.freeCardButton,
                {
                  backgroundColor:
                    loyaltyData.currentPoints >= loyaltyData.maxPoints
                      ? theme.brandColor
                      : theme.borderColor,
                  opacity:
                    loyaltyData.currentPoints >= loyaltyData.maxPoints
                      ? 1
                      : 0.5,
                },
              ]}
              onPress={handleUseFreeCard}
              disabled={
                loyaltyData.currentPoints < loyaltyData.maxPoints || loading
              }
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text
                  style={[
                    styles.freeCardButtonText,
                    {
                      color:
                        loyaltyData.currentPoints >= loyaltyData.maxPoints
                          ? '#fff'
                          : theme.lightText,
                    },
                  ]}
                >
                  {t('useFreeCard')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.cardColor }]}
            onPress={handlePaymentMethods}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons
                name="card-outline"
                size={24}
                color={theme.primaryText}
              />
              <View style={styles.menuItemTextContainer}>
                <Text
                  style={[styles.menuItemTitle, { color: theme.primaryText }]}
                >
                  {t('paymentMethods')}
                </Text>
                <Text
                  style={[
                    styles.menuItemSubtitle,
                    { color: theme.secondaryText },
                  ]}
                >
                  {t('addCreditCard')}
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
            style={[styles.menuItem, { backgroundColor: theme.cardColor }]}
            onPress={handleSavedLocations}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons
                name="location-outline"
                size={24}
                color={theme.primaryText}
              />
              <View style={styles.menuItemTextContainer}>
                <Text
                  style={[styles.menuItemTitle, { color: theme.primaryText }]}
                >
                  {t('savedLocations')}
                </Text>
                <Text
                  style={[
                    styles.menuItemSubtitle,
                    { color: theme.secondaryText },
                  ]}
                >
                  {t('pointsInPark')}
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
            style={[styles.menuItem, { backgroundColor: theme.cardColor }]}
            onPress={handleSettings}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons
                name="settings-outline"
                size={24}
                color={theme.primaryText}
              />
              <View style={styles.menuItemTextContainer}>
                <Text
                  style={[styles.menuItemTitle, { color: theme.primaryText }]}
                >
                  {t('settings')}
                </Text>
                <Text
                  style={[
                    styles.menuItemSubtitle,
                    { color: theme.secondaryText },
                  ]}
                >
                  {t('notificationsLangTheme')}
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
            style={[
              styles.menuItem,
              { backgroundColor: theme.cardColor, marginTop: 8 },
            ]}
            onPress={handleLogout}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="log-out-outline" size={24} color="#ff4444" />
              <View style={styles.menuItemTextContainer}>
                <Text style={[styles.menuItemTitle, { color: '#ff4444' }]}>
                  {t('logout') || 'Выйти'}
                </Text>
                <Text
                  style={[
                    styles.menuItemSubtitle,
                    { color: theme.secondaryText },
                  ]}
                >
                  {t('logoutFromAccount') || 'Выйти из аккаунта'}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ff4444" />
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
    paddingVertical: SIZES.paddingSmall * 2, 
    borderBottomWidth: SIZES.borderWidth,
  },
  backButton: {
    padding: SIZES.paddingSmall - 2, 
  },
  headerTitle: {
    fontSize: SIZES.fontLarge,
    fontWeight: FONT_WEIGHT.semiBold,
  },
  placeholder: {
    width: SIZES.iconLarge + 8, 
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
  },
  loadingText: {
    marginTop: SIZES.marginLarge - 4, 
    fontSize: SIZES.fontMedium,
    textAlign: 'center',
  },
  userInfoCard: {
    borderRadius: SIZES.radius,
    padding: SIZES.paddingLarge,
    marginTop: SIZES.marginLarge - 4, 
    marginBottom: SIZES.marginLarge - 4,
  shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: SIZES.elevation,
  },
  userName: {
    fontSize: SIZES.fontXL,
    fontWeight: FONT_WEIGHT.semiBold,
    marginBottom: SIZES.margin,
    textAlign: 'center',
  },
  userLogin: {
    fontSize: SIZES.fontMedium,
    marginBottom: SIZES.marginSmall,
    textAlign: 'center',
  },
  greeting: {
    fontSize: SIZES.fontLarge,
    fontWeight: FONT_WEIGHT.semiBold,
    marginBottom: SIZES.marginSmall,
    textAlign: 'center',
  },
  userPhone: {
    fontSize: SIZES.fontMedium,
    textAlign: 'center',
  },
  progressBarContainer: {
    height: SIZES.borderWidthThick * 4,
    borderRadius: SIZES.smallRadius,
    marginVertical: SIZES.marginLarge - 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: SIZES.smallRadius,
  },
  loyaltyCard: {
    borderRadius: SIZES.radius,
    padding: SIZES.paddingLarge,
    marginTop: SIZES.marginLarge - 4,
    marginBottom: SIZES.marginLarge,
  shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loyaltyTitle: {
    fontSize: SIZES.fontLarge,
    fontWeight: FONT_WEIGHT.semiBold,
    marginBottom: SIZES.marginLarge,
    textAlign: 'center',
  },
  freeCardButton: {
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  freeCardButtonText: {
    fontSize: SIZES.fontMedium,
    fontWeight: FONT_WEIGHT.semiBold,
  },
  menuContainer: {
    borderRadius: SIZES.radius,
    overflow: 'hidden',
  shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    borderBottomWidth: SIZES.borderWidth,
  borderBottomColor: colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemTextContainer: {
    marginLeft: SIZES.marginSmall * 3,
    flex: 1,
  },
  menuItemTitle: {
    fontSize: SIZES.fontMedium,
    fontWeight: FONT_WEIGHT.medium,
  color: colors.black,
    marginBottom: SIZES.marginSmall,
  },
  menuItemSubtitle: {
    fontSize: SIZES.fontSmall,
  color: colors.textLight,
  },
});

export default ProfileScreen;
