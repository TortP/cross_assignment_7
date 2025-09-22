/**
 * Экран входа в систему (Login Screen).
 * Обеспечивает аутентификацию пользователей в приложении.
 * 
 * Основной функционал:
 * - Форма входа с полями логина и пароля
 * - Валидация введенных данных
 * - Показ/скрытие пароля
 * - Индикатор загрузки во время аутентификации
 * - Обработка ошибок входа
 * - Навигация к экрану регистрации
 * - Автоматическое перенаправление после успешного входа
 * - Поддержка темизации и локализации
 */
import { useEffect } from 'react';
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

import { useSelector, useDispatch } from 'react-redux';
import { selectT } from '../store/appSlice';
import { loginSuccess } from '../store/userSlice';
import { fetchCart } from '../store/cartSlice';
import { colors } from '../themes/colors';
import { SIZES } from '../constants/sizes';
import { FONT_WEIGHT } from '../constants/fontWeight';
import { userApi } from '../services/apiService';

const LoginScreen = ({ navigation }) => {
  const [userId, setUserIdInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const t = useSelector(selectT);
  const dispatch = useDispatch();

  const handleLogin = async () => {
    setErrorMessage('');
    if (!userId || !password) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }
    setIsLoading(true);
    try {
      let response;
      try {
        response = await userApi.login(userId, password);
      } catch (err) {
        throw err;
      }
      if (
        response.status === 'success' &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        const userData = response.data[0];
        dispatch(loginSuccess(userData));

        if (userData.preferences) {
          if (userData.preferences.language) {
            dispatch(
              require('../store/appSlice').setLanguage(
                userData.preferences.language
              )
            );
          }
          if (userData.preferences.theme) {
            const themeValue = userData.preferences.theme;

            if (themeValue === 'dark' || themeValue === 'light') {
              dispatch(require('../store/themeSlice').setTheme(themeValue));
            }
          }
        }
  dispatch(require('../store/userIdSlice').setUserId(userData.userId));
 
  dispatch(fetchCart(userData.userId));
        setIsLoading(false);
      } else if (response.status === 'error') {
        setIsLoading(false);
        if (response.code === 'INVALID_CREDENTIALS') {
          setErrorMessage(
            t('invalidCredentials') || 'Неправильный логин или пароль'
          );
        } else if (response.code === 'USER_NOT_FOUND') {
          setErrorMessage(t('userNotFound') || 'Пользователь не найден');
        } else {
          setErrorMessage(t('loginError') || 'Ошибка входа');
        }
      } else {
        setIsLoading(false);
        setErrorMessage(
          t('invalidCredentials') || 'Неправильный логин или пароль'
        );
      }
    } catch (error) {
      setIsLoading(false);
      setErrorMessage(t('loginError') || 'Ошибка соединения с сервером');
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(t('forgotPasswordTitle'), t('forgotPasswordDesc'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('send'), onPress: () => {} },
    ]);
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
          <Text style={styles.title}>{t('welcome')}</Text>
          <Text style={styles.subtitle}>{t('loginToAccount')}</Text>
        </View>

        <View style={styles.form}>
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <View style={styles.inputContainer}>
            <Ionicons
              name="person-outline"
              size={20}
              color="#666"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder={t('login')}
              value={userId}
              onChangeText={(text) => {
                setUserIdInput(text);
                setErrorMessage('');
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#666"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder={t('password')}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrorMessage('');
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgotPassword}>{t('forgotPassword')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.disabledButton]}
            onPress={() => {
              handleLogin();
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <Text style={styles.buttonText}>{t('loggingIn')}</Text>
            ) : (
              <Text style={styles.buttonText}>{t('login')}</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('noAccount')} </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signUpLink}>{t('signUp')}</Text>
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
  errorContainer: {
  backgroundColor: colors.warning,
    borderRadius: SIZES.smallRadius + 2, 
    padding: SIZES.paddingSmall + 4, 
    marginBottom: SIZES.marginLarge,
    borderLeftWidth: SIZES.borderWidthThick,
  borderLeftColor: colors.error || '#f44336',
  },
  errorText: {
  color: colors.error || '#d32f2f',
    fontSize: SIZES.fontSmall + 2,
    fontWeight: FONT_WEIGHT.medium,
  },
  hintContainer: {
  backgroundColor: colors.accent,
    borderRadius: SIZES.smallRadius + 2,
    padding: SIZES.paddingSmall + 4,
    marginBottom: SIZES.marginLarge,
    borderLeftWidth: SIZES.borderWidthThick,
  borderLeftColor: colors.accent,
  },
  hintText: {
  color: colors.accent,
    fontSize: SIZES.fontSmall + 1,
    fontWeight: FONT_WEIGHT.regular,
    textAlign: 'center',
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
  eyeIcon: {
    padding: SIZES.paddingSmall - 3,
  },
  forgotPassword: {
  color: colors.primary,
    fontSize: SIZES.fontSmall + 2,
    textAlign: 'right',
    marginBottom: SIZES.marginLarge,
  },
  loginButton: {
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SIZES.marginLarge,
  },
  dividerLine: {
    flex: 1,
    height: SIZES.borderWidth,
  backgroundColor: colors.primary,
  },
  dividerText: {
  color: colors.textLight,
    fontSize: SIZES.fontSmall + 2,
    marginHorizontal: SIZES.margin + 3,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: SIZES.borderWidth,
  borderColor: colors.secondary,
    borderRadius: SIZES.radius,
    height: SIZES.image * 0.625,
    marginBottom: SIZES.margin,
  backgroundColor: colors.white,
  },
  socialButtonText: {
  color: colors.secondary,
    fontSize: SIZES.fontMedium,
    marginLeft: SIZES.margin,
  },
  socialButtonText: {
  color: colors.text,
    fontSize: SIZES.fontMedium,
    marginLeft: SIZES.margin,
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
  signUpLink: {
  color: colors.accent,
    fontSize: SIZES.fontSmall + 2,
    fontWeight: FONT_WEIGHT.semiBold,
  },
});

export default LoginScreen;
