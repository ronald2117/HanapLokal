import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProductCard from '../components/ProductCard';

export default function StoreDetailsScreen({ route, navigation }) {
  const { store } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchProducts();
    checkIfFavorite();
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.storeInfo}>
          <Text style={styles.storeName}>{store.name}</Text>
          <Text style={styles.storeAddress}>📍 {store.address}</Text>
          <Text style={styles.storeHours}>🕒 {store.hours}</Text>
          <Text style={styles.storeContact}>📞 {store.contact}</Text>
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
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>{store.description}</Text>
      </View>

      <View style={styles.productsSection}>
        <Text style={styles.sectionTitle}>Products</Text>
        {loading ? (
          <Text style={styles.loadingText}>Loading products...</Text>
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
            <Text style={styles.emptyText}>No products available</Text>
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
  header: {
    backgroundColor: '#fff',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
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
});
