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
  StatusBar
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
  const { login, loginAnonymously } = useAuth();

  // Check if user wants to go to signup after logout
  useEffect(() => {
    const checkPendingSignup = async () => {
      try {
        const pendingSignup = await AsyncStorage.getItem('pendingSignup');
        if (pendingSignup === 'true') {
          // Clear the flag and navigate to signup
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
      Alert.alert('Oops!', 'Kumpletuhin po lahat ng fields');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
    } catch (error) {
      Alert.alert('Hindi makapasok', error.message);
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

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark, Colors.secondary]}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.content}>
              {/* Header Section */}
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <Text style={styles.logoEmoji}>🏪</Text>
                  <Text style={styles.title}>LokalFinds</Text>
                </View>
                <Text style={styles.subtitle}>Tuklasin ang mga lokal na tindahan</Text>
                <Text style={styles.tagline}>Suportahan ang ating mga kababayan!</Text>
              </View>

              {/* Form Section */}
              <View style={styles.formContainer}>
                <View style={styles.form}>
                  <Text style={styles.formTitle}>Mag-login para magsimula</Text>
                  
                  <ModernInput
                    label="Email Address"
                    placeholder="Ilagay ang inyong email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    icon="mail-outline"
                  />
                  
                  <ModernInput
                    label="Password"
                    placeholder="Ilagay ang password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    icon="lock-closed-outline"
                  />

                  <ModernButton
                    title={loading ? 'Pumapasok...' : 'Mag-login'}
                    onPress={handleSubmit}
                    disabled={loading}
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
                    title="Magpatuloy bilang Bisita"
                    onPress={handleAnonymousLogin}
                    disabled={loading}
                    variant="outline"
                    size="large"
                    icon={<Ionicons name="person-outline" size={20} color={Colors.primary} />}
                  />

                  <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => navigation.navigate('Signup')}
                  >
                    <Text style={styles.linkText}>
                      Wala pang account? <Text style={styles.linkTextBold}>Mag-signup dito</Text>
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  gradientBackground: {
    flex: 1,
  },
  
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: '100%',
  },
  
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing['2xl'],
  },
  
  header: {
    alignItems: 'center',
    marginTop: Spacing['4xl'],
  },
  
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  
  logoEmoji: {
    fontSize: 60,
    marginBottom: Spacing.md,
  },
  
  title: {
    fontSize: Typography.fontSize['4xl'],
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.text.white,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  
  subtitle: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text.white,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: Spacing.xs,
  },
  
  tagline: {
    fontSize: Typography.fontSize.base,
    color: Colors.accent,
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: Typography.fontWeight.medium,
  },
  
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    marginTop: Spacing['2xl'],
  },
  
  form: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing['2xl'],
    marginHorizontal: Spacing.sm,
    shadowColor: Colors.text.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  
  formTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  
  loginButton: {
    marginTop: Spacing.lg,
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
    marginHorizontal: Spacing.lg,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
  
  linkButton: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    marginTop: Spacing.md,
  },
  
  linkText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  
  linkTextBold: {
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
});
