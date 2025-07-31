
import React, { useState, useEffect } from 'react';
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
  Switch,
} from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import ImageUploader from '../components/ImageUploader';

export default function EditServiceScreen({ route, navigation }) {
  const { service } = route.params;
  const [serviceName, setServiceName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [priceFormat, setPriceFormat] = useState('Fixed Fee');
  const [serviceArea, setServiceArea] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePublicId, setImagePublicId] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (service) {
      setServiceName(service.name);
      setDescription(service.description);
      setPrice(service.price.toString());
      setPriceFormat(service.priceFormat);
      setServiceArea(service.serviceArea);
      setImageUrl(service.imageUrl);
      setImagePublicId(service.imagePublicId);
      setIsAvailable(service.isAvailable);
    }
  }, [service]);

  const handleUpdateService = async () => {
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
      const serviceRef = doc(db, 'services', service.id);
      await updateDoc(serviceRef, {
        name: serviceName,
        description: description,
        price: parseFloat(price),
        priceFormat: priceFormat,
        serviceArea: serviceArea,
        imageUrl: imageUrl,
        imagePublicId: imagePublicId,
        isAvailable: isAvailable,
      });

      Alert.alert('Success', 'Service updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update service');
      console.error('Error updating service:', error);
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
          <Text style={styles.title}>Edit Service</Text>

          <ImageUploader
            onImageUploaded={handleImageUploaded}
            placeholder="Update Service Image or Icon"
            initialImage={imageUrl}
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

          <View style={styles.switchGroup}>
            <Text style={styles.label}>Available</Text>
            <Switch
              value={isAvailable}
              onValueChange={setIsAvailable}
              trackColor={{ false: '#e0e0e0', true: '#27ae60' }}
              thumbColor={isAvailable ? '#fff' : '#f4f3f4'}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleUpdateService}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Updating Service...' : 'Update Service'}
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
});
