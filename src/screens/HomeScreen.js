import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  StatusBar,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useLocation } from '../contexts/LocationContext';
import StoreCard from '../components/StoreCard';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/theme';

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
      Alert.alert('Hindi mahanap', 'Hindi makuha ang mga tindahan');
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

  const categories = [
    { id: 1, name: 'Sari-Sari', icon: '🏪', color: Colors.primary },
    { id: 2, name: 'Kainan', icon: '🍽️', color: Colors.accent },
    { id: 3, name: 'Repair', icon: '🔧', color: Colors.secondary },
    { id: 4, name: 'Lahat', icon: '🌟', color: Colors.success },
  ];

  const renderCategory = ({ item }) => (
    <TouchableOpacity style={[styles.categoryItem, { borderColor: item.color }]} activeOpacity={0.7}>
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text style={[styles.categoryText, { color: item.color }]}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <View style={styles.container}>
        {/* Header Section */}
        <LinearGradient
          colors={[Colors.primary, Colors.primaryLight]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.header}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>Kumusta!</Text>
              <Text style={styles.headerTitle}>Hanap tayo ng magandang tindahan</Text>
            </View>
            {location && (
              <View style={styles.locationContainer}>
                <Ionicons name="location" size={16} color={Colors.text.white} />
                <Text style={styles.locationText}>Malapit sa iyo</Text>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={Colors.text.secondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Hanapin ang tindahan o produkto..."
              placeholderTextColor={Colors.text.light}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color={Colors.text.secondary} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Mga Kategorya</Text>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Stores Section */}
        <View style={styles.storesSection}>
          <View style={styles.storesSectionHeader}>
            <Text style={styles.sectionTitle}>Mga Lokal na Tindahan</Text>
            <Text style={styles.storesCount}>
              {filteredStores.length} {filteredStores.length === 1 ? 'tindahan' : 'mga tindahan'}
            </Text>
          </View>
          
          <FlatList
            data={filteredStores}
            renderItem={renderStore}
            keyExtractor={(item) => item.id}
            style={styles.storesList}
            contentContainerStyle={styles.storesListContent}
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
                <Text style={styles.emptyIcon}>🏪</Text>
                <Text style={styles.emptyText}>
                  {loading ? 'Hinahanap ang mga tindahan...' : 'Walang nakitang tindahan'}
                </Text>
                <Text style={styles.emptySubtext}>
                  {searchQuery ? 'Subukan ang ibang keyword' : 'Mag-antay lang, darating din ang mga tindahan dito'}
                </Text>
              </View>
            )}
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  
  headerGradient: {
    borderBottomLeftRadius: BorderRadius['2xl'],
    borderBottomRightRadius: BorderRadius['2xl'],
  },
  
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing['2xl'],
  },
  
  greetingContainer: {
    marginBottom: Spacing.md,
  },
  
  greeting: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text.white,
    opacity: 0.9,
    marginBottom: Spacing.xs,
  },
  
  headerTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.white,
    lineHeight: Typography.lineHeight.tight * Typography.fontSize['2xl'],
  },
  
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  
  locationText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.white,
    marginLeft: Spacing.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  
  searchSection: {
    paddingHorizontal: Spacing.xl,
    marginTop: -Spacing.xl,
    marginBottom: Spacing.lg,
  },
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    ...Shadows.lg,
  },
  
  searchIcon: {
    marginRight: Spacing.md,
  },
  
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.lg,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
  },
  
  clearButton: {
    padding: Spacing.xs,
  },
  
  categoriesSection: {
    marginBottom: Spacing.lg,
  },
  
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  
  categoriesList: {
    paddingHorizontal: Spacing.lg,
  },
  
  categoryItem: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.card,
    borderWidth: 2,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    marginHorizontal: Spacing.sm,
    minWidth: 80,
    ...Shadows.base,
  },
  
  categoryIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  
  categoryText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  
  storesSection: {
    flex: 1,
  },
  
  storesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  
  storesCount: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
  
  storesList: {
    flex: 1,
  },
  
  storesListContent: {
    paddingBottom: Spacing['2xl'],
  },
  
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['4xl'],
    paddingHorizontal: Spacing.xl,
  },
  
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  
  emptyText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.light,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
  },
});
