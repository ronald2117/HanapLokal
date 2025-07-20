import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import ProductCard from '../components/ProductCard';

export default function MyStoreScreen({ navigation }) {
  const [myStore, setMyStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { currentUser, isGuestUser } = useAuth();

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
      Alert.alert('Error', 'Failed to fetch store information');
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
      Alert.alert('Error', 'Failed to fetch products');
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
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!myStore) {
    // Show different content for guest users
    if (isGuestUser()) {
      return (
        <View style={styles.noStoreContainer}>
          <Ionicons name="person-outline" size={80} color="#FF6B35" />
          <Text style={styles.guestTitle}>Ikaw ay Guest User</Text>
          <Text style={styles.guestText}>
            Salamat sa paggamit ng LokalFinds! Bilang guest, pwede mo lang tingnan ang mga tindahan at produkto.
          </Text>
          
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Mga benepisyo ng pag-register:</Text>
            <View style={styles.benefitItem}>
              <Ionicons name="storefront" size={20} color="#FF6B35" />
              <Text style={styles.benefitText}>Magkakaroon ng sariling tindahan</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="cube" size={20} color="#FF6B35" />
              <Text style={styles.benefitText}>Magtinda ng mga produkto</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="people" size={20} color="#FF6B35" />
              <Text style={styles.benefitText}>Makakuha ng mga customer</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="cash" size={20} color="#FF6B35" />
              <Text style={styles.benefitText}>Kumita mula sa negosyo</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => navigation.navigate('Auth', { screen: 'Signup' })}
          >
            <Text style={styles.signupButtonText}>Mag-register para sa Store</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={onRefresh}
            disabled={refreshing}
          >
            <Ionicons name="refresh" size={20} color="#3498db" />
            <Text style={styles.refreshButtonText}>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Regular user without store
    return (
      <View style={styles.noStoreContainer}>
        <Ionicons name="storefront-outline" size={80} color="#bdc3c7" />
        <Text style={styles.noStoreTitle}>No Store Yet</Text>
        <Text style={styles.noStoreText}>
          Create your store to start selling your products to local customers
        </Text>
        <TouchableOpacity
          style={styles.createStoreButton}
          onPress={() => navigation.navigate('CreateStore')}
        >
          <Text style={styles.createStoreButtonText}>Create Store</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={refreshing}
        >
          <Ionicons name="refresh" size={20} color="#3498db" />
          <Text style={styles.refreshButtonText}>
            {refreshing ? 'Refreshing...' : 'Refresh'}
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
      <View style={styles.storeHeader}>
        <Text style={styles.storeName}>{myStore.name}</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditStore', { store: myStore })}
        >
          <Ionicons name="pencil" size={20} color="#3498db" />
          <Text style={styles.editButtonText}>Edit Store</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.storeInfo}>
        <Text style={styles.storeAddress}>📍 {myStore.address}</Text>
        <Text style={styles.storeHours}>🕒 {myStore.hours}</Text>
        <Text style={styles.storeContact}>📞 {myStore.contact}</Text>
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
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  storeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#3498db',
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
