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

export default function TermsOfServiceScreen({ navigation }) {
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
          
          <Text style={styles.headerTitle}>{t('termsOfService')}</Text>
          
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
            
            <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
            <Text style={styles.paragraph}>
              By accessing and using LocalFind ("the App"), you accept and agree to be bound by the terms and provision of this agreement.
            </Text>

            <Text style={styles.sectionTitle}>2. Description of Service</Text>
            <Text style={styles.paragraph}>
              LocalFind is a mobile application that connects local stores with nearby customers in the Philippines. The app allows users to discover local businesses, browse products, and interact with store owners.
            </Text>

            <Text style={styles.sectionTitle}>3. User Accounts</Text>
            <Text style={styles.paragraph}>
              You may create an account to access certain features of the App. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
            </Text>

            <Text style={styles.sectionTitle}>4. User Conduct</Text>
            <Text style={styles.paragraph}>
              You agree not to use the App for any unlawful purpose or in any way that could damage, disable, or impair the App. Prohibited activities include:
            </Text>
            <Text style={styles.bulletPoint}>• Uploading false or misleading information</Text>
            <Text style={styles.bulletPoint}>• Harassing or threatening other users</Text>
            <Text style={styles.bulletPoint}>• Violating any local, state, or national laws</Text>
            <Text style={styles.bulletPoint}>• Attempting to gain unauthorized access to the App</Text>

            <Text style={styles.sectionTitle}>5. Store Listings and Products</Text>
            <Text style={styles.paragraph}>
              Store owners are responsible for the accuracy of their business information and product listings. LocalFind does not guarantee the availability, quality, or pricing of products listed on the App.
            </Text>

            <Text style={styles.sectionTitle}>6. Privacy and Data Protection</Text>
            <Text style={styles.paragraph}>
              Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information.
            </Text>

            <Text style={styles.sectionTitle}>7. Intellectual Property</Text>
            <Text style={styles.paragraph}>
              The App and its original content, features, and functionality are owned by LocalFind and are protected by international copyright, trademark, and other intellectual property laws.
            </Text>

            <Text style={styles.sectionTitle}>8. Disclaimers</Text>
            <Text style={styles.paragraph}>
              LocalFind is provided "as is" without warranties of any kind. We do not guarantee that the App will be uninterrupted, secure, or error-free.
            </Text>

            <Text style={styles.sectionTitle}>9. Limitation of Liability</Text>
            <Text style={styles.paragraph}>
              LocalFind shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the App.
            </Text>

            <Text style={styles.sectionTitle}>10. Transactions</Text>
            <Text style={styles.paragraph}>
              LocalFind facilitates connections between customers and local stores but is not responsible for the completion of transactions, payment processing, or dispute resolution between users and store owners.
            </Text>

            <Text style={styles.sectionTitle}>11. Termination</Text>
            <Text style={styles.paragraph}>
              We may terminate or suspend your account at any time for violating these terms. Upon termination, your right to use the App will cease immediately.
            </Text>

            <Text style={styles.sectionTitle}>12. Changes to Terms</Text>
            <Text style={styles.paragraph}>
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the App constitutes acceptance of the modified terms.
            </Text>

            <Text style={styles.sectionTitle}>13. Governing Law</Text>
            <Text style={styles.paragraph}>
              These terms shall be governed by and construed in accordance with the laws of the Republic of the Philippines.
            </Text>

            <Text style={styles.sectionTitle}>14. Contact Information</Text>
            <Text style={styles.paragraph}>
              If you have any questions about these Terms of Service, please contact us at:
            </Text>
            <Text style={styles.contactInfo}>Email: support@localfind.ph</Text>
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
