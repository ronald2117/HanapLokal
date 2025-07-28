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
  ScrollView,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useLocation } from '../contexts/LocationContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import StoreCard from '../components/StoreCard';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/theme';

export default function HomeScreen({ navigation }) {
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchRadius, setSearchRadius] = useState(10); // Default 10km radius
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showRadiusModal, setShowRadiusModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const { location, refreshLocation, isLoading } = useLocation();
  const { t } = useLanguage();
  const { currentUser, userProfile, isGuestUser } = useAuth();

  // Function to get user's first name securely
  const getUserFirstName = () => {
    if (isGuestUser()) {
      return null; // Don't show name for guest users
    }
    
    if (userProfile && userProfile.firstName) {
      // Sanitize the name before displaying (additional security layer)
      return userProfile.firstName.replace(/[<>]/g, '').trim();
    }
    
    if (currentUser && currentUser.displayName) {
      // Fallback to display name first word
      const firstName = currentUser.displayName.split(' ')[0];
      return firstName.replace(/[<>]/g, '').trim();
    }
    
    return null;
  };

  // Function to get personalized greeting
  const getGreeting = () => {
    const firstName = getUserFirstName();
    if (firstName) {
      return t('welcomeUser').replace('{name}', firstName);
    }
    return t('greeting');
  };

  // Custom refresh function with feedback
  const handleRefreshLocation = async () => {
    const success = await refreshLocation();
    if (success && location) {
      Alert.alert(
        'Location Updated!',
        t(`Your location has been updated with high accuracy.\n\nNow showing stores within ${searchRadius !== -1 ? `${searchRadius}km` : t('unlimited')} radius.`),
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
    { value: 1, label: t('1km') },
    { value: 2, label: t('2km') },
    { value: 5, label: t('5km') },
    { value: 10, label: t('10km') },
    { value: 20, label: t('20km') },
    { value: 50, label: t('50km') },
    { value: 100, label: t('100km') },
    { value: -1, label: t('noLimit') }, // -1 means no distance filtering
  ];

  // Store categories for filtering
  const storeCategories = [
    { id: '', name: t('all'), icon: 'apps' },
    { id: 'sari-sari', name: t('sariSari'), icon: 'storefront' },
    { id: 'kainan', name: t('restaurant'), icon: 'restaurant' },
    { id: 'laundry', name: t('laundry'), icon: 'shirt' },
    { id: 'vegetables', name: t('vegetables'), icon: 'leaf' },
    { id: 'meat', name: t('meatShop'), icon: 'fish' },
    { id: 'bakery', name: t('bakery'), icon: 'cafe' },
    { id: 'pharmacy', name: t('pharmacy'), icon: 'medical' },
    { id: 'hardware', name: t('hardware'), icon: 'hammer' },
    { id: 'clothing', name: t('clothing'), icon: 'shirt-outline' },
    { id: 'electronics', name: t('electronics'), icon: 'phone-portrait' },
    { id: 'beauty', name: t('beauty'), icon: 'cut' },
    { id: 'automotive', name: t('automotive'), icon: 'car' },
    { id: 'other', name: t('other'), icon: 'business' },
  ];

  useEffect(() => {
    fetchStores();
    fetchProducts();
  }, []);

  useEffect(() => {
    filterStores();
  }, [searchQuery, selectedCategory, searchRadius, stores, products, location]);

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
      console.log('🔍 Fetching business profiles...');
      const businessProfilesQuery = query(collection(db, 'businessProfiles'), orderBy('name'));
      const querySnapshot = await getDocs(businessProfilesQuery);
      const storesData = [];
      
      querySnapshot.forEach((doc) => {
        storesData.push({ id: doc.id, ...doc.data() });
      });
      
      console.log('📊 Business profiles found:', storesData.length);
      setStores(storesData);
    } catch (error) {
      Alert.alert('Hindi mahanap', 'Hindi makuha ang mga business profiles');
      console.error('Error fetching business profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const productsQuery = query(collection(db, 'products'), orderBy('name'));
      const querySnapshot = await getDocs(productsQuery);
      const productsData = [];
      
      querySnapshot.forEach((doc) => {
        productsData.push({ id: doc.id, ...doc.data() });
      });
      
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchStores(), fetchProducts()]);
    setRefreshTrigger(prev => prev + 1); // Trigger review refresh
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

    // Smart search: Filter by search query (stores AND products)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      
      filtered = filtered.filter(store => {
        // Direct store match (name, address, description)
        const storeMatch = 
          store.name.toLowerCase().includes(query) ||
          store.address.toLowerCase().includes(query) ||
          store.description.toLowerCase().includes(query);

        // Product match - check if this store has any products matching the search
        const storeProducts = products.filter(product => product.storeId === store.id);
        const productMatch = storeProducts.some(product =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
        );

        return storeMatch || productMatch;
      });
    }

    setFilteredStores(filtered);
  };

  const renderStore = ({ item }) => {
    // For smart search, find matching products in this store
    let matchingProducts = [];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      matchingProducts = products.filter(product => 
        product.storeId === item.id && (
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
        )
      );
    }

    return (
      <StoreCard
        key={`${item.id}-${location?.latitude}-${location?.longitude}`}
        store={item}
        onPress={() => navigation.navigate('StoreDetails', { store: item })}
        userLocation={location}
        matchingProducts={matchingProducts}
        searchQuery={searchQuery}
        refreshTrigger={refreshTrigger}
      />
    );
  };

  const getSelectedCategoryName = () => {
    const category = storeCategories.find(cat => cat.id === selectedCategory);
    return category ? category.name : t('all');
  };

  const getSelectedRadiusLabel = () => {
    const radius = radiusOptions.find(opt => opt.value === searchRadius);
    return radius ? radius.label : t('10km');
  };

  const handleRadiusSelect = (value) => {
    setSearchRadius(value);
    setShowRadiusModal(false);
  };

  const handleCategorySelect = (id) => {
    setSelectedCategory(id);
    setShowCategoryModal(false);
  };

  const renderRadiusModal = () => (
    <Modal
      visible={showRadiusModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowRadiusModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('selectSearchRadius')}</Text>
            <TouchableOpacity onPress={() => setShowRadiusModal(false)}>
              <Ionicons name="close" size={24} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {radiusOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.modalItem,
                  searchRadius === option.value && styles.modalItemSelected
                ]}
                onPress={() => handleRadiusSelect(option.value)}
              >
                <Ionicons 
                  name="location" 
                  size={20} 
                  color={searchRadius === option.value ? Colors.primary : Colors.text.secondary} 
                />
                <Text style={[
                  styles.modalItemText,
                  searchRadius === option.value && styles.modalItemTextSelected
                ]}>
                  {option.label}
                </Text>
                {searchRadius === option.value && (
                  <Ionicons name="checkmark" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderCategoryModal = () => (
    <Modal
      visible={showCategoryModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowCategoryModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('selectCategory')}</Text>
            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
              <Ionicons name="close" size={24} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {storeCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.modalItem,
                  selectedCategory === category.id && styles.modalItemSelected
                ]}
                onPress={() => handleCategorySelect(category.id)}
              >
                <Ionicons 
                  name={category.icon} 
                  size={20} 
                  color={selectedCategory === category.id ? Colors.primary : Colors.text.secondary} 
                />
                <Text style={[
                  styles.modalItemText,
                  selectedCategory === category.id && styles.modalItemTextSelected
                ]}>
                  {category.name}
                </Text>
                {selectedCategory === category.id && (
                  <Ionicons name="checkmark" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <>
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
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.headerTitle}>{t('findGoodStores')}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={Colors.text.secondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search stores, products (e.g., 'safeguard', 'rice', 'pharmacy')..."
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
          
          {/* Filter Buttons */}
          <View style={styles.filterSection}>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowRadiusModal(true)}
            >
              <Ionicons name="location" size={16} color={Colors.primary} />
              <Text style={styles.filterButtonText}>{getSelectedRadiusLabel()}</Text>
              <Ionicons name="chevron-down" size={16} color={Colors.text.secondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowCategoryModal(true)}
            >
              <Ionicons name="apps" size={16} color={Colors.primary} />
              <Text style={styles.filterButtonText}>{getSelectedCategoryName()}</Text>
              <Ionicons name="chevron-down" size={16} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stores Section */}
        <View style={styles.storesSection}>
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
                  {loading ? t('searchingStores') : t('noStoresFound')}
                </Text>
                <Text style={styles.emptySubtext}>
                  {searchQuery ? t('tryDifferentKeyword') : t('waitForStores')}
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

      {/* Modals */}
      {renderRadiusModal()}
      {renderCategoryModal()}
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

  filterSection: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    gap: Spacing.md,
  },

  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background.card,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.text.light,
    ...Shadows.base,
  },

  filterButtonText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.medium,
    marginLeft: Spacing.sm,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.xl,
    margin: Spacing.xl,
    maxHeight: '70%',
    width: '85%',
    borderWidth: 1,
    borderColor: Colors.text.light,
    ...Shadows.large,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.text.light,
  },

  modalTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },

  modalContent: {
    maxHeight: 300,
  },

  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.text.light,
  },

  modalItemSelected: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
  },

  modalItemText: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    marginLeft: Spacing.md,
  },

  modalItemTextSelected: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
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
});
