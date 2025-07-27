import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as MailComposer from 'expo-mail-composer';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/theme';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export default function ReviewScreen({ navigation }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { t } = useLanguage();
  const { userProfile, currentUser } = useAuth();

  const handleStarPress = (starRating) => {
    setRating(starRating);
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert(t('ratingRequired'), t('selectRating'));
      return;
    }

    setSubmitting(true);
    
    try {
      // Check if mail composer is available
      const isAvailable = await MailComposer.isAvailableAsync();
      
      if (!isAvailable) {
        Alert.alert(
          'Email Not Available',
          'Email service is not available on this device. Your feedback has been saved locally.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        setSubmitting(false);
        return;
      }

      // Prepare email content
      const userName = userProfile?.firstName ? 
        `${userProfile.firstName} ${userProfile.lastName || ''}`.trim() : 
        (currentUser?.email || 'Anonymous User');
      
      const ratingText = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating];
      
      const emailSubject = `LocalFind App Review - ${rating} Star${rating !== 1 ? 's' : ''} from ${userName}`;
      
      const emailBody = `
LocalFind App Review
====================

User: ${userName}
Email: ${currentUser?.email || 'Not provided'}
Rating: ${rating}/5 stars (${ratingText})
Date: ${new Date().toLocaleDateString()}

Review:
${review || 'No additional comments provided.'}

---
Sent from LocalFind Mobile App
      `.trim();

      // Send email
      const result = await MailComposer.composeAsync({
        recipients: ['abel.ronald1057@gmail.com'],
        subject: emailSubject,
        body: emailBody,
      });

      setSubmitting(false);

      if (result.status === 'sent') {
        Alert.alert(
          t('thankYou'),
          t('reviewSubmitted'),
          [{ text: t('ok'), onPress: () => navigation.goBack() }]
        );
      } else if (result.status === 'saved') {
        Alert.alert(
          'Review Saved',
          'Your review has been saved to drafts. You can send it later from your email app.',
          [{ text: t('ok'), onPress: () => navigation.goBack() }]
        );
      } else {
        // User cancelled
        setSubmitting(false);
      }
    } catch (error) {
      setSubmitting(false);
      console.error('Email error:', error);
      Alert.alert(
        'Email Error',
        'There was an issue sending your review. Please try again or contact support directly.',
        [{ text: t('ok') }]
      );
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          style={styles.starButton}
          onPress={() => handleStarPress(i)}
        >
          <Ionicons
            name={i <= rating ? 'star' : 'star-outline'}
            size={40}
            color={i <= rating ? '#f39c12' : '#bdc3c7'}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  const getRatingText = () => {
    switch (rating) {
      case 1: return t('poor');
      case 2: return t('fair');
      case 3: return t('good');
      case 4: return t('veryGood');
      case 5: return t('excellent');
      default: return t('tapStarToRate');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* App Info */}
        <View style={styles.appInfo}>
          <View style={styles.appIcon}>
            <Ionicons name="storefront" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.appName}>LocalFind</Text>
          <Text style={styles.appDescription}>
            {t('helpUsImprove')}
          </Text>
        </View>

        {/* Rating Section */}
        <View style={styles.ratingSection}>
          <Text style={styles.ratingTitle}>{t('howWouldYouRate')}</Text>
          <View style={styles.starsContainer}>
            {renderStars()}
          </View>
          <Text style={styles.ratingText}>{getRatingText()}</Text>
        </View>

        {/* Review Section */}
        <View style={styles.reviewSection}>
          <Text style={styles.reviewTitle}>
            {t('tellUsMore')}
          </Text>
          <TextInput
            style={styles.reviewInput}
            placeholder={t('shareThoughts')}
            placeholderTextColor={Colors.text.light}
            value={review}
            onChangeText={setReview}
            multiline={true}
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (rating === 0 || submitting) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmitReview}
          disabled={rating === 0 || submitting}
        >
          {submitting ? (
            <Text style={styles.submitButtonText}>{t('submitting')}</Text>
          ) : (
            <>
              <Ionicons name="send" size={20} color={Colors.text.white} />
              <Text style={styles.submitButtonText}>{t('submitReview')}</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Thank You Message */}
        <View style={styles.thankYouSection}>
          <Text style={styles.thankYouText}>
            {t('feedbackHelps')}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  
  appInfo: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
    backgroundColor: Colors.background.card,
    marginBottom: Spacing.lg,
  },
  
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.xl,
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  
  appName: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  
  appDescription: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  
  ratingSection: {
    backgroundColor: Colors.background.card,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  
  ratingTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  
  starButton: {
    paddingHorizontal: Spacing.sm,
  },
  
  ratingText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
  
  reviewSection: {
    backgroundColor: Colors.background.card,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  
  reviewTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
  },
  
  reviewInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    backgroundColor: Colors.background.secondary,
    minHeight: 120,
  },
  
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
    ...Shadows.base,
  },
  
  submitButtonDisabled: {
    backgroundColor: Colors.text.light,
  },
  
  submitButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.white,
    marginLeft: Spacing.sm,
  },
  
  thankYouSection: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  
  thankYouText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
  },
});
