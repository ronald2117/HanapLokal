import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useLanguage } from '../contexts/LanguageContext';
import ReviewCard from '../components/ReviewCard';
import { Colors, Typography, Spacing, BorderRadius } from '../styles/theme';

export default function StoreReviewsScreen({ navigation, route }) {
  const { store } = route.params;
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const reviewsQuery = query(
        collection(db, 'storeReviews'),
        where('storeId', '==', store.id),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(reviewsQuery);
      const reviewsData = [];
      let totalRating = 0;

      querySnapshot.forEach((doc) => {
        const reviewData = { id: doc.id, ...doc.data() };
        reviewsData.push(reviewData);
        totalRating += reviewData.rating;
      });

      setReviews(reviewsData);
      
      if (reviewsData.length > 0) {
        setAverageRating(totalRating / reviewsData.length);
      } else {
        setAverageRating(0);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReviews();
    setRefreshing(false);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Ionicons key={i} name="star" size={20} color="#FFD700" />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <Ionicons key={i} name="star-half" size={20} color="#FFD700" />
        );
      } else {
        stars.push(
          <Ionicons key={i} name="star-outline" size={20} color="#e0e0e0" />
        );
      }
    }
    return stars;
  };

  const renderReview = ({ item }) => (
    <ReviewCard review={item} />
  );

  const renderHeader = () => (
    <View style={styles.headerStats}>
      <View style={styles.ratingOverview}>
        <Text style={styles.averageRating}>
          {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
        </Text>
        <View style={styles.starsContainer}>
          {renderStars(averageRating)}
        </View>
        <Text style={styles.reviewCount}>
          {reviews.length} {reviews.length === 1 ? t('review') : t('reviews')}
        </Text>
      </View>
      
      <TouchableOpacity
        style={styles.writeReviewButton}
        onPress={() => navigation.navigate('StoreReview', { store })}
      >
        <Ionicons name="create-outline" size={20} color={Colors.text.white} />
        <Text style={styles.writeReviewText}>{t('writeReview')}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>

      <FlatList
        data={reviews}
        renderItem={renderReview}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="star-outline" size={64} color="#bdc3c7" />
            <Text style={styles.emptyText}>
              {loading ? t('loading') : t('noReviewsYet')}
            </Text>
            <Text style={styles.emptySubtext}>
              {t('beFirstToReview')}
            </Text>
            <TouchableOpacity
              style={styles.firstReviewButton}
              onPress={() => navigation.navigate('StoreReview', { store })}
            >
              <Text style={styles.firstReviewButtonText}>
                {t('writeFirstReview')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.screen,
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
  listContent: {
    paddingBottom: Spacing.xl,
  },
  headerStats: {
    backgroundColor: Colors.background.white,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  ratingOverview: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  averageRating: {
    fontSize: 48,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  starsContainer: {
    flexDirection: 'row',
    marginVertical: Spacing.sm,
  },
  reviewCount: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  writeReviewText: {
    color: Colors.text.white,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginLeft: Spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginTop: Spacing.xl,
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text.secondary,
    marginTop: Spacing.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.light,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  firstReviewButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
  },
  firstReviewButtonText: {
    color: Colors.text.white,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
});
