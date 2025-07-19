import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function StoreCard({ store, onPress, userLocation, showFavoriteIcon = false }) {
  // Simple distance calculation (placeholder for actual geolocation)
  const getDistanceText = () => {
    if (!userLocation) return '';
    // This is a placeholder - in a real app you'd calculate actual distance
    return '0.5 km away';
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.storeInfo}>
          <Text style={styles.storeName}>{store.name}</Text>
          <Text style={styles.storeAddress}>📍 {store.address}</Text>
          {userLocation && (
            <Text style={styles.distance}>{getDistanceText()}</Text>
          )}
        </View>
        {showFavoriteIcon && (
          <Ionicons name="heart" size={20} color="#e74c3c" />
        )}
      </View>
      
      <Text style={styles.storeHours}>🕒 {store.hours}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {store.description}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ecf0f1',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  distance: {
    fontSize: 12,
    color: '#27ae60',
    fontWeight: '600',
  },
  storeHours: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#95a5a6',
    lineHeight: 20,
  },
});
