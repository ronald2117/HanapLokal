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
} from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import ImageUploader from '../components/ImageUploader';

export default function AddServiceScreen({ route, navigation }) {
  const { storeId } = route.params;
  const [serviceName, setServiceName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [priceFormat, setPriceFormat] = useState('Fixed Fee');
  const [serviceArea, setServiceArea] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePublicId, setImagePublicId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddService = async () => {
    if (!serviceName || !price || !description || !serviceArea) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (isNaN(price) || parseFloat(price) < 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, 'services'), {
        name: serviceName,
        description: description,
        price: parseFloat(price),
        priceFormat: priceFormat,
        serviceArea: serviceArea,
        storeId: storeId,
        imageUrl: imageUrl || 'https://via.placeholder.com/300x300?text=No+Image',
        imagePublicId: imagePublicId || null,
        createdAt: new Date(),
      });

      Alert.alert('Success', 'Service added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add service');
      console.error('Error adding service:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUploaded = (url, publicId) => {
    setImageUrl(url);
    setImagePublicId(publicId);
  };

  const renderPriceFormatSelector = () => {
    const formats = ["Fixed Fee", "/hour", "Starts at"];
    return (
      <View style={styles.priceFormatContainer}>
        {formats.map((format) => (
          <TouchableOpacity
            key={format}
            style={[
              styles.priceFormatButton,
              priceFormat === format && styles.priceFormatButtonSelected,
            ]}
            onPress={() => setPriceFormat(format)}
          >
            <Text
              style={[
                styles.priceFormatButtonText,
                priceFormat === format && styles.priceFormatButtonTextSelected,
              ]}
            >
              {format}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <Text style={styles.title}>Add New Service</Text>
          <Text style={styles.subtitle}>
            Add a service to your store offerings
          </Text>

          <ImageUploader
            onImageUploaded={handleImageUploaded}
            placeholder="Add Service Image or Icon"
          />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Service Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Faucet Repair"
              value={serviceName}
              onChangeText={setServiceName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Short Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="e.g., Includes labor and basic tools"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Price Format *</Text>
            {renderPriceFormatSelector()}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Price (₱) *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 500"
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
            />
          </View>


          <View style={styles.inputGroup}>
            <Text style={styles.label}>Service Area / Coverage *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Marikina, Pasig"
              value={serviceArea}
              onChangeText={setServiceArea}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleAddService}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Adding Service...' : 'Add Service'}
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
  scrollContent: {
    paddingBottom: 100,
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
  priceFormatContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  priceFormatButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  priceFormatButtonSelected: {
    backgroundColor: '#27ae60',
    borderColor: '#27ae60',
  },
  priceFormatButtonText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  priceFormatButtonTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
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