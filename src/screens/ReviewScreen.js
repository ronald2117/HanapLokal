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
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/theme';

export default function ReviewScreen({ navigation }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleStarPress = (starRating) => {
    setRating(starRating);
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating before submitting.');
      return;
    }

    setSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      Alert.alert(
        'Thank You!',
        'Your review has been submitted successfully. We appreciate your feedback!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    }, 1500);
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
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Tap a star to rate';
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rate Our App</Text>
          <View style={styles.placeholder} />
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <View style={styles.appIcon}>
            <Ionicons name="storefront" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.appName}>LokalFinds</Text>
          <Text style={styles.appDescription}>
            Help us improve by sharing your experience
          </Text>
        </View>

        {/* Rating Section */}
        <View style={styles.ratingSection}>
          <Text style={styles.ratingTitle}>How would you rate our app?</Text>
          <View style={styles.starsContainer}>
            {renderStars()}
          </View>
          <Text style={styles.ratingText}>{getRatingText()}</Text>
        </View>

        {/* Review Section */}
        <View style={styles.reviewSection}>
          <Text style={styles.reviewTitle}>
            Tell us more about your experience (Optional)
          </Text>
          <TextInput
            style={styles.reviewInput}
            placeholder="Share your thoughts, suggestions, or any issues you encountered..."
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
            <Text style={styles.submitButtonText}>Submitting...</Text>
          ) : (
            <>
              <Ionicons name="send" size={20} color={Colors.text.white} />
              <Text style={styles.submitButtonText}>Submit Review</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Thank You Message */}
        <View style={styles.thankYouSection}>
          <Text style={styles.thankYouText}>
            Your feedback helps us make LokalFinds better for everyone! 🙏
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
