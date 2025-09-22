/**
 * Экран регистрации нового пользователя (Sign Up Screen).
 * Позволяет создать новый аккаунт в приложении.
 * 
 * Основной функционал:
 * - Форма регистрации с полями логина, пароля и подтверждения пароля
 * - Валидация введенных данных (совпадение паролей, уникальность логина)
 * - Показ/скрытие паролей
 * - Создание нового пользователя через API
 * - Автоматическая инициализация программы лояльности
 * - Индикатор загрузки и обработка ошибок
 * - Автоматический вход после регистрации
 * - Поддержка темизации и локализации
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../themes/colors';
import { SIZES } from '../constants/sizes';
import { FONT_WEIGHT } from '../constants/fontWeight';
import { useSelector, useDispatch } from 'react-redux';
import { selectT } from '../store/appSlice';
import { loginSuccess } from '../store/userSlice';
import { setUserId } from '../store/userIdSlice';
import { userApi, loyaltyApi } from '../services/apiService';

const SignUpScreen = ({ navigation }) => {
  const [userId, setUserIdInput] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const t = useSelector(selectT);
  const dispatch = useDispatch();

  const handleSignUp = async () => {
    if (!userId || !password || !confirmPassword) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(t('error'), t('passwordsDontMatch') || 'Пароли не совпадают');
      return;
    }
    setIsLoading(true);
    try {
      const userRes = await userApi.createUser({
        userId,
        password,
      });
      if (userRes.status !== 'success' || !userRes.data) {
        setIsLoading(false);
        Alert.alert(
          t('error'),
          t('registrationFailed') || 'Ошибка регистрации'
        );
        return;
      }


      const loyaltyRes = await loyaltyApi.updateLoyaltyPoints(userId, 0);


      dispatch(loginSuccess({ userId, password }));
      dispatch(setUserId(userId));
      setIsLoading(false);
      navigation.replace('Profile');
    } catch (err) {
      setIsLoading(false);
      Alert.alert(t('error'), t('registrationFailed') || 'Ошибка регистрации');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons
              name="tree"
              size={60}
              color={colors.primary}
            />
          </View>
          <Text style={styles.title}>{t('signUpWelcome')}</Text>
          <Text style={styles.subtitle}>{t('signUpToAccount')}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons
              name="person-outline"
              size={20}
              color={colors.primary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder={t('login')}
              value={userId}
              onChangeText={setUserIdInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={colors.primary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder={t('password')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={colors.primary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder={t('confirmPassword')}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={true}
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[styles.signUpButton, isLoading && styles.disabledButton]}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <Text style={styles.buttonText}>{t('signingUp')}</Text>
            ) : (
              <Text style={styles.buttonText}>{t('signUp')}</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('alreadyHaveAccount')}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.loginLink}>{t('login')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SIZES.paddingLarge,
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES.marginLarge * 2, 
  },
  logoContainer: {
    width: SIZES.image,
    height: SIZES.image,
    borderRadius: SIZES.image / 2,
  backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.marginLarge,
    elevation: 3,
  },
  title: {
    fontSize: SIZES.fontXL,
    fontWeight: FONT_WEIGHT.bold,
  color: colors.black,
    marginBottom: SIZES.marginSmall * 2,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: SIZES.fontMedium,
  color: colors.textLight,
  },
  form: {
  backgroundColor: colors.white,
    borderRadius: SIZES.radius + 4, 
    padding: SIZES.paddingLarge,
    elevation: 2,
  shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: SIZES.borderWidth,
  borderColor: colors.primary,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.margin + 3,
    paddingHorizontal: SIZES.padding - 1,
  backgroundColor: colors.white,
  },
  inputIcon: {
    marginRight: SIZES.margin,
  },
  input: {
    flex: 1,
    height: SIZES.image * 0.625,
    fontSize: SIZES.fontMedium,
  color: colors.text,
  },
  signUpButton: {
  backgroundColor: colors.primary,
    borderRadius: SIZES.radius,
    height: SIZES.image * 0.625,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.marginLarge,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
  color: colors.white,
    fontSize: SIZES.fontMedium,
    fontWeight: FONT_WEIGHT.semiBold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SIZES.image * 0.375,
  },
  footerText: {
  color: colors.textLight,
    fontSize: SIZES.fontSmall + 2,
  },
  loginLink: {
  color: colors.primary,
    fontSize: SIZES.fontSmall + 2,
    fontWeight: FONT_WEIGHT.semiBold,
    marginLeft: SIZES.marginSmall * 2,
  },
});

export default SignUpScreen;
