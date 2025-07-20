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
import { getOptimizedImageUrl } from '../services/cloudinaryService';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/theme';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2; // Accounting for padding and margins

export default function ProductCard({ product, onPress, showEditIcon = false }) {
  // Get optimized image URL for better performance
  const optimizedImageUrl = getOptimizedImageUrl(product.imageUrl, {
    width: 200,
    height: 200,
    quality: 'auto',
    format: 'auto'
  });

  const formatPrice = (price) => {
    return `₱${parseFloat(price).toFixed(2)}`;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: optimizedImageUrl }} style={styles.productImage} />
        <View style={styles.imageOverlay}>
          {product.inStock ? (
            <View style={styles.stockBadge}>
              <Text style={styles.stockBadgeText}>Available</Text>
            </View>
          ) : (
            <View style={[styles.stockBadge, styles.outOfStockBadge]}>
              <Text style={[styles.stockBadgeText, styles.outOfStockText]}>Ubos na</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
          <Text style={styles.priceLabel}>lang</Text>
        </View>
        
        <View style={styles.footer}>
          <View style={styles.stockStatus}>
            <Ionicons 
              name={product.inStock ? 'checkmark-circle' : 'close-circle'} 
              size={14} 
              color={product.inStock ? Colors.success : Colors.error} 
            />
            <Text style={[
              styles.stockText,
              { color: product.inStock ? Colors.success : Colors.error }
            ]}>
              {product.inStock ? 'Meron' : 'Wala'}
            </Text>
          </View>
          
          {showEditIcon && (
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="pencil" size={14} color={Colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.xl,
    width: cardWidth,
    marginBottom: Spacing.base,
    overflow: 'hidden',
    ...Shadows.base,
  },
  
  imageContainer: {
    position: 'relative',
  },
  
  productImage: {
    width: '100%',
    height: 140,
    backgroundColor: Colors.background.secondary,
  },
  
  imageOverlay: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
  },
  
  stockBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  
  outOfStockBadge: {
    backgroundColor: Colors.error,
  },
  
  stockBadgeText: {
    color: Colors.text.white,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  
  outOfStockText: {
    color: Colors.text.white,
  },
  
  content: {
    padding: Spacing.md,
  },
  
  productName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    minHeight: 36, // Fixed height for 2 lines
    lineHeight: Typography.lineHeight.tight * Typography.fontSize.sm,
  },
  
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.sm,
  },
  
  productPrice: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  
  priceLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    marginLeft: Spacing.xs,
    fontStyle: 'italic',
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
  
  stockText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    marginLeft: Spacing.xs,
  },
  
  editButton: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.background.secondary,
  },
});
