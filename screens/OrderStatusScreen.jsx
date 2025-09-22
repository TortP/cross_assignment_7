/**
 * Экран статуса заказов (Order Status Screen).
 * Отображает информацию о текущих и завершенных заказах пользователя.
 * 
 * Основной функционал:
 * - Вкладки для текущих и завершенных заказов
 * - Детальная информация по каждому заказу
 * - Отслеживание статуса доставки в реальном времени
 * - Интерактивная карта с местоположением курьера
 * - Функция повтора заказа
 * - Pull-to-refresh для обновления данных
 * - Расчет времени доставки и отображение прогресса
 */
import React, { useEffect } from 'react';
import { useRepeatOrder } from '../hooks/useRepeatOrder';
import { useSelector, useDispatch } from 'react-redux';
import { selectT } from '../store/appSlice';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../themes/colors';
import { FONT_WEIGHT } from '../constants/fontWeight';
import { SIZES } from '../constants/sizes';

import {
  loadOrdersData,
  updateCurrentOrderStatus,
  setActiveTab,
  setRefreshing,
} from '../store/orderStatusSlice';
import MapComponent from '../components/MapComponent';

const OrderStatusScreen = ({ navigation, route, onAddToCart }) => {
  const theme = useSelector((state) => state.theme.theme);
  const userId = useSelector((state) => state.userId.value);
  const {
    activeTab,
    currentOrder,
    previousOrders,
    loading,
    refreshing,
    error,
  } = useSelector((state) => state.orderStatus);
  const t = useSelector(selectT);
  const { orderNumber } = route?.params || {};

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadOrdersData({ userId, orderNumber }));
  }, [activeTab, userId, orderNumber, dispatch]);

  useEffect(() => {
    dispatch(loadOrdersData({ userId, orderNumber }));

    const pollInterval = setInterval(() => {
      if (activeTab === 'current' && currentOrder) {
        dispatch(
          updateCurrentOrderStatus({ userId, currentOrderId: currentOrder.id })
        );
      }
    }, 30000);
    return () => clearInterval(pollInterval);
  }, [activeTab, userId, orderNumber]);

  const handleRefresh = async () => {
    dispatch(setRefreshing(true));
    await dispatch(loadOrdersData({ userId, orderNumber }));
    dispatch(setRefreshing(false));
  };

  const handleCallCourier = () => {
    if (currentOrder?.courierInfo?.phone) {
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleTabPress = (tabId) => {
    dispatch(setActiveTab(tabId));
    dispatch(loadOrdersData({ userId, orderNumber }));
  };

  const onRepeatOrder = useRepeatOrder();

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return 'checkmark';
      case 'preparing':
        return 'checkmark';
      case 'courier_on_way':
        return 'checkmark';
      case 'delivered':
        return 'checkmark';
      default:
        return 'time-outline';
    }
  };

  const getStatusColor = (status, isActive = false) => {
    if (isActive) {
      return status === 'courier_on_way' ? '#FF9800' : theme.brandColor;
    }
    return theme.brandColor;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
    });
  };

  if (loading) {
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
            {t('orders')}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.brandColor} />
          <Text style={[styles.loadingText, { color: theme.primaryText }]}>
            {t('loading')}...
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
          {t('orders')}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View
        style={[
          styles.tabsContainer,
          { backgroundColor: theme.backgroundColor },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'current' && { backgroundColor: theme.brandColor },
          ]}
          onPress={() => handleTabPress('current')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'current' ? '#fff' : theme.primaryText },
            ]}
          >
            {t('currentOrder')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'previous' && { backgroundColor: theme.brandColor },
          ]}
          onPress={() => handleTabPress('previous')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'previous' ? '#fff' : theme.primaryText },
            ]}
          >
            {t('previousOrders')}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'current' ? (
          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[theme.brandColor]}
                tintColor={theme.brandColor}
              />
            }
          >
            {currentOrder ? (
              <>
                <Text style={[styles.orderTitle, { color: theme.primaryText }]}>
                  {t('orderNumber')} {currentOrder.orderNumber}
                </Text>

                <View
                  style={[
                    styles.statusContainer,
                    { backgroundColor: theme.backgroundColor },
                  ]}
                >
                  {currentOrder.statusHistory?.map((statusItem, index) => (
                    <React.Fragment key={statusItem.status}>
                      <View style={styles.statusItem}>
                        <View
                          style={[
                            styles.statusIconContainer,
                            {
                              backgroundColor: getStatusColor(
                                statusItem.status,
                                statusItem.status === currentOrder.currentStatus
                              ),
                            },
                          ]}
                        >
                          {statusItem.status === currentOrder.currentStatus &&
                          statusItem.status === 'courier_on_way' ? (
                            <Text
                              style={[
                                styles.activeStatusText,
                                { color: '#fff' },
                              ]}
                            >
                              <Ionicons
                                name="checkmark"
                                size={16}
                                color="#fff"
                              />
                            </Text>
                          ) : (
                            <Ionicons name="checkmark" size={16} color="#fff" />
                          )}
                        </View>
                        <Text
                          style={[
                            styles.statusText,
                            { color: theme.primaryText },
                            statusItem.status === currentOrder.currentStatus &&
                              styles.activeStatusText,
                          ]}
                        >
                          {t(statusItem.status)}
                        </Text>
                      </View>

                      {index < currentOrder.statusHistory.length - 1 && (
                        <View
                          style={[
                            styles.statusLine,
                            { backgroundColor: theme.brandColor },
                          ]}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </View>

                <View style={styles.mapContainer}>
                  <MapComponent />
                </View>

                {currentOrder.courierInfo && (
                  <View
                    style={[
                      styles.courierInfo,
                      { backgroundColor: theme.cardColor },
                    ]}
                  >
                    <Text
                      style={[
                        styles.courierTitle,
                        { color: theme.primaryText },
                      ]}
                    >
                      {t('courierNearby')}
                    </Text>
                    <Text
                      style={[
                        styles.courierName,
                        { color: theme.secondaryText },
                      ]}
                    >
                      {currentOrder.courierInfo.name} • ⭐{' '}
                      {currentOrder.courierInfo.rating}
                    </Text>
                  </View>
                )}

                {currentOrder.courierInfo?.phone && (
                  <TouchableOpacity
                    style={[
                      styles.callButton,
                      { backgroundColor: theme.brandColor },
                    ]}
                    onPress={handleCallCourier}
                  >
                    <Text style={styles.callButtonText}>
                      {t('callCourier')}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <View style={styles.noOrderContainer}>
                <Ionicons
                  name="receipt-outline"
                  size={64}
                  color={theme.secondaryText}
                />
                <Text
                  style={[styles.noOrderText, { color: theme.primaryText }]}
                >
                  {t('noCurrentOrders')}
                </Text>
                <Text
                  style={[
                    styles.noOrderSubtext,
                    { color: theme.secondaryText },
                  ]}
                >
                  {t('noCurrentOrdersSubtext')}
                </Text>
              </View>
            )}
          </ScrollView>
        ) : (
          <FlatList
            data={previousOrders}
            keyExtractor={(item, idx) =>
              item?.id ? item.id.toString() : String(idx)
            }
            style={styles.ordersList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[theme.brandColor]}
                tintColor={theme.brandColor}
              />
            }
            ListEmptyComponent={() => (
              <View style={styles.emptyStateContainer}>
                <Ionicons
                  name="receipt-outline"
                  size={80}
                  color={theme.lightText}
                  style={styles.emptyStateIcon}
                />
                <Text
                  style={[styles.emptyStateTitle, { color: theme.primaryText }]}
                >
                  {t('noPreviousOrders')}
                </Text>
                <Text
                  style={[
                    styles.emptyStateSubtitle,
                    { color: theme.secondaryText },
                  ]}
                >
                  {t('noPreviousOrdersSubtext')}
                </Text>
              </View>
            )}
            renderItem={({ item }) => (
              <View
                style={[styles.orderCard, { backgroundColor: theme.cardColor }]}
              >
                <View style={styles.orderHeader}>
                  <Text
                    style={[styles.orderNumber, { color: theme.primaryText }]}
                  >
                    {item.orderNumber}
                  </Text>
                  <Text
                    style={[styles.orderDate, { color: theme.secondaryText }]}
                  >
                    {formatDate(item.createdAt)}
                  </Text>
                </View>
                <View style={styles.orderItems}>
                  {item.items.map((orderItem, index) => (
                    <Text
                      key={index}
                      style={[styles.orderItem, { color: theme.secondaryText }]}
                    >
                      {orderItem.name} x{orderItem.quantity}
                    </Text>
                  ))}
                </View>
                <View style={styles.orderFooter}>
                  <View>
                    <Text
                      style={[styles.orderStatus, { color: theme.brandColor }]}
                    >
                      {t('delivered')}
                    </Text>
                    <Text
                      style={[styles.orderTotal, { color: theme.primaryText }]}
                    >
                      {t('total')}: {item.totalAmount}₴
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.repeatButton,
                      { backgroundColor: theme.brandColor },
                    ]}
                    onPress={() => onRepeatOrder(item)}
                  >
                    <Text style={styles.repeatButtonText}>{t('repeat')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.paddingSmall * 2, 
    borderBottomWidth: SIZES.borderWidth,
  borderBottomColor: colors.border,
  },
  backButton: {
    padding: SIZES.paddingSmall,
  },
  headerTitle: {
    fontSize: SIZES.fontLarge,
    fontWeight: FONT_WEIGHT.semiBold,
  color: colors.black,
  },
  placeholder: {
    width: SIZES.iconLarge * 1.5,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: SIZES.paddingLarge,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
  borderBottomColor: colors.secondary,
  },
  tabText: {
    fontSize: SIZES.fontMedium,
  color: colors.textLight,
  },
  activeTabText: {
  color: colors.secondary,
    fontWeight: FONT_WEIGHT.semiBold,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  orderTitle: {
    fontSize: SIZES.fontLarge,
    fontWeight: FONT_WEIGHT.semiBold,
  color: colors.black,
    textAlign: 'center',
    paddingVertical: SIZES.paddingLarge,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.paddingLarge,
    paddingVertical: SIZES.paddingLarge,
  },
  statusItem: {
    alignItems: 'center',
    flex: 1,
  },
  statusIconContainer: {
    width: SIZES.iconLarge,
    height: SIZES.iconLarge,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.marginSmall * 2,
  },
  statusText: {
    fontSize: 12,
    textAlign: 'center',
  },
  activeStatusText: {
    fontWeight: '600',
  },
  statusLine: {
    height: SIZES.borderWidthThick,
    flex: 1,
    marginHorizontal: SIZES.margin,
    marginBottom: SIZES.margin,
  },
  mapContainer: {
    height: SIZES.image * 2.5,
    margin: SIZES.padding,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
  backgroundColor: colors.background,
  },
  courierInfo: {
    paddingHorizontal: SIZES.paddingLarge,
    paddingVertical: SIZES.padding,
    marginHorizontal: SIZES.paddingLarge,
    marginBottom: SIZES.padding,
    borderRadius: SIZES.radius,
  },
  courierTitle: {
    fontSize: SIZES.fontMedium,
    fontWeight: FONT_WEIGHT.semiBold,
    marginBottom: SIZES.marginSmall,
  },
  courierName: {
    fontSize: SIZES.fontSmall,
  },
  callButton: {
    marginHorizontal: SIZES.marginLarge,
    marginBottom: SIZES.marginSmall * 2 + 2,
    paddingVertical: SIZES.paddingLarge,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  callButtonText: {
  color: colors.white,
    fontSize: SIZES.fontMedium,
    fontWeight: FONT_WEIGHT.semiBold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.paddingLarge,
  },
  loadingText: {
    marginTop: SIZES.marginLarge - 4,
    fontSize: SIZES.fontMedium,
    fontWeight: FONT_WEIGHT.medium,
  },
  noOrderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.paddingLarge * 2,
    paddingVertical: SIZES.paddingLarge * 3,
  },
  noOrderText: {
    fontSize: SIZES.fontLarge,
    fontWeight: FONT_WEIGHT.semiBold,
    marginTop: SIZES.marginLarge - 4,
    marginBottom: SIZES.margin,
    textAlign: 'center',
  },
  noOrderSubtext: {
    fontSize: SIZES.fontSmall,
    textAlign: 'center',
  },
  ordersList: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
  },
  orderCard: {
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginVertical: SIZES.marginSmall * 2,
  shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.margin,
  },
  orderNumber: {
    fontSize: SIZES.fontMedium,
    fontWeight: FONT_WEIGHT.semiBold,
  },
  orderDate: {
    fontSize: SIZES.fontSmall,
  },
  orderItems: {
    marginBottom: SIZES.margin,
  },
  orderItem: {
    fontSize: SIZES.fontSmall,
    marginBottom: SIZES.marginSmall,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderStatus: {
    fontSize: SIZES.fontSmall,
    fontWeight: FONT_WEIGHT.semiBold,
  },
  orderTotal: {
    fontSize: SIZES.fontMedium,
    fontWeight: FONT_WEIGHT.semiBold,
    marginTop: SIZES.marginSmall,
  },
  repeatButton: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.paddingSmall,
    borderRadius: SIZES.radius,
  },
  repeatButtonText: {
  color: colors.white,
    fontSize: SIZES.fontSmall,
    fontWeight: FONT_WEIGHT.semiBold,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.paddingLarge * 2,
    paddingVertical: SIZES.paddingLarge * 3,
  },
  emptyStateIcon: {
    width: SIZES.image,
    height: SIZES.image,
    borderRadius: SIZES.image / 2,
  backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.marginLarge + 4,
  },
  emptyStateTitle: {
    fontSize: SIZES.fontXL,
    fontWeight: FONT_WEIGHT.semiBold,
    textAlign: 'center',
    marginBottom: SIZES.marginLarge - 8,
  },
  emptyStateSubtitle: {
    fontSize: SIZES.fontMedium,
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default OrderStatusScreen;
