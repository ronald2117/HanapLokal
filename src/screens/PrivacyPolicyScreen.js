import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { Colors, Typography, Spacing, BorderRadius } from '../styles/theme';

export default function PrivacyPolicyScreen({ navigation }) {
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryLight]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text.white} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>{t('privacyPolicy')}</Text>
          
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.lastUpdated}>Last updated: July 27, 2025</Text>
            
            <Text style={styles.sectionTitle}>1. Information We Collect</Text>
            <Text style={styles.subsectionTitle}>Personal Information</Text>
            <Text style={styles.paragraph}>
              When you create an account, we collect:
            </Text>
            <Text style={styles.bulletPoint}>• Name (first and last name)</Text>
            <Text style={styles.bulletPoint}>• Email address</Text>
            <Text style={styles.bulletPoint}>• Password (encrypted)</Text>

            <Text style={styles.subsectionTitle}>Location Information</Text>
            <Text style={styles.paragraph}>
              With your permission, we collect location data to help you discover nearby stores and improve our services.
            </Text>

            <Text style={styles.subsectionTitle}>Usage Information</Text>
            <Text style={styles.paragraph}>
              We automatically collect information about how you use LocalFind, including:
            </Text>
            <Text style={styles.bulletPoint}>• App usage patterns</Text>
            <Text style={styles.bulletPoint}>• Device information</Text>
            <Text style={styles.bulletPoint}>• Search queries</Text>
            <Text style={styles.bulletPoint}>• Store interactions</Text>

            <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
            <Text style={styles.paragraph}>
              We use your information to:
            </Text>
            <Text style={styles.bulletPoint}>• Provide and maintain our services</Text>
            <Text style={styles.bulletPoint}>• Personalize your experience</Text>
            <Text style={styles.bulletPoint}>• Connect you with local stores</Text>
            <Text style={styles.bulletPoint}>• Send important notifications</Text>
            <Text style={styles.bulletPoint}>• Improve our app and services</Text>
            <Text style={styles.bulletPoint}>• Ensure security and prevent fraud</Text>

            <Text style={styles.sectionTitle}>3. Information Sharing</Text>
            <Text style={styles.paragraph}>
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
            </Text>
            <Text style={styles.bulletPoint}>• With store owners when you interact with their listings</Text>
            <Text style={styles.bulletPoint}>• With service providers who help us operate the app</Text>
            <Text style={styles.bulletPoint}>• When required by law or to protect our rights</Text>
            <Text style={styles.bulletPoint}>• In case of a business transfer or merger</Text>

            <Text style={styles.sectionTitle}>4. Data Security</Text>
            <Text style={styles.paragraph}>
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:
            </Text>
            <Text style={styles.bulletPoint}>• Encryption of sensitive data</Text>
            <Text style={styles.bulletPoint}>• Regular security assessments</Text>
            <Text style={styles.bulletPoint}>• Limited access to personal information</Text>
            <Text style={styles.bulletPoint}>• Secure data transmission</Text>

            <Text style={styles.sectionTitle}>5. Data Retention</Text>
            <Text style={styles.paragraph}>
              We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy. You may request deletion of your account and associated data at any time.
            </Text>

            <Text style={styles.sectionTitle}>6. Your Rights and Choices</Text>
            <Text style={styles.paragraph}>
              You have the right to:
            </Text>
            <Text style={styles.bulletPoint}>• Access your personal information</Text>
            <Text style={styles.bulletPoint}>• Update or correct your information</Text>
            <Text style={styles.bulletPoint}>• Delete your account and data</Text>
            <Text style={styles.bulletPoint}>• Opt out of promotional communications</Text>
            <Text style={styles.bulletPoint}>• Control location sharing</Text>

            <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
            <Text style={styles.paragraph}>
              LocalFind is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will delete it immediately.
            </Text>

            <Text style={styles.sectionTitle}>8. Third-Party Services</Text>
            <Text style={styles.paragraph}>
              Our app may contain links to third-party websites or services. This privacy policy does not apply to those third-party services, and we encourage you to review their privacy policies.
            </Text>

            <Text style={styles.sectionTitle}>9. International Data Transfers</Text>
            <Text style={styles.paragraph}>
              Your information may be transferred to and processed in countries other than the Philippines. We ensure appropriate safeguards are in place to protect your data during such transfers.
            </Text>

            <Text style={styles.sectionTitle}>10. Changes to This Policy</Text>
            <Text style={styles.paragraph}>
              We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.
            </Text>

            <Text style={styles.sectionTitle}>11. Contact Us</Text>
            <Text style={styles.paragraph}>
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </Text>
            <Text style={styles.contactInfo}>Email: privacy@localfind.ph</Text>
            <Text style={styles.contactInfo}>Address: Metro Manila, Philippines</Text>
          </View>
        </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: Spacing.lg,
  },
  backButton: {
    padding: Spacing.sm,
  },
  headerTitle: {
    flex: 1,
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.white,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    shadowColor: Colors.text.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  lastUpdated: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  subsectionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  paragraph: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  bulletPoint: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    lineHeight: 24,
    marginBottom: Spacing.xs,
    marginLeft: Spacing.md,
  },
  contactInfo: {
    fontSize: Typography.fontSize.base,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
  },
});
