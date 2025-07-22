import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView,
  Image
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/theme';

const { width, height } = Dimensions.get('window');

export default function StoreMapScreen({ route, navigation }) {
  const { stores = [] } = route.params || {};
  const [userLocation, setUserLocation] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    getUserLocation();
    
    // Debug: Log stores and their coordinates
    console.log('🏪 Stores received in StoreMapScreen:', stores.length);
    stores.forEach(store => {
      console.log(`Store: ${store.name}`, {
        hasCoordinates: !!store.coordinates,
        coordinates: store.coordinates
      });
    });
  }, [stores]);

  useEffect(() => {
    if (stores.length > 0 && mapRef.current) {
      // Fit map to show all stores using actual GPS coordinates
      const coordinates = stores.map(store => {
        const storeCoords = getStoreCoordinates(store);
        return {
          latitude: storeCoords.latitude,
          longitude: storeCoords.longitude
        };
      });

      if (userLocation) {
        coordinates.push({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude
        });
      }

      if (coordinates.length > 1) {
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true
        });
      }
    }
  }, [stores, userLocation]);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to show your position on the map.');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Location Error', 'Could not get your current location.');
    } finally {
      setLoading(false);
    }
  };

  const getStoreCoordinates = (store) => {
    // Use actual GPS coordinates if available, otherwise fallback to Manila center
    if (store.coordinates && store.coordinates.latitude && store.coordinates.longitude) {
      console.log(`📍 Using stored GPS coordinates for ${store.name}:`, store.coordinates);
      return {
        latitude: store.coordinates.latitude,
        longitude: store.coordinates.longitude
      };
    }
    
    // Fallback to Manila center if no coordinates are stored
    console.log(`⚠️ No GPS coordinates found for ${store.name}, using Manila center`);
    const baseLatitude = 14.5995;
    const baseLongitude = 120.9842;
    
    return {
      latitude: baseLatitude,
      longitude: baseLongitude
    };
  };

  const getCategoryInfo = (category) => {
    const categories = {
      'sari-sari': { name: 'Sari-sari Store', icon: 'storefront', emoji: '🏪' },
      'kainan': { name: 'Kainan/Restaurant', icon: 'restaurant', emoji: '🍽️' },
      'laundry': { name: 'Laundry Shop', icon: 'shirt', emoji: '👕' },
      'vegetables': { name: 'Vegetable Store', icon: 'leaf', emoji: '🥬' },
      'meat': { name: 'Meat Shop', icon: 'fish', emoji: '🥩' },
      'bakery': { name: 'Bakery', icon: 'cafe', emoji: '🍞' },
      'pharmacy': { name: 'Pharmacy', icon: 'medical', emoji: '💊' },
      'hardware': { name: 'Hardware Store', icon: 'hammer', emoji: '🔨' },
      'clothing': { name: 'Clothing Store', icon: 'shirt-outline', emoji: '👔' },
      'electronics': { name: 'Electronics', icon: 'phone-portrait', emoji: '📱' },
      'beauty': { name: 'Beauty Salon', icon: 'cut', emoji: '✂️' },
      'automotive': { name: 'Automotive Shop', icon: 'car', emoji: '🚗' },
      'other': { name: 'Other', icon: 'business', emoji: '🏪' },
    };
    
    return categories[category] || categories['other'];
  };

  const renderMarker = (store) => {
    const coordinates = getStoreCoordinates(store);
    const categoryInfo = getCategoryInfo(store.category);

    return (
      <Marker
        key={store.id}
        coordinate={coordinates}
        onPress={() => setSelectedStore(store)}
      >
        <View style={[styles.markerContainer, { borderColor: Colors.primary }]}>
          <Text style={styles.markerEmoji}>{categoryInfo.emoji}</Text>
        </View>
        <Callout
          style={styles.callout}
          onPress={() => navigation.navigate('StoreDetails', { store })}
        >
          <View style={styles.calloutContent}>
            <Text style={styles.calloutTitle}>{store.name}</Text>
            <Text style={styles.calloutCategory}>{categoryInfo.name}</Text>
            <Text style={styles.calloutAddress} numberOfLines={2}>{store.address}</Text>
            <Text style={styles.calloutTap}>Tap to view details</Text>
          </View>
        </Callout>
      </Marker>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Store Locations</Text>
        <View style={styles.headerRight}>
          <Text style={styles.storeCount}>{stores.length} stores</Text>
        </View>
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={userLocation || {
          latitude: 14.5995,
          longitude: 120.9842,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        loadingEnabled={loading}
      >
        {stores.map(renderMarker)}
      </MapView>

      {/* Store Info Panel */}
      {selectedStore && (
        <View style={[styles.storeInfoPanel]}>
          {/* Panel Handle */}
          {/* <View style={styles.panelHandle} /> */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
          >
            <TouchableOpacity
              style={styles.storeCard}
              onPress={() => navigation.navigate('StoreDetails', { store: selectedStore })}
            >
              <View style={styles.storeCardHeader}>
                {selectedStore.profileImage ? (
                  <Image 
                    source={{ uri: selectedStore.profileImage }} 
                    style={styles.storeImage}
                  />
                ) : (
                  <View style={styles.storeImagePlaceholder}>
                    <Text style={styles.storeImageEmoji}>
                      {getCategoryInfo(selectedStore.category).emoji}
                    </Text>
                  </View>
                )}
                <View style={styles.storeCardInfo}>
                  <Text style={styles.storeCardName}>{selectedStore.name}</Text>
                  {selectedStore.category && (
                    <Text style={styles.storeCardCategory}>
                      {getCategoryInfo(selectedStore.category).name}
                    </Text>
                  )}
                  <Text style={styles.storeCardAddress} numberOfLines={2}>
                    {selectedStore.address}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedStore(null)}
              >
                <Ionicons name="close" size={20} color={Colors.text.secondary} />
              </TouchableOpacity>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Empty State */}
      {stores.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🗺️</Text>
          <Text style={styles.emptyText}>No stores to show on map</Text>
          <Text style={styles.emptySubtext}>
            Try adjusting your search or category filter
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    ...Shadows.base,
  },
  
  backButton: {
    padding: Spacing.sm,
  },
  
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.white,
    flex: 1,
    textAlign: 'center',
  },
  
  headerRight: {
    alignItems: 'flex-end',
  },
  
  storeCount: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.white,
    opacity: 0.9,
  },
  
  map: {
    flex: 1,
  },
  
  markerContainer: {
    backgroundColor: Colors.background.card,
    borderRadius: 20,
    borderWidth: 2,
    padding: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.base,
  },
  
  markerEmoji: {
    fontSize: 16,
  },
  
  callout: {
    width: 200,
  },
  
  calloutContent: {
    padding: Spacing.sm,
  },
  
  calloutTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  
  calloutCategory: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  
  calloutAddress: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  
  calloutTap: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.light,
    fontStyle: 'italic',
  },
  
  storeInfoPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background.card,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
    paddingHorizontal: 0,
    height: 200, // Fixed height instead of maxHeight
    ...Shadows.large,
    elevation: 10, // Ensure it appears above other elements on Android
    zIndex: 1000, // Additional z-index for iOS
  },
  
  panelHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border.medium,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  
  scrollContainer: {
    flex: 1,
  },
  
  // scrollContent: {
  //   alignItems: 'center',
  // },
  
  storeCard: {
    backgroundColor: 'transparent', // Make transparent since panel already has background
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    marginHorizontal: Spacing.md,
    minWidth: width - (Spacing.lg * 2),
  },
  
  storeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  storeImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: Spacing.md,
  },
  
  storeImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  
  storeImageEmoji: {
    fontSize: 24,
  },
  
  storeCardInfo: {
    flex: 1,
  },
  
  storeCardName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  
  storeCardCategory: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  
  storeCardAddress: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  
  closeButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    padding: Spacing.xs,
  },
  
  emptyState: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  
  emptyText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  
  emptySubtext: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});
