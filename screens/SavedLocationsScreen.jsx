/**
 * Экран сохраненных адресов (Saved Locations Screen).
 * Управление адресами доставки пользователя.
 * 
 * Основной функционал:
 * - Отображение списка сохраненных адресов доставки
 * - Добавление новых адресов с выбором на карте
 * - Редактирование существующих адресов
 * - Поддержка локализации и темизации
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
import { useSelector } from 'react-redux';
import apiService, { locationsApi } from '../services/apiService';
import { selectT, selectLanguage } from '../store/appSlice';

const SavedLocationsScreen = ({ navigation, onNavigate }) => {
  const theme = useSelector((state) => state.theme.theme);
  const language = useSelector(selectLanguage);
  const t = useSelector(selectT);
  const userId = useSelector((state) => state.userId.value);
  const [savedLocations, setSavedLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [newLocationForm, setNewLocationForm] = useState({
    name: '',
    nameUa: '',
    nameEn: '',
    description: '',
    descriptionUa: '',
    descriptionEn: '',
    type: 'park',
    coordinates: { lat: 50.4501, lng: 30.5234 },
  });
  const [addingLocation, setAddingLocation] = useState(false);

  useEffect(() => {
    if (userId) {
      loadSavedLocations();
    }
  }, [userId]);

  const loadSavedLocations = async () => {
    try {
      setError(null);
      const response = await locationsApi.getSavedLocations(userId);
      setSavedLocations(response.data);
    } catch (err) {
      setError(err.message);
      Alert.alert(t('error'), t('loadLocationsError'), [
        { text: t('ok'), onPress: () => {} },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSavedLocations();
    setRefreshing(false);
  };

  const handleGoBack = () => {
    if (navigation?.goBack) {
      navigation.goBack();
    } else if (onNavigate) {
      onNavigate('profile');
    }
  };

  const handleAddLocation = () => {
    setShowAddLocationModal(true);
  };

  const resetLocationForm = () => {
    setNewLocationForm({
      name: '',
      nameUa: '',
      nameEn: '',
      description: '',
      descriptionUa: '',
      descriptionEn: '',
      type: 'park',
      coordinates: { lat: 50.4501, lng: 30.5234 },
    });
    setEditingLocation(null);
  };

  const closeAddLocationModal = () => {
    setShowAddLocationModal(false);
    resetLocationForm();
  };

  const validateLocation = () => {
    if (!newLocationForm.name.trim()) {
      Alert.alert(t('error'), 'Введите название локации');
      return false;
    }
    if (!newLocationForm.description.trim()) {
      Alert.alert(t('error'), 'Введите описание локации');
      return false;
    }
    return true;
  };

  const handleSaveLocation = async () => {
    if (!validateLocation()) return;
    if (!userId || userId === 'default') {
      Alert.alert(
        t('error'),
        'Ошибка: пользователь не авторизован. Пожалуйста, войдите в аккаунт.'
      );
      return;
    }
    setAddingLocation(true);
    try {
      const locationData = {
        name: newLocationForm.name,
        nameUa: newLocationForm.nameUa || newLocationForm.name,
        nameEn: newLocationForm.nameEn || newLocationForm.name,
        description: newLocationForm.description,
        descriptionUa:
          newLocationForm.descriptionUa || newLocationForm.description,
        descriptionEn:
          newLocationForm.descriptionEn || newLocationForm.description,
        type: newLocationForm.type,
        coordinates: newLocationForm.coordinates,
        isDefault: editingLocation
          ? editingLocation.isDefault
          : savedLocations.length === 0,
      };

      if (editingLocation) {
        const response = await locationsApi.updateLocation(
          editingLocation.id,
          locationData,
          userId
        );
        if (response.status === 'success') {
          setSavedLocations((prev) =>
            prev.map((location) =>
              location.id === editingLocation.id
                ? { ...location, ...locationData }
                : location
            )
          );
          closeAddLocationModal();
          Alert.alert(t('success'), 'Локация успешно обновлена');
        } else {
          throw new Error(response.message || 'Ошибка при обновлении локации');
        }
      } else {
        const response = await locationsApi.createLocation(
          locationData,
          userId
        );
        if (response.status === 'success') {
          setSavedLocations((prev) => [...prev, response.data]);
          closeAddLocationModal();
          Alert.alert(t('success'), 'Локация успешно добавлена');
        } else {
          throw new Error(response.message || 'Ошибка при добавлении локации');
        }
      }
    } catch (err) {
      Alert.alert(
        t('error'),
        err.message ||
          (editingLocation
            ? 'Ошибка при обновлении локации'
            : 'Ошибка при добавлении локации')
      );
    } finally {
      setAddingLocation(false);
    }
  };
  const showConfirmDialog = (title, message, onConfirm) => {
    if (Platform.OS === 'web') {
      const isConfirmed = window.confirm(`${title}\n\n${message}`);
      if (isConfirmed) {
        onConfirm();
      }
    } else {
      Alert.alert(title, message, [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: onConfirm,
        },
      ]);
    }
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

  const handleDeleteLocation = async (location) => {
    showConfirmDialog(
      t('deleteLocation'),
      t('deleteLocationConfirm'),
      async () => {
        try {
          setLoading(true);
          const response = await locationsApi.deleteLocation(location.id);
          if (response.status === 'success') {
            setSavedLocations((prev) =>
              prev.filter((loc) => loc.id !== location.id)
            );
            showSuccessAlert(t('success'), t('locationDeleted'));
          } else {
            throw new Error(response.message || 'Ошибка при удалении локации');
          }
        } catch (err) {
          showErrorAlert(t('error'), t('deleteLocationError'));
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const getLocationName = (location) => {
    switch (language) {
      case 'ua':
        return location.nameUa || location.name;
      case 'en':
        return location.nameEn || location.name;
      default:
        return location.name;
    }
  };

  const getLocationDescription = (location) => {
    switch (language) {
      case 'ua':
        return location.descriptionUa || location.description;
      case 'en':
        return location.descriptionEn || location.description;
      default:
        return location.description;
    }
  };

  const getLocationIcon = (type) => {
    switch (type) {
      case 'park':
        return 'leaf-outline';
      case 'playground':
        return 'happy-outline';
      case 'sports':
        return 'football-outline';
      default:
        return 'location-outline';
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
          {t('savedLocations')}
        </Text>
        <TouchableOpacity onPress={handleAddLocation} style={styles.addButton}>
          <Ionicons name="add" size={24} color={theme.brandColor} />
        </TouchableOpacity>
      </View>

      {loading && savedLocations.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.brandColor} />
          <Text style={[styles.loadingText, { color: theme.primaryText }]}>
            {t('loadingLocations')}
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
            {t('parkLocations')}
          </Text>

          {savedLocations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="location-outline"
                size={48}
                color={theme.lightText}
                style={styles.emptyIcon}
              />
              <Text style={[styles.emptyTitle, { color: theme.primaryText }]}>
                {t('noSavedLocations')}
              </Text>
              <Text
                style={[styles.emptySubtitle, { color: theme.secondaryText }]}
              >
                {t('addLocationHint')}
              </Text>
            </View>
          ) : (
            savedLocations.map((location) => (
              <View
                key={location.id}
                style={[
                  styles.locationCard,
                  { backgroundColor: theme.cardColor },
                ]}
              >
                <View style={styles.locationHeader}>
                  <View style={styles.locationLeft}>
                    <Ionicons
                      name={getLocationIcon(location.type)}
                      size={24}
                      color={theme.brandColor}
                    />
                    <View style={styles.locationInfo}>
                      <Text
                        style={[
                          styles.locationName,
                          { color: theme.primaryText },
                        ]}
                      >
                        {getLocationName(location)}
                      </Text>
                      <Text
                        style={[
                          styles.locationDescription,
                          { color: theme.secondaryText },
                        ]}
                      >
                        {getLocationDescription(location)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.locationActions}>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { borderColor: theme.borderColor },
                    ]}
                    onPress={() => handleEditLocation(location)}
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
                    onPress={() => handleDeleteLocation(location)}
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
        </ScrollView>
      )}

      <Modal
        visible={showAddLocationModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeAddLocationModal}
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
            <TouchableOpacity onPress={closeAddLocationModal}>
              <Ionicons name="close" size={24} color={theme.primaryText} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.primaryText }]}>
              {editingLocation ? 'Редактировать локацию' : 'Добавить локацию'}
            </Text>
            <TouchableOpacity
              onPress={handleSaveLocation}
              disabled={addingLocation}
            >
              {addingLocation ? (
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
                Название
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
                value={newLocationForm.name}
                onChangeText={(text) =>
                  setNewLocationForm((prev) => ({
                    ...prev,
                    name: text,
                  }))
                }
                placeholder="Центральная аллея"
                placeholderTextColor={theme.secondaryText}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.primaryText }]}>
                Описание
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    borderColor: theme.borderColor,
                    color: theme.primaryText,
                    backgroundColor: theme.backgroundColor,
                  },
                ]}
                value={newLocationForm.description}
                onChangeText={(text) =>
                  setNewLocationForm((prev) => ({
                    ...prev,
                    description: text,
                  }))
                }
                placeholder="Главная аллея парка, возле фонтана"
                placeholderTextColor={theme.secondaryText}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.primaryText }]}>
                Тип локации
              </Text>
              <View style={styles.typeSelector}>
                {['park', 'playground', 'cafe', 'office', 'home'].map(
                  (type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        { borderColor: theme.borderColor },
                        newLocationForm.type === type && {
                          backgroundColor: theme.brandColor,
                          borderColor: theme.brandColor,
                        },
                      ]}
                      onPress={() =>
                        setNewLocationForm((prev) => ({
                          ...prev,
                          type: type,
                        }))
                      }
                    >
                      <Text
                        style={[
                          styles.typeButtonText,
                          { color: theme.primaryText },
                          newLocationForm.type === type && { color: '#fff' },
                        ]}
                      >
                        {type === 'park'
                          ? 'Парк'
                          : type === 'playground'
                          ? 'Площадка'
                          : type === 'cafe'
                          ? 'Кафе'
                          : type === 'office'
                          ? 'Офис'
                          : 'Дом'}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={[styles.label, { color: theme.primaryText }]}>
                  Широта
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
                  value={String(newLocationForm.coordinates.lat)}
                  onChangeText={(text) =>
                    setNewLocationForm((prev) => ({
                      ...prev,
                      coordinates: {
                        ...prev.coordinates,
                        lat: parseFloat(text) || 0,
                      },
                    }))
                  }
                  placeholder="50.4501"
                  placeholderTextColor={theme.secondaryText}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={[styles.label, { color: theme.primaryText }]}>
                  Долгота
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
                  value={String(newLocationForm.coordinates.lng)}
                  onChangeText={(text) =>
                    setNewLocationForm((prev) => ({
                      ...prev,
                      coordinates: {
                        ...prev.coordinates,
                        lng: parseFloat(text) || 0,
                      },
                    }))
                  }
                  placeholder="30.5234"
                  placeholderTextColor={theme.secondaryText}
                  keyboardType="decimal-pad"
                />
              </View>
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
  locationCard: {
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
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationInfo: {
    marginLeft: SIZES.marginSmall * 3,
    flex: 1,
  },
  locationName: {
    fontSize: SIZES.fontMedium,
    fontWeight: FONT_WEIGHT.semiBold,
    marginBottom: SIZES.marginSmall,
  },
  locationDescription: {
    fontSize: SIZES.fontSmall,
  },
  locationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
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
  textArea: {
    height: SIZES.image,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.marginSmall,
  },
  typeButton: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.paddingSmall,
    borderRadius: SIZES.largeRadius,
    borderWidth: 1,
  },
  typeButtonText: {
    fontSize: SIZES.fontSmall,
    fontWeight: FONT_WEIGHT.medium,
  },
  row: {
    flexDirection: 'row',
    gap: SIZES.marginSmall * 3,
  },
  halfWidth: {
    flex: 1,
  },
});

export default SavedLocationsScreen;
