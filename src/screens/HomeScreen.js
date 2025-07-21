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
import * as Location from 'expo-location';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useLocation } from '../contexts/LocationContext';
import StoreCard from '../components/StoreCard';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/theme';

export default function HomeScreen({ navigation }) {
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchRadius, setSearchRadius] = useState(10); // Default 10km radius
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { location, refreshLocation, isLoading } = useLocation();

  // Custom refresh function with feedback
  const handleRefreshLocation = async () => {
    const success = await refreshLocation();
    if (success && location) {
      Alert.alert(
        'Location Updated!',
        `Your location has been updated with high accuracy.\n\nNow showing stores within ${selectedRadius !== -1 ? `${selectedRadius}km` : 'unlimited'} radius.`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Location Error', 
        'Could not get your precise location. Please check your GPS settings.',
        [{ text: 'OK' }]
      );
    }
  };

  // Search radius options in kilometers
  const radiusOptions = [
    { value: 1, label: '1 km' },
    { value: 2, label: '2 km' },
    { value: 5, label: '5 km' },
    { value: 10, label: '10 km' },
    { value: 20, label: '20 km' },
    { value: 50, label: '50 km' },
    { value: 100, label: '100 km' },
    { value: -1, label: 'No limit' }, // -1 means no distance filtering
  ];

  // Store categories for filtering
  const storeCategories = [
    { id: '', name: 'All', icon: 'apps' },
    { id: 'sari-sari', name: 'Sari-sari', icon: 'storefront' },
    { id: 'kainan', name: 'Kainan', icon: 'restaurant' },
    { id: 'laundry', name: 'Laundry', icon: 'shirt' },
    { id: 'vegetables', name: 'Vegetables', icon: 'leaf' },
    { id: 'meat', name: 'Meat Shop', icon: 'fish' },
    { id: 'bakery', name: 'Bakery', icon: 'cafe' },
    { id: 'pharmacy', name: 'Pharmacy', icon: 'medical' },
    { id: 'hardware', name: 'Hardware', icon: 'hammer' },
    { id: 'clothing', name: 'Clothing', icon: 'shirt-outline' },
    { id: 'electronics', name: 'Electronics', icon: 'phone-portrait' },
    { id: 'beauty', name: 'Beauty', icon: 'cut' },
    { id: 'automotive', name: 'Automotive', icon: 'car' },
    { id: 'other', name: 'Other', icon: 'business' },
  ];

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    filterStores();
  }, [searchQuery, selectedCategory, searchRadius, stores, location]);

  // Calculate distance between two coordinates using Haversine formula
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
    let filtered = stores;

    // Filter by distance/radius if user location and radius are available
    if (location && searchRadius !== -1) {
      filtered = filtered.filter(store => {
        // Check if store has coordinates
        if (store.coordinates && store.coordinates.latitude && store.coordinates.longitude) {
          const distance = calculateDistance(
            location.latitude,
            location.longitude,
            store.coordinates.latitude,
            store.coordinates.longitude
          );
          return distance <= searchRadius;
        }
        // If store doesn't have coordinates, include it in results (legacy stores)
        return true;
      });
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(store => store.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(store =>
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredStores(filtered);
  };

  const renderStore = ({ item }) => (
    <StoreCard
      store={item}
      onPress={() => navigation.navigate('StoreDetails', { store: item })}
      userLocation={location}
    />
  );

  const renderCategory = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.categoryItem, 
        { borderColor: selectedCategory === item.id ? Colors.primary : Colors.border },
        selectedCategory === item.id && styles.categoryItemSelected
      ]} 
      activeOpacity={0.7}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Ionicons name={item.icon} size={20} color={selectedCategory === item.id ? Colors.primary : Colors.text.secondary} />
      <Text style={[
        styles.categoryText, 
        { color: selectedCategory === item.id ? Colors.primary : Colors.text.secondary }
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      {/* <StatusBar barStyle="light-content" backgroundColor={Colors.primary} /> */}
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

        {/* Search Radius Section */}
        <View style={styles.radiusSection}>
          <View style={styles.radiusHeader}>
            <Ionicons name="location" size={16} color={Colors.primary} />
            <Text style={styles.radiusTitle}>Search Radius</Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.radiusScroll}
          >
            {radiusOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.radiusOption,
                  searchRadius === option.value && styles.radiusOptionSelected
                ]}
                onPress={() => setSearchRadius(option.value)}
              >
                <Text style={[
                  styles.radiusOptionText,
                  searchRadius === option.value && styles.radiusOptionTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {!location && (
            <View style={styles.locationWarningContainer}>
              <Text style={styles.locationWarning}>
                📍 Enable location to filter by distance
              </Text>
              <TouchableOpacity 
                style={[styles.refreshLocationButton, isLoading && styles.refreshLocationButtonDisabled]}
                onPress={handleRefreshLocation}
                disabled={isLoading}
              >
                <Ionicons 
                  name={isLoading ? "reload" : "location"} 
                  size={16} 
                  color="#fff" 
                />
                <Text style={styles.refreshLocationButtonText}>
                  {isLoading ? 'Getting Location...' : 'Get My Location'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {location && (
            <View style={styles.locationFoundContainer}>
              <Text style={styles.storeCount}>
                {filteredStores.length} store(s) found
                {searchRadius !== -1 ? ` within ${searchRadius} km` : ''}
                {location?.accuracy && (
                  ` (±${Math.round(location.accuracy)}m accuracy)`
                )}
              </Text>
              <TouchableOpacity 
                style={[styles.refreshLocationButton, styles.refreshLocationButtonSmall, isLoading && styles.refreshLocationButtonDisabled]}
                onPress={handleRefreshLocation}
                disabled={isLoading}
              >
                <Ionicons 
                  name={isLoading ? "reload" : "refresh"} 
                  size={14} 
                  color="#fff" 
                />
                <Text style={styles.refreshLocationButtonTextSmall}>
                  {isLoading ? 'Updating...' : 'Refresh'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Categories Section */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Mga Kategorya</Text>
          <FlatList
            data={storeCategories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
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
      
      {/* Floating Map Button */}
      <TouchableOpacity
        style={styles.floatingMapButton}
        onPress={() => navigation.navigate('StoreMap', { stores: filteredStores })}
        activeOpacity={0.8}
      >
        <Ionicons name="map" size={24} color={Colors.text.white} />
      </TouchableOpacity>
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
    marginTop: 20,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.card,
    borderWidth: 2,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginHorizontal: Spacing.sm,
    minWidth: 90,
    ...Shadows.base,
  },
  
  categoryItemSelected: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
  },
  
  categoryIcon: {
    fontSize: 16,
    marginRight: Spacing.xs,
  },
  
  categoryText: {
    fontSize: Typography.fontSize.xs,
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
  
  radiusSection: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    ...Shadows.small,
  },
  radiusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  radiusTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text.primary,
    marginLeft: Spacing.xs,
  },
  radiusScroll: {
    marginBottom: Spacing.xs,
  },
  radiusOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  radiusOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  radiusOptionText: {
    ...Typography.caption,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  radiusOptionTextSelected: {
    color: Colors.surface,
    fontWeight: '600',
  },
  locationWarning: {
    ...Typography.caption,
    color: Colors.text.light,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  storeCount: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  
  floatingMapButton: {
    position: 'absolute',
    right: Spacing.xl,
    bottom: Spacing.xl + 80, // Account for tab bar height
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.large,
    elevation: 8,
  },
  locationWarningContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  locationFoundContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  refreshLocationButton: {
    backgroundColor: '#3498db',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  refreshLocationButtonSmall: {
    backgroundColor: '#2980b9',
    marginTop: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  refreshLocationButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  refreshLocationButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  refreshLocationButtonTextSmall: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 3,
  },
});
