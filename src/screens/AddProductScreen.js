import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch
} from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

export default function AddProductScreen({ route, navigation }) {
  const { storeId } = route.params;
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [inStock, setInStock] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleAddProduct = async () => {
    if (!productName || !price || !description) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (isNaN(price) || parseFloat(price) < 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, 'products'), {
        name: productName,
        price: parseFloat(price),
        description: description,
        inStock: inStock,
        storeId: storeId,
        imageUrl: 'https://via.placeholder.com/300x300?text=Product+Image', // Placeholder image
        createdAt: new Date()
      });

      Alert.alert('Success', 'Product added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add product');
      console.error('Error adding product:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          <Text style={styles.title}>Add New Product</Text>
          <Text style={styles.subtitle}>
            Add a product to your store inventory
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter product name"
              value={productName}
              onChangeText={setProductName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Price ($) *</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your product..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.switchGroup}>
            <Text style={styles.label}>In Stock</Text>
            <Switch
              value={inStock}
              onValueChange={setInStock}
              trackColor={{ false: '#e0e0e0', true: '#27ae60' }}
              thumbColor={inStock ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.imageNote}>
            <Text style={styles.noteText}>
              📷 Note: Product images will use placeholder URLs in this MVP. 
              Image upload functionality will be added in future updates.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleAddProduct}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Adding Product...' : 'Add Product'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  imageNote: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  noteText: {
    fontSize: 14,
    color: '#856404',
  },
  button: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
