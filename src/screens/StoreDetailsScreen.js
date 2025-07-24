import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  Image,
  Linking,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  addDoc, 
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import ProductCard from '../components/ProductCard';
import ReviewCard from '../components/ReviewCard';
import Toast from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export default function StoreDetailsScreen({ route, navigation }) {
  const { store } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [chatLoading, setChatLoading] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [reviewsListener, setReviewsListener] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [previousReviewCount, setPreviousReviewCount] = useState(0);
  const { t } = useLanguage();
  const { currentUser, userProfile, isGuestUser } = useAuth();

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

  // Function to get platform icon for social links
  const getPlatformIcon = (platform) => {
    const icons = {
      facebook: 'logo-facebook',
      instagram: 'logo-instagram', 
      twitter: 'logo-twitter',
      youtube: 'logo-youtube',
      tiktok: 'logo-tiktok',
      linkedin: 'logo-linkedin',
      whatsapp: 'logo-whatsapp',
      telegram: 'send',
      viber: 'call',
      shopee: 'storefront',
      lazada: 'bag',
      link: 'link'
    };
    return icons[platform] || 'link';
  };

  // Function to get platform color for social links
  const getPlatformColor = (platform) => {
    const colors = {
      facebook: '#1877F2',
      instagram: '#E4405F',
      twitter: '#1DA1F2', 
      youtube: '#FF0000',
      tiktok: '#000000',
      linkedin: '#0A66C2',
      whatsapp: '#25D366',
      telegram: '#0088CC',
      viber: '#665CAC',
      shopee: '#FF5722',
      lazada: '#0F146D',
      link: '#6B7280'
    };
    return colors[platform] || '#6B7280';
  };

  // Function to open social link
  const openSocialLink = (url) => {
    if (url) {
      // Add https:// if not present
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
      Linking.openURL(formattedUrl).catch(() => {
        Alert.alert('Error', 'Could not open this link');
      });
    }
  };

  useEffect(() => {
    fetchProducts();
    checkIfFavorite();
    setupReviewsListener();
    
    // Cleanup listener on unmount
    return () => {
      if (reviewsListener) {
        reviewsListener();
      }
    };
  }, []);

  // Refresh reviews when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Refresh reviews when returning from review submission
      fetchReviews();
    }, [])
  );

  // Setup real-time listener for reviews
  const setupReviewsListener = () => {
    try {
      const reviewsQuery = query(
        collection(db, 'storeReviews'),
        where('storeId', '==', store.id),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(reviewsQuery, (snapshot) => {
        const reviewsData = [];
        let totalRating = 0;
        let count = 0;
        let userReviewed = false;

        snapshot.forEach((doc) => {
          const reviewData = { id: doc.id, ...doc.data() };
          reviewsData.push(reviewData);
          totalRating += reviewData.rating;
          count++;
          
          // Check if current user has already reviewed
          if (currentUser && reviewData.userId === currentUser.uid) {
            userReviewed = true;
          }
        });

        // Show toast notification for new reviews (not on first load)
        if (previousReviewCount > 0 && count > previousReviewCount) {
          const newReviews = count - previousReviewCount;
          setToastMessage(
            newReviews === 1 
              ? 'New review added!' 
              : `${newReviews} new reviews added!`
          );
          setShowToast(true);
        }

        // Show only latest 3 reviews in preview
        const latestReviews = reviewsData.slice(0, 3);
        
        setReviews(latestReviews);
        setReviewCount(count);
        setAverageRating(count > 0 ? totalRating / count : 0);
        setUserHasReviewed(userReviewed);
        setPreviousReviewCount(count);
      });

      setReviewsListener(() => unsubscribe);
    } catch (error) {
      console.error('Error setting up reviews listener:', error);
      // Fallback to regular fetch if real-time fails
      fetchReviews();
    }
  };

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
      let userReviewed = false;

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
        
        // Check if current user has already reviewed
        if (currentUser && reviewData.userId === currentUser.uid) {
          userReviewed = true;
        }
      });

      // Get latest reviews for display
      querySnapshot.forEach((doc) => {
        reviewsData.push({ id: doc.id, ...doc.data() });
      });

      setReviews(reviewsData);
      setReviewCount(count);
      setAverageRating(count > 0 ? totalRating / count : 0);
      setUserHasReviewed(userReviewed);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  // Manual refresh function for pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchProducts(),
        fetchReviews(),
        checkIfFavorite()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
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

  const startChatWithStore = async () => {
    // Check if user is guest
    if (isGuestUser()) {
      Alert.alert(
        'Sign Up Required',
        'You need to create an account to chat with stores.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Sign Up', 
            onPress: () => navigation.navigate('Auth', { screen: 'Signup' })
          }
        ]
      );
      return;
    }

    try {
      console.log('Starting chat with store:', store.name, 'Owner ID:', store.ownerId);
      
      // Validate store has owner ID
      if (!store.ownerId) {
        Alert.alert('Error', 'Cannot start chat - store owner information is missing.');
        return;
      }
      
      // Prevent chatting with your own store
      if (store.ownerId === currentUser.uid) {
        Alert.alert('Error', 'You cannot chat with your own store.');
        return;
      }
      
      setChatLoading(true);
      
      // Check if conversation already exists
      const conversationsRef = collection(db, 'conversations');
      const existingQuery = query(
        conversationsRef,
        where('participants', 'array-contains', currentUser.uid)
      );
      
      const existingSnapshot = await getDocs(existingQuery);
      let existingConversation = null;
      
      existingSnapshot.forEach((doc) => {
        const conversationData = doc.data();
        if (conversationData.participants.includes(store.ownerId)) {
          existingConversation = { id: doc.id, ...conversationData };
        }
      });
      
      if (existingConversation) {
        // Navigate to existing conversation using nested navigation
        navigation.navigate('Chats', {
          screen: 'ChatDetail',
          params: {
            conversationId: existingConversation.id,
            otherParticipant: {
              uid: store.ownerId,
              name: store.ownerName || 'Store Owner',
              storeName: store.name,
              profileImage: store.profileImage || null,
              isStore: true
            }
          }
        });
        return;
      }
      
      // Create new conversation
      const conversationData = {
        participants: [currentUser.uid, store.ownerId],
        participantsInfo: [
          {
            uid: currentUser.uid,
            name: userProfile?.firstName ? `${userProfile.firstName} ${userProfile.lastName || ''}`.trim() : currentUser.email || 'Customer',
            profileImage: userProfile?.profileImage || null,
            isStore: false
          },
          {
            uid: store.ownerId,
            name: store.ownerName || 'Store Owner',
            storeName: store.name,
            profileImage: store.profileImage || null,
            isStore: true
          }
        ],
        createdAt: serverTimestamp(),
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        unreadCount: {
          [currentUser.uid]: 0,
          [store.ownerId]: 0
        }
      };
      
      const docRef = await addDoc(conversationsRef, conversationData);
      
      // Navigate to the new conversation using nested navigation
      navigation.navigate('Chats', {
        screen: 'ChatDetail',
        params: {
          conversationId: docRef.id,
          otherParticipant: {
            uid: store.ownerId,
            name: store.ownerName || 'Store Owner',
            storeName: store.name,
            profileImage: store.profileImage || null,
            isStore: true
          }
        }
      });
      
    } catch (error) {
      console.error('Error starting chat:', error);
      Alert.alert('Error', 'Failed to start chat. Please try again.');
    } finally {
      setChatLoading(false);
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
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#3498db']}
          tintColor="#3498db"
        />
      }
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
        
        <View style={styles.actionButtons}>
          {/* Only show chat button if store has owner and it's not the current user's store */}
          {store.ownerId && store.ownerId !== currentUser?.uid && (
            <TouchableOpacity
              style={styles.chatButton}
              onPress={startChatWithStore}
              disabled={chatLoading}
            >
              <Ionicons
                name={chatLoading ? "hourglass" : "chatbubble"}
                size={20}
                color="#fff"
              />
              <Text style={styles.chatButtonText}>
                {chatLoading ? t('loading') : t('chats')}
              </Text>
            </TouchableOpacity>
          )}
          
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
      </View>

      <View style={styles.aboutSection}>
        <Text style={styles.sectionTitle}>{t('about')}</Text>
        <Text style={styles.description}>{store.description}</Text>
      </View>

      {/* Social Links Section */}
      {store.socialLinks && store.socialLinks.length > 0 && (
        <View style={styles.socialLinksSection}>
          <Text style={styles.sectionTitle}>Social Links</Text>
          <View style={styles.socialLinksContainer}>
            {store.socialLinks.map((link, index) => {
              const platform = link.platform || 'link';
              const platformIcon = getPlatformIcon(platform);
              const platformColor = getPlatformColor(platform);
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.socialLinkItem, { borderColor: platformColor }]}
                  onPress={() => openSocialLink(link.url)}
                >
                  <Ionicons
                    name={platformIcon}
                    size={20}
                    color={platformColor}
                    style={styles.socialLinkIcon}
                  />
                  <Text style={[styles.socialLinkText, { color: platformColor }]} numberOfLines={1}>
                    {link.url.replace(/^https?:\/\//, '')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

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
                <Ionicons 
                  name={userHasReviewed ? "create" : "create-outline"} 
                  size={16} 
                  color="#3498db" 
                />
                <Text style={styles.writeReviewText}>
                  {userHasReviewed ? t('edit') + ' ' + t('review') : t('writeReview')}
                </Text>
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

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        type="success"
        visible={showToast}
        onHide={() => setShowToast(false)}
        duration={3000}
      />
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
  actionButtons: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
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
  socialLinksSection: {
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  socialLinksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  socialLinkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    marginBottom: 8,
    flex: 1,
    minWidth: '45%',
    maxWidth: '48%',
  },
  socialLinkIcon: {
    marginRight: 8,
  },
  socialLinkText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
});
