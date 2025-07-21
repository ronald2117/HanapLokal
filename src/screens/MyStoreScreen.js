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
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useFocusEffect } from '@react-navigation/native';
import ProductCard from '../components/ProductCard';

export default function MyStoreScreen({ navigation }) {
  const [myStore, setMyStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productLoading, setProductLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { currentUser, isGuestUser } = useAuth();
  const { t } = useLanguage();

  // Get category information
  const getCategoryInfo = (category) => {
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
    
    return categories[category] || categories['other'];
  };

  // Refresh store data whenever the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (currentUser) {
        fetchMyStore();
      }
    }, [currentUser])
  );

  useEffect(() => {
    if (myStore) {
      fetchMyProducts();
    }
  }, [myStore]);

  const fetchMyStore = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching store for user:', currentUser.uid);
      
      const storesQuery = query(
        collection(db, 'stores'),
        where('ownerId', '==', currentUser.uid)
      );
      const querySnapshot = await getDocs(storesQuery);
      
      console.log('📊 Query result:', querySnapshot.size, 'stores found');
      
      if (!querySnapshot.empty) {
        const storeDoc = querySnapshot.docs[0];
        const storeData = { id: storeDoc.id, ...storeDoc.data() };
        console.log('✅ Store found:', storeData.name);
        setMyStore(storeData);
      } else {
        console.log('❌ No store found for user');
        setMyStore(null);
      }
    } catch (error) {
      Alert.alert(t('error'), t('failedToFetchStore'));
      console.error('Error fetching store:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyProducts = async () => {
    try {
      const productsQuery = query(
        collection(db, 'products'),
        where('storeId', '==', myStore.id)
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
      await fetchMyStore();
    }
    setRefreshing(false);
  };

  const renderProduct = ({ item }) => (
    <ProductCard 
      product={item} 
      onPress={() => navigation.navigate('EditProduct', { product: item, storeId: myStore.id })}
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

  if (!myStore) {
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

    // Regular user without store
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
      {myStore.coverImage ? (
        <Image source={{ uri: myStore.coverImage }} style={styles.coverImage} />
      ) : (
        <View style={styles.coverPlaceholder} />
      )}
      
      <View style={styles.storeHeader}>
        {/* Profile Picture */}
        <View style={styles.profileContainer}>
          {myStore.profileImage ? (
            <Image source={{ uri: myStore.profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profilePlaceholder}>
              <Text style={styles.profileInitial}>
                {myStore.name ? myStore.name.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.storeNameContainer}>
          <Text style={styles.storeName}>{myStore.name}</Text>
          {myStore.category && (
            <View style={styles.categoryContainer}>
              <Ionicons name={getCategoryInfo(myStore.category).icon} size={14} color="#3498db" />
              <Text style={styles.categoryText}>{getCategoryInfo(myStore.category).name}</Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('StoreSettings', { store: myStore })}
        >
          <Ionicons name="settings" size={20} color="#7f8c8d" />
          <Text style={styles.settingsButtonText}>Settings</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.storeInfo}>
        <Text style={styles.storeAddress}>📍 {myStore.address}</Text>
        <Text style={styles.storeHours}>🕒 {myStore.hours}</Text>
        {myStore.contact && <Text style={styles.storeContact}>📞 {myStore.contact}</Text>}
      </View>

      <View style={styles.productsSection}>
        <View style={styles.productsHeader}>
          <Text style={styles.sectionTitle}>My Products ({products.length})</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddProduct', { storeId: myStore.id })}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Add Product</Text>
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
            <Text style={styles.emptyText}>No products yet</Text>
            <Text style={styles.emptySubtext}>Add your first product to get started</Text>
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
    color: '#FF6B35',
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
    backgroundColor: '#FF6B35',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
