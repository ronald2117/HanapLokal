import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/theme';

const LanguageSettingsScreen = ({ navigation }) => {
  const { language, changeLanguage, t } = useLanguage();

  const languages = [
    { code: 'en', name: t('english'), icon: '🇺🇸' },
    { code: 'tl', name: t('tagalog'), icon: '🇵🇭' }
  ];

  const handleLanguageChange = (newLanguage) => {
    if (newLanguage !== language) {
      const newLanguageName = languages.find(lang => lang.code === newLanguage)?.name || newLanguage;
      
      Alert.alert(
        t('changeLanguage'),
        t('changeLanguageConfirm').replace('{language}', newLanguageName),
        [
          {
            text: t('cancel'),
            style: 'cancel',
          },
          {
            text: t('change'),
            onPress: async () => {
              await changeLanguage(newLanguage);
              Alert.alert(
                t('languageChanged'),
                t('languageChangedMessage'),
                [{ text: t('ok') }]
              );
            },
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerIcon}>
            <Ionicons name="language" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.headerTitle}>{t('language')}</Text>
          <Text style={styles.headerSubtitle}>
            {t('selectLanguage')}
          </Text>
        </View>

        {/* Language Selection */}
        <View style={styles.content}>
          <View style={styles.languageList}>
            {languages.map((lang, index) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageItem,
                  language === lang.code && styles.languageItemSelected,
                  index === 0 && styles.firstLanguageItem,
                  index === languages.length - 1 && styles.lastLanguageItem
                ]}
                onPress={() => handleLanguageChange(lang.code)}
                activeOpacity={0.7}
              >
                <View style={styles.languageInfo}>
                  <View style={[
                    styles.languageIconContainer,
                    language === lang.code && styles.languageIconContainerSelected
                  ]}>
                    <Text style={styles.languageIcon}>{lang.icon}</Text>
                  </View>
                  <View style={styles.languageDetails}>
                    <Text style={[
                      styles.languageName,
                      language === lang.code && styles.languageNameSelected
                    ]}>
                      {lang.name}
                    </Text>
                    <Text style={[
                      styles.languageCode,
                      language === lang.code && styles.languageCodeSelected
                    ]}>
                      {lang.code.toUpperCase()}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.selectionIndicator}>
                  {language === lang.code ? (
                    <View style={styles.selectedIndicator}>
                      <Ionicons name="checkmark-circle" size={28} color={Colors.primary} />
                    </View>
                  ) : (
                    <View style={styles.unselectedIndicator} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={24} color={Colors.secondary} />
              <Text style={styles.infoText}>
                {t('languageChangeNote') || 'App interface will switch to your selected language immediately.'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  
  scrollView: {
    flex: 1,
  },
  
  headerSection: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.background.card,
    marginBottom: Spacing.lg,
  },
  
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius:1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.base,
  },
  
  headerTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  
  headerSubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  
  languageList: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    ...Shadows.base,
    overflow: 'hidden',
  },
  
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    backgroundColor: Colors.background.card,
  },
  
  firstLanguageItem: {
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
  },
  
  lastLanguageItem: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: BorderRadius.lg,
    borderBottomRightRadius: BorderRadius.lg,
  },
  
  languageItemSelected: {
    backgroundColor: 'rgba(255, 107, 53, 0.05)',
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  languageIconContainer: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  
  languageIconContainerSelected: {
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
  },
  
  languageIcon: {
    fontSize: 24,
  },
  
  languageDetails: {
    flex: 1,
  },
  
  languageName: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: 2,
  },
  
  languageNameSelected: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
  },
  
  languageCode: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.light,
    fontWeight: Typography.fontWeight.medium,
  },
  
  languageCodeSelected: {
    color: Colors.primary,
  },
  
  selectionIndicator: {
    marginLeft: Spacing.md,
  },
  
  selectedIndicator: {
    // Container for the selected check icon
  },
  
  unselectedIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.border.medium,
  },
  
  infoSection: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.base,
  },
  
  infoText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginLeft: Spacing.md,
    flex: 1,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
  },
});

export default LanguageSettingsScreen;
