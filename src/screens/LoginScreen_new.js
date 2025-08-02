import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import ModernInput from '../components/ModernInput';
import ModernButton from '../components/ModernButton';
import { Colors, Typography, Spacing, BorderRadius } from '../styles/theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const { login, loginAnonymously } = useAuth();
  const { t } = useLanguage();

  // Check if user wants to go to signup after logout
  useEffect(() => {
    const checkPendingSignup = async () => {
      try {
        const pendingSignup = await AsyncStorage.getItem('pendingSignup');
        if (pendingSignup === 'true') {
          await AsyncStorage.removeItem('pendingSignup');
          navigation.navigate('Signup');
        }
      } catch (error) {
        console.error('Error checking pending signup:', error);
      }
    };

    checkPendingSignup();
  }, [navigation]);

  async function handleSubmit() {
    // Clear previous errors
    setEmailError('');
    setPasswordError('');
    setGeneralError('');

    if (!email || !password) {
      if (!email) setEmailError(t('emailRequired'));
      if (!password) setPasswordError(t('passwordRequired'));
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError(t('invalidEmailFormat'));
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
    } catch (error) {
      console.log('Login error:', error);
      
      // Handle specific Firebase auth errors
      switch (error.code) {
        case 'auth/user-not-found':
          setEmailError(t('userNotFound'));
          break;
        case 'auth/wrong-password':
          setPasswordError(t('wrongPassword'));
          break;
        case 'auth/invalid-email':
          setEmailError(t('invalidEmailFormat'));
          break;
        case 'auth/user-disabled':
          setGeneralError(t('accountDisabled'));
          break;
        case 'auth/too-many-requests':
          setGeneralError(t('tooManyAttempts'));
          break;
        case 'auth/network-request-failed':
          setGeneralError(t('networkError'));
          break;
        case 'auth/invalid-credential':
          setGeneralError(t('invalidCredentials'));
          break;
        default:
          setGeneralError(error.message || t('loginFailed'));
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleAnonymousLogin() {
    try {
      setLoading(true);
      await loginAnonymously();
    } catch (error) {
      Alert.alert(t('error'), error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleForgotPassword() {
    navigation.navigate('ForgotPassword');
  }

  // Clear errors when user starts typing
  function handleEmailChange(text) {
    setEmail(text);
    if (emailError) setEmailError('');
    if (generalError) setGeneralError('');
  }

  function handlePasswordChange(text) {
    setPassword(text);
    if (passwordError) setPasswordError('');
    if (generalError) setGeneralError('');
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryLight]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
                <Image 
                  source={require('../../assets/lokalfinds-logo.png')} 
                  style={styles.logo}
                  resizeMode="contain"
                />
              <Text style={styles.title}>{t('loginTitle')}</Text>
              <Text style={styles.subtitle}>
                {t('loginSubtitle')}
              </Text>
            </View>

            {/* Login Form */}
            <View style={styles.formContainer}>
              <View style={styles.card}>
                <Text style={styles.formTitle}>{t('login')}</Text>
                
                <ModernInput
                  label={t('email')}
                  value={email}
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  icon="mail-outline"
                  placeholder="Enter your email"
                  error={emailError}
                />

                <ModernInput
                  label={t('password')}
                  value={password}
                  onChangeText={handlePasswordChange}
                  secureTextEntry
                  icon="lock-closed-outline"
                  placeholder="Enter your password"
                  error={passwordError}
                />

                {/* Forgot Password Link */}
                <TouchableOpacity
                  onPress={handleForgotPassword}
                  style={styles.forgotPasswordContainer}
                  disabled={loading}
                >
                  <Text style={styles.forgotPasswordText}>
                    {t('forgotPassword')}
                  </Text>
                </TouchableOpacity>

                {/* General Error Message */}
                {generalError ? (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={16} color={Colors.error} />
                    <Text style={styles.errorText}>{generalError}</Text>
                  </View>
                ) : null}

                <ModernButton
                  title={t('login')}
                  onPress={handleSubmit}
                  loading={loading}
                  variant="primary"
                  size="large"
                  style={styles.loginButton}
                />

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>{t('or')}</Text>
                  <View style={styles.dividerLine} />
                </View>

                <ModernButton
                  title={t('guestMode')}
                  onPress={handleAnonymousLogin}
                  loading={loading}
                  variant="outline"
                  size="large"
                  icon={<Ionicons name="person-outline" size={20} color={Colors.primary} />}
                />
              </View>

              {/* Sign Up Link */}
              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>{t('noAccount')}</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Signup')}
                  style={styles.signUpLink}
                >
                  <Text style={styles.signUpLinkText}>{t('signUpHere')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 25,
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.text.white,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: Typography.fontSize.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.md,
  },
  formContainer: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.md,
    shadowColor: Colors.text.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  formTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  loginButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.m,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border.light,
  },
  dividerText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginHorizontal: Spacing.md,
    fontWeight: Typography.fontWeight.medium,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  signUpText: {
    fontSize: Typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  signUpLink: {
    paddingVertical: Spacing.xs,
  },
  signUpLinkText: {
    fontSize: Typography.fontSize.base,
    color: 'white',
    fontWeight: Typography.fontWeight.bold,
    textDecorationLine: 'underline',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  forgotPasswordText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.medium,
    textDecorationLine: 'underline',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.3)',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
    color: '#D32F2F',
    marginLeft: Spacing.xs,
    flex: 1,
  },
});
