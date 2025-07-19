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
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import ImageUploader from '../components/ImageUploader';

export default function EditProductScreen({ route, navigation }) {
  const { product, storeId } = route.params;
  const [productName, setProductName] = useState(product.name);
  const [price, setPrice] = useState(product.price.toString());
  const [description, setDescription] = useState(product.description);
  const [inStock, setInStock] = useState(product.inStock);
  const [imageUrl, setImageUrl] = useState(product.imageUrl);
  const [imagePublicId, setImagePublicId] = useState(product.imagePublicId || '');
  const [loading, setLoading] = useState(false);

  const handleUpdateProduct = async () => {
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
      const productRef = doc(db, 'products', product.id);
      await updateDoc(productRef, {
        name: productName,
        price: parseFloat(price),
        description: description,
        inStock: inStock,
        imageUrl: imageUrl,
        imagePublicId: imagePublicId,
        updatedAt: new Date()
      });

      Alert.alert('Success', 'Product updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update product');
      console.error('Error updating product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = () => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteDoc(doc(db, 'products', product.id));
              Alert.alert('Success', 'Product deleted successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product');
              console.error('Error deleting product:', error);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleImageUploaded = (url, publicId) => {
    setImageUrl(url);
    setImagePublicId(publicId);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          <Text style={styles.title}>Edit Product</Text>
          <Text style={styles.subtitle}>
            Update product information
          </Text>

          <ImageUploader
            onImageUploaded={handleImageUploaded}
            currentImageUrl={imageUrl}
            placeholder="Update Product Image"
          />

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

          <TouchableOpacity
            style={[styles.button, styles.updateButton, loading && styles.buttonDisabled]}
            onPress={handleUpdateProduct}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Updating Product...' : 'Update Product'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={handleDeleteProduct}
            disabled={loading}
          >
            <Text style={[styles.buttonText, styles.deleteButtonText]}>
              Delete Product
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
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  updateButton: {
    backgroundColor: '#3498db',
  },
  deleteButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e74c3c',
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButtonText: {
    color: '#e74c3c',
  },
});
