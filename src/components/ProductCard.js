import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2; // Accounting for padding and margins

export default function ProductCard({ product, onPress, showEditIcon = false }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
      
      <View style={styles.content}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        
        <Text style={styles.productPrice}>${product.price}</Text>
        
        <View style={styles.footer}>
          <View style={styles.stockStatus}>
            <View style={[
              styles.stockIndicator,
              { backgroundColor: product.inStock ? '#27ae60' : '#e74c3c' }
            ]} />
            <Text style={[
              styles.stockText,
              { color: product.inStock ? '#27ae60' : '#e74c3c' }
            ]}>
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </Text>
          </View>
          
          {showEditIcon && (
            <Ionicons name="pencil" size={16} color="#3498db" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: cardWidth,
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
  productImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 6,
    height: 34, // Fixed height for 2 lines
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stockIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
