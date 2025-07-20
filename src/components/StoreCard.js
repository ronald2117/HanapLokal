import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/theme';

export default function StoreCard({ store, onPress, userLocation, showFavoriteIcon = false }) {
  // Simple distance calculation (placeholder for actual geolocation)
  const getDistanceText = () => {
    if (!userLocation) return '';
    // This is a placeholder - in a real app you'd calculate actual distance
    return '0.5 km away';
  };

  const getStoreTypeIcon = () => {
    const storeType = store.name?.toLowerCase() || '';
    if (storeType.includes('sari') || storeType.includes('tindahan')) return '🏪';
    if (storeType.includes('resto') || storeType.includes('kain')) return '🍽️';
    if (storeType.includes('repair') || storeType.includes('vulca')) return '🔧';
    if (storeType.includes('barbero') || storeType.includes('salon')) return '✂️';
    return '🏪'; // Default store icon
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <View style={styles.storeIconContainer}>
          {store.profileImage ? (
            <Image 
              source={{ uri: store.profileImage }} 
              style={styles.profileImage}
            />
          ) : (
            <Text style={styles.storeIcon}>{getStoreTypeIcon()}</Text>
          )}
        </View>
        
        <View style={styles.storeInfo}>
          <Text style={styles.storeName}>{store.name}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={Colors.text.secondary} />
            <Text style={styles.storeAddress}>{store.address}</Text>
          </View>
          {userLocation && (
            <View style={styles.distanceRow}>
              <Ionicons name="walk-outline" size={12} color={Colors.success} />
              <Text style={styles.distance}>{getDistanceText()}</Text>
            </View>
          )}
        </View>
        
        {showFavoriteIcon && (
          <View style={styles.favoriteIcon}>
            <Ionicons name="heart" size={20} color={Colors.error} />
          </View>
        )}
      </View>
      
      <View style={styles.storeDetails}>
        <View style={styles.hoursRow}>
          <Ionicons name="time-outline" size={14} color={Colors.text.secondary} />
          <Text style={styles.storeHours}>{store.hours}</Text>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {store.description}
        </Text>
      </View>
      
      <View style={styles.cardFooter}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Lokal</Text>
        </View>
        <Ionicons name="arrow-forward-outline" size={16} color={Colors.text.secondary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.base,
    marginHorizontal: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border.light,
    ...Shadows.base,
  },
  
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  
  storeIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  
  storeIcon: {
    fontSize: 24,
  },

  profileImage: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primaryLight,
  },
  
  storeInfo: {
    flex: 1,
  },
  
  storeName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  
  storeAddress: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginLeft: Spacing.xs,
    flex: 1,
  },
  
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  distance: {
    fontSize: Typography.fontSize.xs,
    color: Colors.success,
    fontWeight: Typography.fontWeight.semibold,
    marginLeft: Spacing.xs,
  },
  
  favoriteIcon: {
    padding: Spacing.xs,
  },
  
  storeDetails: {
    marginBottom: Spacing.md,
  },
  
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  
  storeHours: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginLeft: Spacing.xs,
  },
  
  description: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
  },
  
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  
  badge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  
  badgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
});
