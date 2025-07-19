import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StoreCard from '../components/StoreCard';
import { useLocation } from '../contexts/LocationContext';
import { useFocusEffect } from '@react-navigation/native';

export default function FavoritesScreen({ navigation }) {
  const [favoriteStores, setFavoriteStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const { location } = useLocation();

  useFocusEffect(
    React.useCallback(() => {
      fetchFavorites();
    }, [])
  );

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const favorites = await AsyncStorage.getItem('favorites');
      
      if (favorites) {
        const favoriteIds = JSON.parse(favorites);
        const storesData = [];
        
        for (const storeId of favoriteIds) {
          const storeDoc = await getDoc(doc(db, 'stores', storeId));
          if (storeDoc.exists()) {
            storesData.push({ id: storeDoc.id, ...storeDoc.data() });
          }
        }
        
        setFavoriteStores(storesData);
      } else {
        setFavoriteStores([]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch favorites');
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStore = ({ item }) => (
    <StoreCard
      store={item}
      onPress={() => navigation.navigate('StoreDetails', { store: item })}
      userLocation={location}
      showFavoriteIcon={true}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Favorites</Text>
        <Text style={styles.headerSubtitle}>
          {favoriteStores.length} favorite store{favoriteStores.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={favoriteStores}
        renderItem={renderStore}
        keyExtractor={(item) => item.id}
        style={styles.storesList}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color="#bdc3c7" />
            <Text style={styles.emptyText}>
              {loading ? 'Loading favorites...' : 'No favorites yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              Stores you favorite will appear here
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  storesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#7f8c8d',
    marginTop: 15,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#95a5a6',
    marginTop: 5,
    textAlign: 'center',
  },
});
