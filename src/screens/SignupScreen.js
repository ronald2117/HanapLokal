import React, { useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import ModernInput from '../components/ModernInput';
import ModernButton from '../components/ModernButton';
import { Colors, Typography, Spacing, BorderRadius } from '../styles/theme';

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, loginAnonymously } = useAuth();

  async function handleSubmit() {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Oops!', 'Kumpletuhin po lahat ng fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Hindi tugma ang mga password');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Dapat hindi bababa sa 6 characters ang password');
      return;
    }

    try {
      setLoading(true);
      await signup(email, password);
    } catch (error) {
      Alert.alert('Hindi makapag-register', error.message);
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
              <Text style={styles.title}>Mag-register sa LokalFinds!</Text>
              <Text style={styles.subtitle}>
                Sumali sa aming komunidad at tuklasin ang mga lokal na tindahan
              </Text>
            </View>

            {/* Sign Up Form */}
            <View style={styles.formContainer}>
              <View style={styles.card}>
                <Text style={styles.formTitle}>Gumawa ng Account</Text>
                
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

                <ModernInput
                  label="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  icon="lock-closed-outline"
                  placeholder="Ulitin ang password"
                />

                <ModernButton
                  title="Mag-register"
                  onPress={handleSubmit}
                  loading={loading}
                  variant="primary"
                  size="large"
                  style={styles.signupButton}
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

              {/* Sign In Link */}
              <View style={styles.signInContainer}>
                <Text style={styles.signInText}>May account na? </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Login')}
                  style={styles.signInLink}
                >
                  <Text style={styles.signInLinkText}>Mag-log in dito</Text>
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
  signupButton: {
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
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    fontSize: Typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  signInLink: {
    paddingVertical: Spacing.xs,
  },
  signInLinkText: {
    fontSize: Typography.fontSize.base,
    color: Colors.primaryDark,
    fontWeight: Typography.fontWeight.bold,
    textDecorationLine: 'underline',
  },
});
