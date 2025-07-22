import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/theme';

export default function StoreCard({ 
  store, 
  onPress, 
  userLocation, 
  showFavoriteIcon = false, 
  matchingProducts = [], 
  searchQuery = '' 
}) {
  const [rating, setRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    fetchStoreRating();
  }, [store.id]);

  const fetchStoreRating = async () => {
    try {
      const reviewsQuery = query(
        collection(db, 'storeReviews'),
        where('storeId', '==', store.id)
      );
      
      const querySnapshot = await getDocs(reviewsQuery);
      let totalRating = 0;
      let count = 0;
      
      querySnapshot.forEach((doc) => {
        const reviewData = doc.data();
        totalRating += reviewData.rating;
        count++;
      });
      
      setReviewCount(count);
      setRating(count > 0 ? totalRating / count : 0);
    } catch (error) {
      console.error('Error fetching store rating:', error);
    }
  };
  // Calculate real distance using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };

  const getDistanceText = () => {
    if (!userLocation || !store.coordinates || !store.coordinates.latitude || !store.coordinates.longitude) {
      return '';
    }
    
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      store.coordinates.latitude,
      store.coordinates.longitude
    );
    
    // Format distance nicely
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    } else if (distance < 10) {
      return `${distance.toFixed(1)} km away`;
    } else {
      return `${Math.round(distance)} km away`;
    }
  };

  // Get category information
  const getCategoryInfo = () => {
    const categories = {
      'sari-sari': { name: 'Sari-sari Store', icon: 'storefront', emoji: '🏪' },
      'kainan': { name: 'Restaurant', icon: 'restaurant', emoji: '🍽️' },
      'laundry': { name: 'Laundry Shop', icon: 'shirt', emoji: '👕' },
      'vegetables': { name: 'Vegetable Store', icon: 'leaf', emoji: '🥬' },
      'meat': { name: 'Meat Shop', icon: 'fish', emoji: '🥩' },
      'bakery': { name: 'Bakery', icon: 'cafe', emoji: '🍞' },
      'pharmacy': { name: 'Pharmacy', icon: 'medical', emoji: '💊' },
      'hardware': { name: 'Hardware Store', icon: 'hammer', emoji: '🔨' },
      'clothing': { name: 'Clothing Store', icon: 'shirt-outline', emoji: '👔' },
      'electronics': { name: 'Electronics', icon: 'phone-portrait', emoji: '📱' },
      'beauty': { name: 'Beauty Salon', icon: 'cut', emoji: '✂️' },
      'automotive': { name: 'Automotive Shop', icon: 'car', emoji: '🚗' },
      'other': { name: 'Other', icon: 'business', emoji: '🏪' },
    };
    
    return categories[store.category] || categories['other'];
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Ionicons key={i} name="star" size={12} color="#FFD700" />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <Ionicons key={i} name="star-half" size={12} color="#FFD700" />
        );
      } else {
        stars.push(
          <Ionicons key={i} name="star-outline" size={12} color="#e0e0e0" />
        );
      }
    }
    return stars;
  };

  const highlightSearchQuery = (text, query) => {
    if (!query || !text) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <Text>
        {parts.map((part, index) => (
          <Text 
            key={index} 
            style={regex.test(part) ? styles.highlightedText : null}
          >
            {part}
          </Text>
        ))}
      </Text>
    );
  };

  const getStoreTypeIcon = () => {
    if (store.category) {
      return getCategoryInfo().emoji;
    }
    
    // Fallback logic for stores without category
    const storeType = store.name?.toLowerCase() || '';
    if (storeType.includes('sari') || storeType.includes('tindahan')) return '🏪';
    if (storeType.includes('resto') || storeType.includes('kain')) return '🍽️';
    if (storeType.includes('repair') || storeType.includes('vulca')) return '🔧';
    if (storeType.includes('barbero') || storeType.includes('salon')) return '✂️';
    return '🏪'; // Default store icon
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <View style={styles.storeIconContainer}>
          {store.profileImage ? (
            <Image 
              source={{ uri: store.profileImage }} 
              style={styles.profileImage}
            />
          ) : (
            <Text style={styles.storeIcon}>{getStoreTypeIcon()}</Text>
          )}
        </View>
        
        <View style={styles.storeInfo}>
          <Text style={styles.storeName}>{store.name}</Text>
          {store.category && (
            <View style={styles.categoryRow}>
              <Ionicons name={getCategoryInfo().icon} size={12} color={Colors.primary} />
              <Text style={styles.categoryText}>{getCategoryInfo().name}</Text>
            </View>
          )}
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={Colors.text.secondary} />
            <Text style={styles.storeAddress}>{store.address}</Text>
          </View>
          {userLocation && (
            <View style={styles.distanceRow}>
              <Ionicons name="walk-outline" size={12} color={Colors.success} />
              <Text style={styles.distance}>{getDistanceText()}</Text>
            </View>
          )}
          <View style={styles.ratingRow}>
            {reviewCount > 0 ? (
              <>
                <View style={styles.stars}>
                  {renderStars(rating)}
                </View>
                <Text style={styles.ratingText}>
                  {rating.toFixed(1)} ({reviewCount})
                </Text>
              </>
            ) : (
              <Text style={styles.noReviewsText}>No reviews</Text>
            )}
          </View>
        </View>
        
        {showFavoriteIcon && (
          <View style={styles.favoriteIcon}>
            <Ionicons name="heart" size={20} color={Colors.error} />
          </View>
        )}
      </View>

      {/* Matching Products Section */}
      {matchingProducts.length > 0 && (
        <View style={styles.matchingProductsContainer}>
          <View style={styles.matchingProductsHeader}>
            <Ionicons name="search" size={14} color={Colors.primary} />
            <Text style={styles.matchingProductsTitle}>
              Found {matchingProducts.length} matching product{matchingProducts.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.matchingProductsList}>
            {matchingProducts.slice(0, 3).map((product, index) => (
              <View key={product.id} style={styles.matchingProductItem}>
                <Text style={styles.matchingProductName} numberOfLines={1}>
                  {highlightSearchQuery(product.name, searchQuery)}
                </Text>
                <Text style={styles.matchingProductPrice}>₱{product.price}</Text>
              </View>
            ))}
            {matchingProducts.length > 3 && (
              <Text style={styles.moreProductsText}>
                +{matchingProducts.length - 3} more
              </Text>
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.base,
    marginHorizontal: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border.light,
    ...Shadows.base,
  },
  
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  
  storeIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    marginTop: 5,
    
  },
  
  storeIcon: {
    fontSize: 24,
  },

  profileImage: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primaryLight,
  },
  
  storeInfo: {
    flex: 1,
  },
  
  storeName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  
  categoryText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.primary,
    marginLeft: Spacing.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  
  storeAddress: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginLeft: Spacing.xs,
    flex: 1,
  },
  
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  distance: {
    fontSize: Typography.fontSize.xs,
    color: Colors.success,
    fontWeight: Typography.fontWeight.semibold,
    marginLeft: Spacing.xs,
  },
  
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  
  stars: {
    flexDirection: 'row',
    marginRight: Spacing.xs,
  },
  
  ratingText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
  
  noReviewsText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  
  favoriteIcon: {
    padding: Spacing.xs,
  },
  
  storeDetails: {
    marginBottom: Spacing.md,
  },
  
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  
  storeHours: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginLeft: Spacing.xs,
  },
  
  description: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
  },
  
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  
  badge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  
  badgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  
  socialLinksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  
  socialLinkIcon: {
    marginRight: Spacing.sm,
    backgroundColor: '#f8f9fa',
    padding: 4,
    borderRadius: BorderRadius.sm,
  },
  
  socialLinksMore: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
  },

  // Matching Products Styles
  matchingProductsContainer: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },

  matchingProductsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },

  matchingProductsTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary,
    marginLeft: Spacing.xs,
  },

  matchingProductsList: {
    gap: Spacing.xs,
  },

  matchingProductItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },

  matchingProductName: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.primary,
    flex: 1,
    marginRight: Spacing.sm,
  },

  matchingProductPrice: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary,
  },

  moreProductsText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: Spacing.xs,
  },

  highlightedText: {
    backgroundColor: Colors.accent,
    fontWeight: Typography.fontWeight.bold,
  },
});
