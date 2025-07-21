import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProductCard from '../components/ProductCard';
import ReviewCard from '../components/ReviewCard';
import { useLanguage } from '../contexts/LanguageContext';

export default function StoreDetailsScreen({ route, navigation }) {
  const { store } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const { t } = useLanguage();

  // Get category information
  const getCategoryInfo = () => {
    const categories = {
      'sari-sari': { name: t('sariSari'), icon: 'storefront', emoji: '🏪' },
      'kainan': { name: t('restaurant'), icon: 'restaurant', emoji: '🍽️' },
      'laundry': { name: t('laundry'), icon: 'shirt', emoji: '👕' },
      'vegetables': { name: t('vegetables'), icon: 'leaf', emoji: '🥬' },
      'meat': { name: t('meatShop'), icon: 'fish', emoji: '🥩' },
      'bakery': { name: t('bakery'), icon: 'cafe', emoji: '🍞' },
      'pharmacy': { name: t('pharmacy'), icon: 'medical', emoji: '💊' },
      'hardware': { name: t('hardware'), icon: 'hammer', emoji: '🔨' },
      'clothing': { name: t('clothing'), icon: 'shirt-outline', emoji: '👔' },
      'electronics': { name: t('electronics'), icon: 'phone-portrait', emoji: '📱' },
      'beauty': { name: t('beauty'), icon: 'cut', emoji: '✂️' },
      'automotive': { name: t('automotive'), icon: 'car', emoji: '🚗' },
      'other': { name: t('other'), icon: 'business', emoji: '🏪' },
    };
    
    return categories[store.category] || categories['other'];
  };

  useEffect(() => {
    fetchProducts();
    checkIfFavorite();
    fetchReviews();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsQuery = query(
        collection(db, 'products'),
        where('storeId', '==', store.id)
      );
      const querySnapshot = await getDocs(productsQuery);
      const productsData = [];
      
      querySnapshot.forEach((doc) => {
        productsData.push({ id: doc.id, ...doc.data() });
      });
      
      setProducts(productsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const reviewsQuery = query(
        collection(db, 'storeReviews'),
        where('storeId', '==', store.id),
        orderBy('createdAt', 'desc'),
        limit(3) // Show only latest 3 reviews in preview
      );

      const querySnapshot = await getDocs(reviewsQuery);
      const reviewsData = [];
      let totalRating = 0;
      let count = 0;

      // Get all reviews for average calculation
      const allReviewsQuery = query(
        collection(db, 'storeReviews'),
        where('storeId', '==', store.id)
      );
      const allReviewsSnapshot = await getDocs(allReviewsQuery);
      
      allReviewsSnapshot.forEach((doc) => {
        const reviewData = doc.data();
        totalRating += reviewData.rating;
        count++;
      });

      // Get latest reviews for display
      querySnapshot.forEach((doc) => {
        reviewsData.push({ id: doc.id, ...doc.data() });
      });

      setReviews(reviewsData);
      setReviewCount(count);
      setAverageRating(count > 0 ? totalRating / count : 0);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Ionicons key={i} name="star" size={16} color="#FFD700" />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <Ionicons key={i} name="star-half" size={16} color="#FFD700" />
        );
      } else {
        stars.push(
          <Ionicons key={i} name="star-outline" size={16} color="#e0e0e0" />
        );
      }
    }
    return stars;
  };

  const checkIfFavorite = async () => {
    try {
      const favorites = await AsyncStorage.getItem('favorites');
      if (favorites) {
        const favoritesArray = JSON.parse(favorites);
        setIsFavorite(favoritesArray.includes(store.id));
      }
    } catch (error) {
      console.error('Error checking favorites:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      const favorites = await AsyncStorage.getItem('favorites');
      let favoritesArray = favorites ? JSON.parse(favorites) : [];
      
      if (isFavorite) {
        favoritesArray = favoritesArray.filter(id => id !== store.id);
      } else {
        favoritesArray.push(store.id);
      }
      
      await AsyncStorage.setItem('favorites', JSON.stringify(favoritesArray));
      setIsFavorite(!isFavorite);
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorites');
      console.error('Error updating favorites:', error);
    }
  };

  const renderProduct = ({ item }) => (
    <ProductCard 
      product={item} 
      onPress={() => navigation.navigate('ProductDetails', { product: item })}
    />
  );

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Cover Photo */}
      {store.coverImage ? (
        <Image source={{ uri: store.coverImage }} style={styles.coverImage} />
      ) : (
        <View style={styles.coverPlaceholder} />
      )}
      
      <View style={styles.header}>
        {/* Profile Picture */}
        <View style={styles.profileContainer}>
          {store.profileImage ? (
            <Image source={{ uri: store.profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profilePlaceholder}>
              <Text style={styles.profileInitial}>
                {store.name ? store.name.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.storeInfo}>
          <Text style={styles.storeName}>{store.name}</Text>
          {store.category && (
            <View style={styles.categoryContainer}>
              <Ionicons name={getCategoryInfo().icon} size={16} color="#3498db" />
              <Text style={styles.categoryText}>{getCategoryInfo().name}</Text>
            </View>
          )}
          <Text style={styles.storeAddress}>📍 {store.address}</Text>
          <Text style={styles.storeHours}>🕒 {store.hours}</Text>
          {store.contact && <Text style={styles.storeContact}>📞 {store.contact}</Text>}
        </View>
        
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={toggleFavorite}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? '#e74c3c' : '#7f8c8d'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.aboutSection}>
        <Text style={styles.sectionTitle}>{t('about')}</Text>
        <Text style={styles.description}>{store.description}</Text>
      </View>

      {/* Reviews Section */}
      <View style={styles.reviewsSection}>
        <View style={styles.reviewsHeader}>
          <Text style={styles.sectionTitle}>{t('reviews')}</Text>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => navigation.navigate('StoreReviews', { store })}
          >
            <Text style={styles.seeAllText}>{t('seeAll')}</Text>
          </TouchableOpacity>
        </View>
        
        {reviewCount > 0 ? (
          <>
            <View style={styles.ratingOverview}>
              <View style={styles.ratingStats}>
                <Text style={styles.averageRating}>
                  {averageRating.toFixed(1)}
                </Text>
                <View style={styles.starsContainer}>
                  {renderStars(averageRating)}
                </View>
                <Text style={styles.reviewCount}>
                  {reviewCount} {reviewCount === 1 ? t('review') : t('reviews')}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.writeReviewButton}
                onPress={() => navigation.navigate('StoreReview', { store })}
              >
                <Ionicons name="create-outline" size={16} color="#3498db" />
                <Text style={styles.writeReviewText}>{t('writeReview')}</Text>
              </TouchableOpacity>
            </View>
            
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </>
        ) : (
          <View style={styles.noReviewsContainer}>
            <Ionicons name="star-outline" size={32} color="#bdc3c7" />
            <Text style={styles.noReviewsText}>{t('noReviewsYet')}</Text>
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
      </View>

      <View style={styles.productsSection}>
        <Text style={styles.sectionTitle}>{t('products')}</Text>
        {loading ? (
          <Text style={styles.loadingText}>{t('loadingProducts')}</Text>
        ) : products.length > 0 ? (
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.productRow}
          />
        ) : (
          <View style={styles.emptyProducts}>
            <Ionicons name="cube-outline" size={48} color="#bdc3c7" />
            <Text style={styles.emptyText}>{t('noProductsAvailable')}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  coverImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#ecf0f1',
  },
  coverPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#ecf0f1',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
    marginTop: -40, // Pull up over cover image
  },
  profileContainer: {
    marginRight: 15,
    marginTop: -20, // Pull up over cover image
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#f8f9fa',
  },
  profilePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 14,
    color: '#3498db',
    marginLeft: 6,
    fontWeight: '600',
  },
  storeAddress: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  storeHours: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  storeContact: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  favoriteButton: {
    padding: 8,
  },
  aboutSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#7f8c8d',
    lineHeight: 24,
  },
  productsSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
  },
  loadingText: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontSize: 16,
    padding: 20,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  emptyProducts: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 10,
  },
  reviewsSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllButton: {
    padding: 5,
  },
  seeAllText: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '600',
  },
  ratingOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  ratingStats: {
    alignItems: 'center',
  },
  averageRating: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  starsContainer: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  reviewCount: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3498db',
  },
  writeReviewText: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  noReviewsContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  noReviewsText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 10,
    marginBottom: 15,
  },
  firstReviewButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  firstReviewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
