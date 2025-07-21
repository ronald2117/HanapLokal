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
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import ModernInput from '../components/ModernInput';
import ModernButton from '../components/ModernButton';
import { Colors, Typography, Spacing, BorderRadius } from '../styles/theme';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword } = useAuth();

  async function handleResetPassword() {
    if (!email) {
      Alert.alert('Email Required', 'Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    const auth = getAuth();
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      setEmailSent(true);
    } catch (error) {
      console.log('Reset password error:', error);
      let errorMessage = 'Failed to send reset email';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function handleBackToLogin() {
    navigation.goBack();
  }

  function handleResendEmail() {
    setEmailSent(false);
    handleResetPassword();
  }

  if (emailSent) {
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
              {/* Success Content */}
              <View style={styles.successContainer}>
                <View style={styles.successIconContainer}>
                  <Ionicons name="mail-outline" size={80} color={Colors.text.white} />
                </View>
                
                <Text style={styles.successTitle}>Email Sent!</Text>
                <Text style={styles.successSubtitle}>
                  We've sent password reset instructions to:
                </Text>
                <Text style={styles.emailText}>{email}</Text>
                
                <Text style={styles.instructionText}>
                  Check your email inbox and follow the instructions to reset your password.
                </Text>
                
                <View style={styles.actionContainer}>
                  <ModernButton
                    title="Resend Email"
                    onPress={handleResendEmail}
                    loading={loading}
                    variant="outline"
                    size="large"
                    style={styles.resendButton}
                    icon={<Ionicons name="refresh-outline" size={20} color={Colors.text.white} />}
                  />
                  
                  <ModernButton
                    title="Back to Login"
                    onPress={handleBackToLogin}
                    variant="primary"
                    size="large"
                    style={styles.backButton}
                    icon={<Ionicons name="arrow-back-outline" size={20} color={Colors.text.white} />}
                  />
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </View>
    );
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
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBackToLogin}
              >
                <Ionicons name="arrow-back" size={24} color={Colors.text.white} />
              </TouchableOpacity>
              
              <View style={styles.iconContainer}>
                <Image 
                  source={require('../../assets/lokalfinds-logo.png')} 
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              
              <Text style={styles.title}>Forgot Password?</Text>
              <Text style={styles.subtitle}>
                Don't worry! Enter your email address and we'll send you instructions to reset your password.
              </Text>
            </View>

            {/* Reset Form */}
            <View style={styles.formContainer}>
              <View style={styles.card}>
                <Text style={styles.formTitle}>Reset Your Password</Text>
                
                <ModernInput
                  label="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  icon="mail-outline"
                  placeholder="Enter your email address"
                  autoFocus
                />

                <ModernButton
                  title="Send Reset Instructions"
                  onPress={handleResetPassword}
                  loading={loading}
                  variant="primary"
                  size="large"
                  style={styles.resetButton}
                  icon={<Ionicons name="send-outline" size={20} color={Colors.text.white} />}
                />
              </View>

              {/* Back to Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Remember your password? </Text>
                <TouchableOpacity
                  onPress={handleBackToLogin}
                  style={styles.loginLink}
                >
                  <Text style={styles.loginLinkText}>Sign in here</Text>
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
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 0,
    padding: Spacing.md,
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
    fontSize: Typography.fontSize.base,
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
  resetButton: {
    marginTop: Spacing.lg,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: Typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  loginLink: {
    paddingVertical: Spacing.xs,
  },
  loginLinkText: {
    fontSize: Typography.fontSize.base,
    color: Colors.accent,
    fontWeight: Typography.fontWeight.bold,
    textDecorationLine: 'underline',
  },
  // Success screen styles
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  successIconContainer: {
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
  successTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.text.white,
    textAlign: 'center',
    marginBottom: Spacing.md,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  successSubtitle: {
    fontSize: Typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emailText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.white,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  instructionText: {
    fontSize: Typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  actionContainer: {
    width: '100%',
    paddingHorizontal: Spacing.lg,
  },
  resendButton: {
    marginBottom: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
