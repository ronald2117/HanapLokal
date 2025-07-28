import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView,
  Image,
  StatusBar
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/theme';
import { getCategoryInfo } from '../config/categories';

const { width, height } = Dimensions.get('window');

export default function StoreMapScreen({ route, navigation }) {
  const { stores = [] } = route.params || {};
  const [userLocation, setUserLocation] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);

  useEffect(() => {
    getUserLocation();
    
    // Debug: Log stores and their coordinates
    console.log('🏪 Stores received in StoreMapScreen:', stores.length);
    stores.forEach(store => {
      console.log(`Store: ${store.name}`, {
        hasBusinessProfileLocation: !!(store.location && store.location.latitude),
        hasLegacyCoordinates: !!(store.coordinates && store.coordinates.latitude),
        businessProfileLocation: store.location,
        legacyCoordinates: store.coordinates
      });
    });
  }, [stores]);

  useEffect(() => {
    if (stores.length > 0 && mapRef.current) {
      // If only one store (from StoreDetailsScreen), focus on that store immediately
      if (stores.length === 1) {
        const storeCoords = getStoreCoordinates(stores[0]);
        mapRef.current.animateToRegion({
          latitude: storeCoords.latitude,
          longitude: storeCoords.longitude,
          latitudeDelta: 0.01, // Zoom in close to the store
          longitudeDelta: 0.01,
        }, 1000);
        
        // Auto-select the store
        setSelectedStore(stores[0]);
      } else {
        // For multiple stores, fit map to show all stores using actual GPS coordinates
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
    // Use new business profile location format first (this is what CreateStoreScreen saves)
    if (store.location && store.location.latitude && store.location.longitude) {
      console.log(`📍 Using business profile GPS coordinates for ${store.name}:`, store.location);
      return {
        latitude: store.location.latitude,
        longitude: store.location.longitude
      };
    }
    
    // Fallback to legacy coordinates format for backward compatibility
    if (store.coordinates && store.coordinates.latitude && store.coordinates.longitude) {
      console.log(`📍 Using legacy GPS coordinates for ${store.name}:`, store.coordinates);
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

  // Group stores by their coordinates to handle clustering
  const groupStoresByLocation = () => {
    const groups = {};
    
    stores.forEach(store => {
      const coords = getStoreCoordinates(store);
      const key = `${coords.latitude.toFixed(4)}_${coords.longitude.toFixed(4)}`;
      
      if (!groups[key]) {
        groups[key] = {
          coordinate: coords,
          stores: []
        };
      }
      groups[key].stores.push(store);
    });
    
    return Object.values(groups);
  };

  // Remove the local getCategoryInfo function - we'll use the centralized one
  // and handle markers with a simpler approach for now

  const renderMarker = (group, groupIndex) => {
    const { coordinate, stores } = group;
    const storeCount = stores.length;
    const isCluster = storeCount > 1;
    const isSelected = selectedStore && stores.some(store => store.id === selectedStore.id);

    // For single store, show a simple dot, for cluster show count
    // Icons in map markers are complex, so we'll use simple markers
    const displayContent = isCluster ? storeCount : '•';

    return (
      <Marker
        key={`group-${groupIndex}`}
        coordinate={coordinate}
        onPress={() => {
          if (isCluster) {
            // For clusters, select the first store or cycle through them
            const currentIndex = selectedStore ? stores.findIndex(s => s.id === selectedStore.id) : -1;
            const nextIndex = (currentIndex + 1) % stores.length;
            setSelectedStore(stores[nextIndex]);
          } else {
            // For single stores, select the store
            setSelectedStore(stores[0]);
          }
        }}
        anchor={{ x: 0.5, y: 0.5 }}
        centerOffset={{ x: 0, y: 0 }}
        style={{ width: 50, height: 50}}
      >
        <View style={[
          styles.markerWrapper,
          { transform: [{ scale: isSelected ? 1.1 : 1 }] }
        ]}>
          
          {/* Main marker */}
          <View style={[
            styles.markerContainer,
            isCluster ? styles.clusterMarker : styles.singleMarker,
            {
              borderColor: isSelected ? Colors.accent : Colors.primary,
              shadowColor: isSelected ? Colors.accent : Colors.primary,
            }
          ]}>
            {isCluster ? (
              <Text style={[
                styles.clusterText,
                { 
                  fontSize: isSelected ? 16 : 14,
                  color: Colors.text.white 
                }
              ]}>
                {displayContent}
              </Text>
            ) : (
              <Text style={[
                styles.markerText,
                { fontSize: isSelected ? 20 : 18 }
              ]}>
                {displayContent}
              </Text>
            )}
          </View>
        </View>
      </Marker>
    );
  };

  return (
    <View style={styles.container}>
      
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryLight]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
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
      </LinearGradient>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={
          stores.length === 1 
            ? (() => {
                const storeCoords = getStoreCoordinates(stores[0]);
                return {
                  latitude: storeCoords.latitude,
                  longitude: storeCoords.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                };
              })()
            : userLocation || {
                latitude: 14.5995,
                longitude: 120.9842,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }
        }
        showsUserLocation={true}
        showsMyLocationButton={true}
        loadingEnabled={loading}
      >
        {groupStoresByLocation().map((group, index) => renderMarker(group, index))}
      </MapView>

      {/* Store Info Panel */}
      {selectedStore && (
        <View style={[styles.storeInfoPanel]}>
          {/* Panel Header for clusters */}
          {(() => {
            const selectedCoords = getStoreCoordinates(selectedStore);
            const nearbyStores = stores.filter(store => {
              const coords = getStoreCoordinates(store);
              return Math.abs(coords.latitude - selectedCoords.latitude) < 0.0001 &&
                     Math.abs(coords.longitude - selectedCoords.longitude) < 0.0001;
            });

            return (
              <>
                {nearbyStores.length > 1 && (
                  <View style={styles.panelHeader}>
                    <Text style={styles.panelHeaderText}>
                      {nearbyStores.length} stores at this location
                    </Text>
                    <Text style={styles.panelHeaderSubtext}>
                      Swipe to browse • Tap to view details
                    </Text>
                  </View>
                )}
                
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.scrollContainer}
                  contentContainerStyle={styles.scrollContent}
                  pagingEnabled={nearbyStores.length > 1}
                  snapToInterval={nearbyStores.length > 1 ? width - (Spacing.lg * 2) + Spacing.md : undefined}
                  decelerationRate="fast"
                >
                  {nearbyStores.map((store, index) => (
                    <TouchableOpacity
                      key={store.id}
                      style={[
                        styles.storeCard,
                        nearbyStores.length > 1 ? styles.storeCardInCluster : null,
                        { 
                          opacity: store.id === selectedStore.id ? 1 : 0.8,
                          borderWidth: store.id === selectedStore.id ? 2 : 0,
                          borderColor: Colors.primary
                        }
                      ]}
                      onPress={() => {
                        setSelectedStore(store);
                        navigation.navigate('StoreDetails', { store });
                      }}
                    >
                      <View style={styles.storeCardHeader}>
                        {store.profileImage ? (
                          <Image 
                            source={{ uri: store.profileImage }} 
                            style={styles.storeImage}
                          />
                        ) : (
                          <View style={styles.storeImagePlaceholder}>
                            <Ionicons 
                              name={getCategoryInfo(store.category).icon} 
                              size={24} 
                              color={Colors.primary} 
                            />
                          </View>
                        )}
                        <View style={styles.storeCardInfo}>
                          <View style={styles.storeCardTitleRow}>
                            <Text style={styles.storeCardName}>{store.name}</Text>
                            {nearbyStores.length > 1 && (
                              <View style={styles.storeIndexBadge}>
                                <Text style={styles.storeIndexText}>
                                  {index + 1}/{nearbyStores.length}
                                </Text>
                              </View>
                            )}
                          </View>
                          {store.category && (
                            <Text style={styles.storeCardCategory}>
                              {getCategoryInfo(store.category).name}
                            </Text>
                          )}
                          <Text style={styles.storeCardAddress} numberOfLines={2}>
                            {store.address}
                          </Text>
                        </View>
                      </View>
                      
                      {/* Action buttons for clustered stores */}
                      {nearbyStores.length > 1 && (
                        <View style={styles.storeCardActions}>
                          <TouchableOpacity
                            style={styles.selectButton}
                            onPress={(e) => {
                              e.stopPropagation();
                              setSelectedStore(store);
                            }}
                          >
                            <Ionicons 
                              name={store.id === selectedStore.id ? "checkmark-circle" : "radio-button-off"} 
                              size={20} 
                              color={store.id === selectedStore.id ? Colors.success : Colors.text.secondary} 
                            />
                            <Text style={[
                              styles.selectButtonText,
                              { color: store.id === selectedStore.id ? Colors.success : Colors.text.secondary }
                            ]}>
                              {store.id === selectedStore.id ? "Selected" : "Select"}
                            </Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity
                            style={styles.viewButton}
                            onPress={(e) => {
                              e.stopPropagation();
                              navigation.navigate('StoreDetails', { store });
                            }}
                          >
                            <Ionicons name="eye" size={20} color={Colors.primary} />
                            <Text style={styles.viewButtonText}>View</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                      
                      {/* Close button only on first card */}
                      {index === 0 && (
                        <TouchableOpacity
                          style={styles.closeButton}
                          onPress={() => setSelectedStore(null)}
                        >
                          <Ionicons name="close" size={20} color={Colors.text.secondary} />
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            );
          })()}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  
  headerGradient: {
    ...Shadows.base,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    paddingTop: 45,
    paddingHorizontal: Spacing.lg,
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
  
  markerWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },

  markerGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    top: 0,
    left: 0,
  },
  
  markerContainer: {
    width: 30,
    height: 30,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    position: 'relative',
    zIndex: 1,
  },

  singleMarker: {
    backgroundColor: Colors.background.card,
    borderColor: Colors.primary,
  },

  clusterMarker: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryDark,
  },

  selectionDot: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.background.card,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 2,
  },

  markerText: {
    fontSize: 16,
    textAlign: 'center',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    textShadowColor: 'rgba(0,0,0,0.1)',
  },

  clusterText: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    color: Colors.text.white,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    textShadowColor: 'rgba(0,0,0,0.3)',
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
    maxHeight: 280, // Increased height for clustered stores
    ...Shadows.large,
    elevation: 10,
    zIndex: 1000,
  },

  panelHeader: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },

  panelHeaderText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    textAlign: 'center',
  },

  panelHeaderSubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 2,
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
    backgroundColor: 'transparent',
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    marginHorizontal: Spacing.md,
    minWidth: width - (Spacing.lg * 2),
  },

  storeCardInCluster: {
    backgroundColor: Colors.background.secondary,
    marginHorizontal: Spacing.sm,
    minWidth: width - (Spacing.lg * 3),
  },

  storeCardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },

  storeIndexBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },

  storeIndexText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.white,
    fontWeight: Typography.fontWeight.bold,
  },

  storeCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },

  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    flex: 1,
    marginRight: Spacing.sm,
  },

  selectButtonText: {
    fontSize: Typography.fontSize.sm,
    marginLeft: Spacing.sm,
    fontWeight: Typography.fontWeight.medium,
  },

  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    flex: 1,
    marginLeft: Spacing.sm,
  },

  viewButtonText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    marginLeft: Spacing.sm,
    fontWeight: Typography.fontWeight.medium,
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
  
  storeImageIcon: {
    fontSize: 24,
  },
  
  storeCardInfo: {
    flex: 1,
  },
  
  storeCardName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    flex: 1,
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
