import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import StarRating from '../components/StarRating';
import { Colors, Typography, Spacing, BorderRadius } from '../styles/theme';

export default function StoreReviewScreen({ route, navigation }) {
  const { store } = route.params;
  const { currentUser, userProfile } = useAuth();
  const { t } = useLanguage();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  // Get user display name securely
  const getUserDisplayName = () => {
    if (userProfile && userProfile.firstName && userProfile.lastName) {
      // Use sanitized profile data
      return `${userProfile.firstName} ${userProfile.lastName}`.trim();
    }
    
    if (currentUser && currentUser.displayName) {
      // Sanitize display name
      return currentUser.displayName.replace(/[<>]/g, '').trim();
    }
    
    return currentUser?.email || 'Anonymous User';
  };

  const handleSubmitReview = async () => {
    if (isGuestUser()) {
      Alert.alert(
        t('guestUserLimit'),
        t('registerToReview'),
        [
          { text: t('cancel'), style: 'cancel' },
          { 
            text: t('register'), 
            onPress: () => navigation.navigate('Auth', { screen: 'Signup' })
          }
        ]
      );
      return;
    }

    if (rating === 0) {
      Alert.alert(t('ratingRequired'), t('selectRating'));
      return;
    }

    try {
      setLoading(true);
      
      const reviewData = {
        storeId: store.id,
        userId: currentUser.uid,
        userName: getUserDisplayName(),
        rating: rating,
        comment: comment.trim(),
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'storeReviews'), reviewData);

      Alert.alert(
        t('reviewSubmitted'),
        t('thankYouForReview'),
        [
          {
            text: t('ok'),
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert(t('error'), t('failedToSubmitReview'));
    } finally {
      setLoading(false);
    }
  };

  const getRatingLabel = (rating) => {
    const labels = [
      '',
      t('poor'),
      t('fair'), 
      t('good'),
      t('veryGood'),
      t('excellent')
    ];
    return labels[rating] || '';
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
          <Text style={styles.headerTitle}>{t('writeReview')}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Store Info */}
        <View style={styles.storeInfo}>
          <Text style={styles.storeLabel}>{t('reviewingStore')}</Text>
          <Text style={styles.storeName}>{store.name}</Text>
          <Text style={styles.storeAddress}>{store.address}</Text>
        </View>

        {/* Rating Section */}
        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>{t('howWouldYouRate')}</Text>
          <StarRating
            rating={rating}
            onRatingChange={setRating}
            size={40}
          />
          {rating > 0 && (
            <Text style={styles.ratingLabel}>
              {getRatingLabel(rating)} ({rating}/5)
            </Text>
          )}
        </View>

        {/* Comment Section */}
        <View style={styles.commentSection}>
          <Text style={styles.sectionTitle}>{t('tellUsMore')}</Text>
          <TextInput
            style={styles.commentInput}
            multiline
            numberOfLines={5}
            value={comment}
            onChangeText={setComment}
            placeholder={t('shareExperience')}
            placeholderTextColor={Colors.text.light}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (rating === 0 || loading) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmitReview}
          disabled={rating === 0 || loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? t('submitting') : t('submitReview')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.screen,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    backgroundColor: Colors.background.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  placeholder: {
    width: 32,
  },
  storeInfo: {
    backgroundColor: Colors.background.white,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  storeLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  storeName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  storeAddress: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  ratingSection: {
    backgroundColor: Colors.background.white,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  ratingLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.medium,
    marginTop: Spacing.md,
  },
  commentSection: {
    backgroundColor: Colors.background.white,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    minHeight: 120,
    backgroundColor: Colors.background.white,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: Colors.text.light,
  },
  submitButtonText: {
    color: Colors.text.white,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
});
