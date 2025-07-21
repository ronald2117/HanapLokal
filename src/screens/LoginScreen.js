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
import ModernInput from '../components/ModernInput';
import ModernButton from '../components/ModernButton';
import { Colors, Typography, Spacing, BorderRadius } from '../styles/theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  const { login, loginAnonymously, resetPassword } = useAuth();

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
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAnonymousLogin() {
    try {
      setLoading(true);
      await loginAnonymously();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      Alert.alert('Email Required', 'Please enter your email address first');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email);
      setResetEmailSent(true);
      Alert.alert(
        'Reset Email Sent', 
        'Check your email for password reset instructions',
        [{ text: 'OK' }]
      );
    } catch (error) {
      let errorMessage = 'Failed to send reset email';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <LinearGradient
        colors={[Colors.primary, Colors.primaryLight]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Image 
                  source={require('../../assets/lokalfinds-logo.png')} 
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.title}>Kumusta ka, kaibigan!</Text>
              <Text style={styles.subtitle}>
                Mag-login sa LokalFinds at tuklasin ang mga lokal na tindahan
              </Text>
            </View>

            {/* Login Form */}
            <View style={styles.formContainer}>
              <View style={styles.card}>
                <Text style={styles.formTitle}>Mag-login para magsimula</Text>
                
                <ModernInput
                  label="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  icon="mail-outline"
                  placeholder="Ilagay ang inyong email"
                />

                <ModernInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  icon="lock-closed-outline"
                  placeholder="Ilagay ang password"
                />

                {/* Forgot Password Link */}
                <TouchableOpacity
                  onPress={handleForgotPassword}
                  style={styles.forgotPasswordContainer}
                  disabled={loading}
                >
                  <Text style={styles.forgotPasswordText}>
                    Nakalimutan ang password?
                  </Text>
                </TouchableOpacity>

                <ModernButton
                  title="Mag-login"
                  onPress={handleSubmit}
                  loading={loading}
                  variant="primary"
                  size="large"
                  style={styles.loginButton}
                />

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>o</Text>
                  <View style={styles.dividerLine} />
                </View>

                <ModernButton
                  title="Guest Mode (Hindi kailangan mag-register)"
                  onPress={handleAnonymousLogin}
                  loading={loading}
                  variant="outline"
                  size="large"
                  icon={<Ionicons name="person-outline" size={20} color={Colors.primary} />}
                />
              </View>

              {/* Sign Up Link */}
              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>Wala pang account? </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Signup')}
                  style={styles.signUpLink}
                >
                  <Text style={styles.signUpLinkText}>Mag-signup dito</Text>
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
    paddingTop: 60,
    paddingBottom: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: Typography.fontSize['4xl'],
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
    marginBottom: Spacing.lg,
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
    marginBottom: Spacing.lg,
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
    color: Colors.primaryDark ,
    fontWeight: Typography.fontWeight.bold,
    textDecorationLine: 'underline',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  forgotPasswordText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.medium,
    textDecorationLine: 'underline',
  },
});
