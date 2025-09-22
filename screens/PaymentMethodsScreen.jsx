/**
 * Экран управления способами оплаты (Payment Methods Screen).
 * Позволяет пользователю добавлять, редактировать и удалять платежные методы.
 * 
 * Основной функционал:
 * - Отображение списка сохраненных способов оплаты
 * - Добавление новых карт
 * - Редактирование существующих платежных методов
 * - Удаление способов оплаты 
 * - Валидация данных карт (номер, срок действия, CVV)
 * - Pull-to-refresh и состояния загрузки
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../themes/colors';
import { FONT_WEIGHT } from '../constants/fontWeight';
import { SIZES } from '../constants/sizes';
import apiService from '../services/apiService';
import { useSelector, useDispatch } from 'react-redux';
import { selectT } from '../store/appSlice';
import {
  fetchPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
} from '../store/paymentMethodsSlice';

const PaymentMethodsScreen = ({ navigation, onNavigate }) => {
  const theme = useSelector((state) => state.theme.theme);
  const t = useSelector(selectT);
  const dispatch = useDispatch();
  const paymentMethods = useSelector((state) => state.paymentMethods.items);
  const loading = useSelector((state) => state.paymentMethods.loading);
  const error = useSelector((state) => state.paymentMethods.error);
  const [refreshing, setRefreshing] = useState(false);

  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [newCardForm, setNewCardForm] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    holderName: '',
    cvv: '',
  });
  const [addingCard, setAddingCard] = useState(false);

  const userId = useSelector((state) => state.userId.value);
  useEffect(() => {
    if (userId) {
      dispatch(fetchPaymentMethods(userId));
    }
  }, [dispatch, userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (userId) {
      await dispatch(fetchPaymentMethods(userId));
    }
    setRefreshing(false);
  };

  const handleGoBack = () => {
    if (navigation?.goBack) {
      navigation.goBack();
    } else if (onNavigate) {
      onNavigate('profile');
    }
  };

  const handleAddCard = () => {
    setShowAddCardModal(true);
  };

  const resetForm = () => {
    setNewCardForm({
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      holderName: '',
      cvv: '',
    });
    setEditingCard(null);
  };

  const closeAddCardModal = () => {
    setShowAddCardModal(false);
    resetForm();
  };

  const formatCardNumber = (text) => {
    const digits = text.replace(/\D/g, '');
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.slice(0, 19);
  };

  const formatExpiry = (text, type) => {
    const digits = text.replace(/\D/g, '');
    if (type === 'month') {
      return digits.slice(0, 2);
    } else if (type === 'year') {
      return digits.slice(0, 4);
    }
    return digits;
  };

  const getCardBrand = (cardNumber) => {
    const digits = cardNumber.replace(/\s/g, '');
    if (digits.startsWith('4')) return 'visa';
    if (digits.startsWith('5') || digits.startsWith('2')) return 'mastercard';
    return 'unknown';
  };

  const validateCard = () => {
    if (newCardForm.cardNumber.replace(/\s/g, '').length < 16) {
      Alert.alert(t('error'), 'Номер карты должен содержать 16 цифр');
      return false;
    }
    if (!newCardForm.expiryMonth || !newCardForm.expiryYear) {
      Alert.alert(t('error'), 'Укажите срок действия карты');
      return false;
    }
    if (
      parseInt(newCardForm.expiryMonth) < 1 ||
      parseInt(newCardForm.expiryMonth) > 12
    ) {
      Alert.alert(t('error'), 'Неверный месяц');
      return false;
    }
    if (parseInt(newCardForm.expiryYear) < new Date().getFullYear()) {
      Alert.alert(t('error'), 'Карта просрочена');
      return false;
    }
    if (!newCardForm.holderName.trim()) {
      Alert.alert(t('error'), 'Введите имя держателя карты');
      return false;
    }
    if (newCardForm.cvv.length < 3) {
      Alert.alert(t('error'), 'CVV должен содержать 3-4 цифры');
      return false;
    }
    return true;
  };

  const handleSaveCard = async () => {
    if (!validateCard()) return;
    setAddingCard(true);
    try {
      if (!userId || userId === 'default') {
        Alert.alert(
          t('error'),
          'Ошибка: пользователь не авторизован. Пожалуйста, войдите в аккаунт.'
        );
        return;
      }
      const cardData = {
        type: 'card',
        brand: getCardBrand(newCardForm.cardNumber),
        last4: newCardForm.cardNumber.slice(-4),
        expiryMonth: parseInt(newCardForm.expiryMonth),
        expiryYear: parseInt(newCardForm.expiryYear),
        holderName: newCardForm.holderName.toUpperCase(),
        isDefault: editingCard
          ? editingCard.isDefault
          : paymentMethods.length === 0,
      };
      if (editingCard) {
        await dispatch(updatePaymentMethod({ id: editingCard.id, cardData }));
        closeAddCardModal();
        Alert.alert(t('success'), 'Карта успешно обновлена');
      } else {
        await dispatch(createPaymentMethod(cardData));
        closeAddCardModal();
        Alert.alert(t('success'), 'Карта успешно добавлена');
      }
    } catch (err) {
      Alert.alert(
        t('error'),
        err.message ||
          (editingCard
            ? 'Ошибка при обновлении карты'
            : 'Ошибка при добавлении карты')
      );
    } finally {
      setAddingCard(false);
    }
  };

  const handleEditCard = (card) => {
    setNewCardForm({
      cardNumber: `**** **** **** ${card.last4}`,
      expiryMonth: String(card.expiryMonth).padStart(2, '0'),
      expiryYear: String(card.expiryYear),
      holderName: card.holderName,
      cvv: '***',
    });
    setEditingCard(card);
    setShowAddCardModal(true);
  };


  const showSuccessAlert = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message, [{ text: t('ok'), onPress: () => {} }]);
    }
  };

  const showErrorAlert = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message, [{ text: t('ok'), onPress: () => {} }]);
    }
  };

  const handleDeleteCard = async (card) => {
    try {
      if (!userId || userId === 'default') {
        showErrorAlert(
          t('error'),
          'Ошибка: пользователь не авторизован. Пожалуйста, войдите в аккаунт.'
        );
        return;
      }
      await dispatch(deletePaymentMethod(card.id));
      showSuccessAlert(t('success'), t('cardDeleted'));
    } catch (err) {
      showErrorAlert(t('error'), t('deleteCardError'));
    }
  };

  const getCardIcon = (brand) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return 'card-outline';
      case 'mastercard':
        return 'card-outline';
      case 'amex':
        return 'card-outline';
      default:
        return 'card-outline';
    }
  };

  const getCardBrandName = (brand) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return 'Visa';
      case 'mastercard':
        return 'Mastercard';
      case 'amex':
        return 'American Express';
      default:
        return t('card');
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
          {t('paymentMethods')}
        </Text>
        <TouchableOpacity onPress={handleAddCard} style={styles.addButton}>
          <Ionicons name="add" size={24} color={theme.brandColor} />
        </TouchableOpacity>
      </View>

      {loading && paymentMethods.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.brandColor} />
          <Text style={[styles.loadingText, { color: theme.primaryText }]}>
            {t('loadingPaymentMethods')}
          </Text>
        </View>
      ) : (
        /* Content */
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
          <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
            {t('savedCards')}
          </Text>

          {paymentMethods.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="card-outline"
                size={48}
                color={theme.lightText}
                style={styles.emptyIcon}
              />
              <Text style={[styles.emptyTitle, { color: theme.primaryText }]}>
                {t('noPaymentMethods')}
              </Text>
              <Text
                style={[styles.emptySubtitle, { color: theme.secondaryText }]}
              >
                {t('addCardHint')}
              </Text>
            </View>
          ) : (
            paymentMethods.map((card) => (
              <View
                key={card.id}
                style={[
                  styles.cardContainer,
                  { backgroundColor: theme.cardColor },
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardLeft}>
                    <Ionicons
                      name={getCardIcon(card.brand)}
                      size={24}
                      color={theme.brandColor}
                    />
                    <View style={styles.cardInfo}>
                      <Text
                        style={[styles.cardBrand, { color: theme.primaryText }]}
                      >
                        {getCardBrandName(card.brand)}
                      </Text>
                      <Text
                        style={[
                          styles.cardNumber,
                          { color: theme.secondaryText },
                        ]}
                      >
                        •••• •••• •••• {card.last4}
                      </Text>
                      <Text
                        style={[
                          styles.cardExpiry,
                          { color: theme.secondaryText },
                        ]}
                      >
                        {String(card.expiryMonth).padStart(2, '0')}/
                        {card.expiryYear}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { borderColor: theme.borderColor },
                    ]}
                    onPress={() => handleEditCard(card)}
                  >
                    <Ionicons
                      name="pencil-outline"
                      size={16}
                      color={theme.primaryText}
                    />
                    <Text
                      style={[
                        styles.actionButtonText,
                        { color: theme.primaryText },
                      ]}
                    >
                      {t('edit')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { borderColor: theme.errorColor || '#ff4444' },
                    ]}
                    onPress={() => handleDeleteCard(card)}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator
                        size="small"
                        color={theme.errorColor || '#ff4444'}
                      />
                    ) : (
                      <>
                        <Ionicons
                          name="trash-outline"
                          size={16}
                          color={theme.errorColor || '#ff4444'}
                        />
                        <Text
                          style={[
                            styles.actionButtonText,
                            { color: theme.errorColor || '#ff4444' },
                          ]}
                        >
                          {t('delete')}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          <TouchableOpacity
            style={[styles.addCardButton, { borderColor: theme.borderColor }]}
            onPress={handleAddCard}
          >
            <Ionicons
              name="add-circle-outline"
              size={24}
              color={theme.brandColor}
            />
            <Text style={[styles.addCardText, { color: theme.brandColor }]}>
              {t('addNewCard')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <Modal
        visible={showAddCardModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeAddCardModal}
      >
        <SafeAreaView
          style={[
            styles.modalContainer,
            { backgroundColor: theme.backgroundColor },
          ]}
        >
          <View
            style={[
              styles.modalHeader,
              { borderBottomColor: theme.borderColor },
            ]}
          >
            <TouchableOpacity onPress={closeAddCardModal}>
              <Ionicons name="close" size={24} color={theme.primaryText} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.primaryText }]}>
              {editingCard ? 'Редактировать карту' : 'Добавить карту'}
            </Text>
            <TouchableOpacity onPress={handleSaveCard} disabled={addingCard}>
              {addingCard ? (
                <ActivityIndicator size="small" color={theme.brandColor} />
              ) : (
                <Text style={[styles.saveButton, { color: theme.brandColor }]}>
                  Сохранить
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.primaryText }]}>
                Номер карты
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: theme.borderColor,
                    color: theme.primaryText,
                    backgroundColor: theme.backgroundColor,
                  },
                ]}
                value={newCardForm.cardNumber}
                onChangeText={(text) =>
                  setNewCardForm((prev) => ({
                    ...prev,
                    cardNumber: formatCardNumber(text),
                  }))
                }
                placeholder="0000 0000 0000 0000"
                placeholderTextColor={theme.secondaryText}
                keyboardType="numeric"
                maxLength={19}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={[styles.label, { color: theme.primaryText }]}>
                  Месяц
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: theme.borderColor,
                      color: theme.primaryText,
                      backgroundColor: theme.backgroundColor,
                    },
                  ]}
                  value={newCardForm.expiryMonth}
                  onChangeText={(text) =>
                    setNewCardForm((prev) => ({
                      ...prev,
                      expiryMonth: formatExpiry(text, 'month'),
                    }))
                  }
                  placeholder="MM"
                  placeholderTextColor={theme.secondaryText}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>

              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={[styles.label, { color: theme.primaryText }]}>
                  Год
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: theme.borderColor,
                      color: theme.primaryText,
                      backgroundColor: theme.backgroundColor,
                    },
                  ]}
                  value={newCardForm.expiryYear}
                  onChangeText={(text) =>
                    setNewCardForm((prev) => ({
                      ...prev,
                      expiryYear: formatExpiry(text, 'year'),
                    }))
                  }
                  placeholder="YYYY"
                  placeholderTextColor={theme.secondaryText}
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.primaryText }]}>
                Имя держателя
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: theme.borderColor,
                    color: theme.primaryText,
                    backgroundColor: theme.backgroundColor,
                  },
                ]}
                value={newCardForm.holderName}
                onChangeText={(text) =>
                  setNewCardForm((prev) => ({
                    ...prev,
                    holderName: text.toUpperCase(),
                  }))
                }
                placeholder="CARDHOLDER NAME"
                placeholderTextColor={theme.secondaryText}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.primaryText }]}>
                CVV
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: theme.borderColor,
                    color: theme.primaryText,
                    backgroundColor: theme.backgroundColor,
                  },
                ]}
                value={newCardForm.cvv}
                onChangeText={(text) =>
                  setNewCardForm((prev) => ({
                    ...prev,
                    cvv: text.replace(/\D/g, '').slice(0, 4),
                  }))
                }
                placeholder="123"
                placeholderTextColor={theme.secondaryText}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  addButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  cardContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardInfo: {
    marginLeft: SIZES.marginSmall * 3,
    flex: 1,
  },
  cardBrand: {
    fontSize: SIZES.fontMedium,
    fontWeight: FONT_WEIGHT.semiBold,
    marginBottom: SIZES.marginSmall,
  },
  cardNumber: {
    fontSize: SIZES.fontSmall,
    marginBottom: SIZES.marginSmall,
  },
  cardExpiry: {
    fontSize: SIZES.fontSmall,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SIZES.marginSmall,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.paddingSmall,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    gap: SIZES.marginSmall,
  },
  actionButtonText: {
    fontSize: SIZES.fontSmall,
    fontWeight: FONT_WEIGHT.medium,
  },
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.paddingLarge,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: SIZES.radius,
    marginTop: SIZES.marginLarge - 4,
    marginBottom: SIZES.marginLarge,
    gap: SIZES.marginSmall,
  },
  addCardText: {
    fontSize: SIZES.fontMedium,
    fontWeight: FONT_WEIGHT.medium,
  },

  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: SIZES.fontLarge,
    fontWeight: FONT_WEIGHT.semiBold,
  },
  saveButton: {
    fontSize: SIZES.fontMedium,
    fontWeight: FONT_WEIGHT.semiBold,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.paddingLarge,
  },
  formGroup: {
    marginBottom: SIZES.marginLarge,
  },
  label: {
    fontSize: SIZES.fontSmall,
    fontWeight: FONT_WEIGHT.medium,
    marginBottom: SIZES.marginSmall * 2,
  },
  input: {
    borderWidth: 1,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    fontSize: SIZES.fontMedium,
  },
  row: {
    flexDirection: 'row',
    gap: SIZES.marginSmall * 3,
  },
  halfWidth: {
    flex: 1,
  },
});

export default PaymentMethodsScreen;
