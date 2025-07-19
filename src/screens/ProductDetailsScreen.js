import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image
} from 'react-native';

export default function ProductDetailsScreen({ route }) {
  const { product } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
      
      <View style={styles.content}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productPrice}>${product.price}</Text>
        
        <View style={styles.statusContainer}>
          <Text style={[
            styles.statusText,
            { color: product.inStock ? '#27ae60' : '#e74c3c' }
          ]}>
            {product.inStock ? '✅ In Stock' : '❌ Out of Stock'}
          </Text>
        </View>

        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  productImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
    backgroundColor: '#ecf0f1',
  },
  content: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  productPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 15,
  },
  statusContainer: {
    marginBottom: 20,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  descriptionSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#7f8c8d',
    lineHeight: 24,
  },
});
