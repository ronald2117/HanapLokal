import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useLocation } from '../contexts/LocationContext';
import StoreCard from '../components/StoreCard';

export default function HomeScreen({ navigation }) {
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { location } = useLocation();

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    filterStores();
  }, [searchQuery, stores]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const storesQuery = query(collection(db, 'stores'), orderBy('name'));
      const querySnapshot = await getDocs(storesQuery);
      const storesData = [];
      
      querySnapshot.forEach((doc) => {
        storesData.push({ id: doc.id, ...doc.data() });
      });
      
      setStores(storesData);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch stores');
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStores();
    setRefreshing(false);
  };

  const filterStores = () => {
    if (!searchQuery.trim()) {
      setFilteredStores(stores);
      return;
    }

    const filtered = stores.filter(store =>
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredStores(filtered);
  };

  const renderStore = ({ item }) => (
    <StoreCard
      store={item}
      onPress={() => navigation.navigate('StoreDetails', { store: item })}
      userLocation={location}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover Local Stores</Text>
        {location && (
          <Text style={styles.locationText}>
            📍 Location detected
          </Text>
        )}
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#7f8c8d" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search stores or products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredStores}
        renderItem={renderStore}
        keyExtractor={(item) => item.id}
        style={styles.storesList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="storefront-outline" size={64} color="#bdc3c7" />
            <Text style={styles.emptyText}>
              {loading ? 'Loading stores...' : 'No stores found'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try a different search term' : 'Stores will appear here when available'}
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
  locationText: {
    fontSize: 14,
    color: '#27ae60',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 0,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
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
