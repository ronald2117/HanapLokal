import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/theme';
import ModernButton from '../components/ModernButton';
import ModernInput from '../components/ModernInput';

const SettingsScreen = ({ navigation }) => {
  const { currentUser, userProfile, updateUserProfile, loading: authLoading, isGuestUser } = useAuth();
  const { t } = useLanguage();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFirstName(userProfile.firstName || '');
      setLastName(userProfile.lastName || '');
    }
  }, [userProfile]);

  const handleUpdateProfile = async () => {
    if (isGuestUser()) {
      Alert.alert(t('error'), 'Please create an account to update your profile.');
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert(t('error'), 'First name and last name cannot be empty.');
      return;
    }
    setLoading(true);
    try {
      await updateUserProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      Alert.alert(t('success'), 'Your profile has been updated.');
    } catch (error) {
      Alert.alert(t('error'), 'Failed to update profile. Please try again.');
      console.error("Profile update error:", error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToChangePassword = () => {
    // This would navigate to a dedicated screen for changing the password
    Alert.alert('Coming Soon', 'This feature is not yet implemented.');
  };

  const handleDeleteAccount = () => {
    // This should have a very serious confirmation prompt
    Alert.alert(
      'Delete Account',
      'This is a permanent action. Are you absolutely sure you want to delete your account and all associated data?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Coming Soon', 'This feature is not yet implemented.') },
      ]
    );
  };

  if (authLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Show message for guest users
  if (isGuestUser()) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Required</Text>
          <View style={styles.card}>
            <Text style={styles.guestMessage}>
              You need to create an account to access settings and manage your profile.
            </Text>
            <ModernButton
              title="Create Account"
              onPress={() => navigation.navigate('Auth', { screen: 'Signup' })}
              style={{ marginTop: Spacing.lg }}
            />
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.card}>
          <ModernInput
            label="First Name"
            value={firstName}
            onChangeText={setFirstName}
            icon="person-outline"
          />
          <ModernInput
            label="Last Name"
            value={lastName}
            onChangeText={setLastName}
            icon="person-outline"
          />
          <ModernButton
            title="Save Changes"
            onPress={handleUpdateProfile}
            loading={loading}
            style={{ marginTop: Spacing.md }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.menuItem} onPress={navigateToChangePassword}>
            <Ionicons name="lock-closed-outline" size={22} color={Colors.text.secondary} />
            <Text style={styles.menuItemText}>Change Password</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.text.light} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Actions</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.menuItem} onPress={handleDeleteAccount}>
            <Ionicons name="trash-outline" size={22} color={Colors.error} />
            <Text style={[styles.menuItemText, { color: Colors.error }]}>Delete Account</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  contentContainer: {
    padding: Spacing.base,
    paddingBottom: 50,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.base,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  menuItemText: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    marginLeft: Spacing.md,
  },
  guestMessage: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
