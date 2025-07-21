import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/theme';

export default function LanguageSettingsScreen({ navigation }) {
  const { language, changeLanguage, t } = useLanguage();

  const handleLanguageChange = async (newLanguage) => {
    if (newLanguage !== language) {
      await changeLanguage(newLanguage);
      Alert.alert(
        t('languageChanged'),
        t('languageChangedMessage'),
        [{ text: t('ok') }]
      );
    }
  };

  const languages = [
    { code: 'en', name: t('english'), icon: '🇺🇸' },
    { code: 'tl', name: t('tagalog'), icon: '🇵🇭' }
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('languageSettings')}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>{t('selectLanguage')}</Text>
        
        <View style={styles.languageList}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageItem,
                language === lang.code && styles.languageItemSelected
              ]}
              onPress={() => handleLanguageChange(lang.code)}
            >
              <View style={styles.languageInfo}>
                <Text style={styles.languageIcon}>{lang.icon}</Text>
                <Text style={[
                  styles.languageName,
                  language === lang.code && styles.languageNameSelected
                ]}>
                  {lang.name}
                </Text>
              </View>
              {language === lang.code && (
                <Ionicons name="checkmark" size={24} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  
  backButton: {
    padding: Spacing.sm,
  },
  
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  
  placeholder: {
    width: 40,
  },
  
  content: {
    flex: 1,
    padding: Spacing.xl,
  },
  
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
  },
  
  languageList: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    ...Shadows.base,
  },
  
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  
  languageItemSelected: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
  },
  
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  languageIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  
  languageName: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.medium,
  },
  
  languageNameSelected: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
});
