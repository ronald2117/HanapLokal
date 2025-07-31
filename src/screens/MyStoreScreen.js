import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  RefreshControl,
  Image,
  Linking
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useFocusEffect } from '@react-navigation/native';
import ProductCard from '../components/ProductCard';
import { PROFILE_TYPES, BUSINESS_CATEGORIES } from '../config/categories';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/theme';

export default function MyStoreScreen({ navigation }) {
  const [myBusinessProfile, setMyBusinessProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productLoading, setProductLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { currentUser, isGuestUser, logoutGuestAndSignup } = useAuth();
  const { t } = useLanguage();

  // Helper function to get profile type info
  const getProfileTypeInfo = (typeId) => {
    return PROFILE_TYPES.find(type => type.id === typeId) || { name: 'Unknown Type', icon: 'business', color: '#666' };
  };

  // Helper function to get category info
  const getCategoryInfo = (categoryId) => {
    return BUSINESS_CATEGORIES.find(cat => cat.id === categoryId) || { name: 'Unknown Category', icon: 'business' };
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

  // Refresh business profile data whenever the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (currentUser) {
        fetchMyBusinessProfile();
      }
    }, [currentUser])
  );

  useEffect(() => {
    if (myBusinessProfile) {
      fetchMyProducts();
    }
  }, [myBusinessProfile]);

  const fetchMyBusinessProfile = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching business profile for user:', currentUser.uid);
      
      const businessProfilesQuery = query(
        collection(db, 'businessProfiles'),
        where('ownerId', '==', currentUser.uid)
      );
      const querySnapshot = await getDocs(businessProfilesQuery);
      
      console.log('📊 Query result:', querySnapshot.size, 'business profiles found');
      
      if (!querySnapshot.empty) {
        const profileDoc = querySnapshot.docs[0];
        const profileData = { id: profileDoc.id, ...profileDoc.data() };
        console.log('✅ Business profile found:', profileData.name);
        setMyBusinessProfile(profileData);
      } else {
        console.log('❌ No business profile found for user');
        setMyBusinessProfile(null);
      }
    } catch (error) {
      Alert.alert(t('error'), t('failedToFetchStore'));
      console.error('Error fetching business profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyProducts = async () => {
    try {
      const productsQuery = query(
        collection(db, 'products'),
        where('storeId', '==', myBusinessProfile.id)
      );
      const querySnapshot = await getDocs(productsQuery);
      const productsData = [];
      
      querySnapshot.forEach((doc) => {
        productsData.push({ id: doc.id, ...doc.data() });
      });
      
      console.log('📦 Products found:', productsData.length);
      setProducts(productsData);
    } catch (error) {
      Alert.alert(t('error'), t('failedToFetchProducts'));
      console.error('Error fetching products:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (currentUser) {
      await fetchMyBusinessProfile();
    }
    setRefreshing(false);
  };

  const renderProduct = ({ item }) => (
    <ProductCard 
      product={item} 
      onPress={() => navigation.navigate('EditProduct', { product: item, storeId: myBusinessProfile.id })}
      showEditIcon={true}
    />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>{t('loading')}</Text>
      </View>
    );
  }

  if (!myBusinessProfile) {
    // Show different content for guest users
    if (isGuestUser()) {
      return (
        <View style={styles.noStoreContainer}>
          <Ionicons name="person-outline" size={80} color="#FF6B35" />
          <Text style={styles.guestTitle}>{t('guestUser')}</Text>
          <Text style={styles.guestText}>
            {t('guestWelcomeMessage')}
          </Text>
          
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>{t('registrationBenefits')}</Text>
            <View style={styles.benefitItem}>
              <Ionicons name="storefront" size={20} color="#FF6B35" />
              <Text style={styles.benefitText}>{t('ownStore')}</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="cube" size={20} color="#FF6B35" />
              <Text style={styles.benefitText}>{t('sellProducts')}</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="people" size={20} color="#FF6B35" />
              <Text style={styles.benefitText}>{t('getCustomers')}</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="cash" size={20} color="#FF6B35" />
              <Text style={styles.benefitText}>{t('earnFromBusiness')}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.signupButton}
            onPress={async () => {
              // Set a flag to remember user wants to signup
              await AsyncStorage.setItem('pendingSignup', 'true');
              // Logout guest session - this will trigger navigation to AuthStack
              await logoutGuestAndSignup();
            }}
          >
            <Text style={styles.signupButtonText}>{t('registerForStore')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={onRefresh}
            disabled={refreshing}
          >
            <Ionicons name="refresh" size={20} color="#3498db" />
            <Text style={styles.refreshButtonText}>
              {refreshing ? t('refreshing') : t('refresh')}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Regular user without business profile
    return (
      <View style={styles.noStoreContainer}>
        <Ionicons name="storefront-outline" size={80} color="#bdc3c7" />
        <Text style={styles.noStoreTitle}>{t('noStoreYet')}</Text>
        <Text style={styles.noStoreText}>
          {t('createStoreDescription')}
        </Text>
        <TouchableOpacity
          style={styles.createStoreButton}
          onPress={() => navigation.navigate('CreateStore')}
        >
          <Text style={styles.createStoreButtonText}>{t('createStore')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={refreshing}
        >
          <Ionicons name="refresh" size={20} color="#3498db" />
          <Text style={styles.refreshButtonText}>
            {refreshing ? t('refreshing') : t('refresh')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Cover Photo */}
      {myBusinessProfile.coverImage ? (
        <Image source={{ uri: myBusinessProfile.coverImage }} style={styles.coverImage} />
      ) : (
        <View style={styles.coverPlaceholder} />
      )}
      
      <View style={styles.storeHeader}>
        {/* Profile Picture */}
        <View style={styles.profileContainer}>
          {myBusinessProfile.profileImage ? (
            <Image source={{ uri: myBusinessProfile.profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profilePlaceholder}>
              <Text style={styles.profileInitial}>
                {myBusinessProfile.name ? myBusinessProfile.name.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.storeNameContainer}>
          <Text style={styles.storeName}>{myBusinessProfile.name}</Text>
          
          {/* Business Type Badge */}
          <View style={styles.businessTypesContainer}>
            {myBusinessProfile.profileType && (
              <View 
                style={[
                  styles.businessTypeBadge, 
                  styles.primaryBusinessTypeBadge,
                  { borderColor: getProfileTypeInfo(myBusinessProfile.profileType).color }
                ]}
              >
                <Ionicons 
                  name={getProfileTypeInfo(myBusinessProfile.profileType).icon} 
                  size={12} 
                  color="#fff"
                />
                <Text style={[
                  styles.businessTypeText,
                  styles.primaryBusinessTypeText,
                  { color: '#fff' }
                ]}>
                  {getProfileTypeInfo(myBusinessProfile.profileType).name}
                </Text>
              </View>
            )}
          </View>

          {/* Business Categories */}
          {myBusinessProfile.categories && myBusinessProfile.categories.length > 0 && (
            <View style={styles.categoriesContainer}>
              {myBusinessProfile.categories.slice(0, 3).map((categoryId) => {
                const categoryInfo = getCategoryInfo(categoryId);
                return (
                  <View key={categoryId} style={styles.categoryChip}>
                    <Ionicons name={categoryInfo.icon} size={12} color="#3498db" />
                    <Text style={styles.categoryChipText}>{categoryInfo.name}</Text>
                  </View>
                );
              })}
              {myBusinessProfile.categories.length > 3 && (
                <Text style={styles.moreCategoriesText}>+{myBusinessProfile.categories.length - 3} more</Text>
              )}
            </View>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('StoreSettings', { businessProfile: myBusinessProfile })}
        >
          <Ionicons name="settings" size={20} color="#7f8c8d" />
          <Text style={styles.settingsButtonText}>{t('settings')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.storeInfo}>
        <Text style={styles.storeAddress}>📍 {myBusinessProfile.address}</Text>
        <Text style={styles.storeHours}>🕒 {myBusinessProfile.hours}</Text>
        
        {/* Contact Numbers */}
        {myBusinessProfile.contactNumbers && myBusinessProfile.contactNumbers.length > 0 && (
          <View style={styles.contactNumbersContainer}>
            {myBusinessProfile.contactNumbers.map((contact, index) => (
              <Text key={index} style={styles.storeContact}>
                📞 {contact.label}: {contact.number}
              </Text>
            ))}
          </View>
        )}
        
        {/* Mobile Service Info */}
        {myBusinessProfile.isMobile && (
          <Text style={styles.mobileServiceText}>
            🚗 Mobile Service (Radius: {myBusinessProfile.serviceRadius}km)
          </Text>
        )}
      </View>

      {/* Social Links Section */}
      {myBusinessProfile.socialLinks && myBusinessProfile.socialLinks.length > 0 && (
        <View style={styles.socialLinksSection}>
          <Text style={styles.sectionTitle}>Social Links & Online Presence</Text>
          <View style={styles.socialLinksContainer}>
            {myBusinessProfile.socialLinks.map((link, index) => {
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

      <View style={styles.productsSection}>
        <View style={styles.productsHeader}>
          <Text style={styles.sectionTitle}>{t('myProducts')} ({products.length})</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddProduct', { storeId: myBusinessProfile.id })}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>{t('addProduct')}</Text>
          </TouchableOpacity>
        </View>

        {products.length > 0 ? (
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
            <Text style={styles.emptyText}>{t('noProductsYet')}</Text>
            <Text style={styles.emptySubtext}>{t('addFirstProduct')}</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noStoreContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noStoreTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 20,
    marginBottom: 10,
  },
  noStoreText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
  },
  createStoreButton: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  createStoreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
  },
  refreshButtonText: {
    color: '#3498db',
    marginLeft: 5,
    fontWeight: '600',
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
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
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
  storeNameContainer: {
    flex: 1,
  },
  storeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  categoryText: {
    fontSize: 12,
    color: '#3498db',
    marginLeft: 4,
    fontWeight: '600',
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  settingsButtonText: {
    color: '#7f8c8d',
    marginLeft: 5,
    fontWeight: '600',
  },
  storeInfo: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
  },
  storeAddress: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  storeHours: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  storeContact: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  productsSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
  },
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27ae60',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: '600',
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
  emptySubtext: {
    fontSize: 14,
    color: '#95a5a6',
    marginTop: 5,
  },
  // Guest user styles
  guestTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  guestText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  benefitsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 10,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 5,
  },
  benefitText: {
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 12,
    flex: 1,
  },
  signupButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: 15,
    ...Shadows.base,
  },
  signupButtonText: {
    color: 'white',
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginLeft: Spacing.sm,
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
    paddingVertical: 10,
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
  businessTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 8,
  },
  businessTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 6,
  },
  primaryBusinessTypeBadge: {
    backgroundColor: '#3498db',
  },
  businessTypeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  primaryBusinessTypeText: {
    color: '#fff',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    borderRadius: 15,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  categoryChipText: {
    fontSize: 11,
    color: '#1976d2',
    marginLeft: 4,
    fontWeight: '500',
  },
  moreCategoriesText: {
    fontSize: 11,
    color: '#7f8c8d',
    fontStyle: 'italic',
    alignSelf: 'center',
  },
  contactNumbersContainer: {
    marginTop: 5,
  },
  mobileServiceText: {
    fontSize: 14,
    color: '#27ae60',
    marginTop: 5,
    fontWeight: '500',
  },
});
