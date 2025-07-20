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
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

export default function EditStoreScreen({ route, navigation }) {
  const { store } = route.params;
  const [storeName, setStoreName] = useState(store.name);
  const [address, setAddress] = useState(store.address);
  const [hours, setHours] = useState(store.hours);
  const [description, setDescription] = useState(store.description);
  const [category, setCategory] = useState(store.category || '');
  const [profileImage, setProfileImage] = useState(store.profileImage || null);
  const [coverImage, setCoverImage] = useState(store.coverImage || null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Store categories
  const storeCategories = [
    { id: 'sari-sari', name: 'Sari-sari Store', icon: 'storefront' },
    { id: 'kainan', name: 'Kainan/Restaurant', icon: 'restaurant' },
    { id: 'laundry', name: 'Laundry Shop', icon: 'shirt' },
    { id: 'vegetables', name: 'Vegetable Store', icon: 'leaf' },
    { id: 'meat', name: 'Meat Shop', icon: 'fish' },
    { id: 'bakery', name: 'Bakery', icon: 'cafe' },
    { id: 'pharmacy', name: 'Pharmacy', icon: 'medical' },
    { id: 'hardware', name: 'Hardware Store', icon: 'hammer' },
    { id: 'clothing', name: 'Clothing Store', icon: 'shirt-outline' },
    { id: 'electronics', name: 'Electronics', icon: 'phone-portrait' },
    { id: 'beauty', name: 'Beauty Salon', icon: 'cut' },
    { id: 'automotive', name: 'Automotive Shop', icon: 'car' },
    { id: 'other', name: 'Other', icon: 'business' },
  ];

  const handleUpdateStore = async () => {
    if (!storeName || !address || !hours || !description || !category) {
      Alert.alert('Error', 'Please fill in all fields including store category');
      return;
    }

    try {
      setLoading(true);
      const storeRef = doc(db, 'stores', store.id);
      await updateDoc(storeRef, {
        name: storeName,
        address: address,
        hours: hours,
        description: description,
        category: category,
        profileImage: profileImage || '',
        coverImage: coverImage || '',
        updatedAt: new Date()
      });

      Alert.alert('Success', 'Store updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update store');
      console.error('Error updating store:', error);
    } finally {
      setLoading(false);
    }
  };

  // Image picker functions
  const pickImage = async (imageType) => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert("Permission Required", "Permission to access camera roll is required!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: imageType === 'profile' ? [1, 1] : [16, 9], // Square for profile, widescreen for cover
        quality: 0.8,
      });

      if (!result.canceled) {
        if (imageType === 'profile') {
          setProfileImage(result.assets[0].uri);
        } else {
          setCoverImage(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const removeImage = (imageType) => {
    if (imageType === 'profile') {
      setProfileImage(null);
    } else {
      setCoverImage(null);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);

      // Request permission to access location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to auto-detect your address. Please enable location access in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Settings', 
              onPress: () => {
                Location.requestForegroundPermissionsAsync();
              }
            }
          ]
        );
        return;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
      });

      // Reverse geocode to get address
      const addresses = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (addresses && addresses.length > 0) {
        const addr = addresses[0];
        
        // Format the address
        let formattedAddress = '';
        if (addr.streetNumber) formattedAddress += addr.streetNumber + ' ';
        if (addr.street) formattedAddress += addr.street + ', ';
        if (addr.district) formattedAddress += addr.district + ', ';
        if (addr.city) formattedAddress += addr.city + ', ';
        if (addr.region) formattedAddress += addr.region + ', ';
        if (addr.country) formattedAddress += addr.country;
        
        // Remove trailing comma and space
        formattedAddress = formattedAddress.replace(/,\s*$/, '');
        
        if (formattedAddress) {
          setAddress(formattedAddress);
          Alert.alert('Success', 'Location detected successfully!');
        } else {
          throw new Error('Could not format address');
        }
      } else {
        throw new Error('No address found for this location');
      }

    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Could not detect your location. Please enter your address manually.',
        [{ text: 'OK' }]
      );
    } finally {
      setLocationLoading(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={true}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled={true}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.form}>
          <Text style={styles.title}>Edit Store</Text>
          <Text style={styles.subtitle}>
            Update your store information
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Store Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your store name"
              value={storeName}
              onChangeText={setStoreName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Store Category *</Text>
            <Text style={styles.subtitle}>Select what type of store you have</Text>
            <View style={styles.categoryContainer}>
              {storeCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryButton,
                    category === cat.id && styles.categoryButtonSelected
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Ionicons 
                    name={cat.icon} 
                    size={20} 
                    color={category === cat.id ? '#fff' : '#3498db'} 
                  />
                  <Text style={[
                    styles.categoryButtonText,
                    category === cat.id && styles.categoryButtonTextSelected
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Store Images Section */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Store Images</Text>
            <Text style={styles.subtitle}>Update your store's profile and cover photos</Text>
            
            {/* Profile Image */}
            <View style={styles.imageSection}>
              <Text style={styles.imageLabel}>Profile Picture</Text>
              <View style={styles.imageContainer}>
                {profileImage ? (
                  <View style={styles.selectedImageContainer}>
                    <Image source={{ uri: profileImage }} style={styles.profileImagePreview} />
                    <TouchableOpacity 
                      style={styles.removeImageButton} 
                      onPress={() => removeImage('profile')}
                    >
                      <Ionicons name="close-circle" size={24} color="#e74c3c" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.addImageButton} 
                    onPress={() => pickImage('profile')}
                  >
                    <Ionicons name="camera" size={40} color="#bdc3c7" />
                    <Text style={styles.addImageText}>Add Profile Picture</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Cover Image */}
            <View style={styles.imageSection}>
              <Text style={styles.imageLabel}>Cover Photo</Text>
              <View style={styles.imageContainer}>
                {coverImage ? (
                  <View style={styles.selectedImageContainer}>
                    <Image source={{ uri: coverImage }} style={styles.coverImagePreview} />
                    <TouchableOpacity 
                      style={styles.removeImageButton} 
                      onPress={() => removeImage('cover')}
                    >
                      <Ionicons name="close-circle" size={24} color="#e74c3c" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.addCoverImageButton} 
                    onPress={() => pickImage('cover')}
                  >
                    <Ionicons name="image" size={40} color="#bdc3c7" />
                    <Text style={styles.addImageText}>Add Cover Photo</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Address *</Text>
              <TouchableOpacity
                style={[styles.locationButton, locationLoading && styles.locationButtonDisabled]}
                onPress={getCurrentLocation}
                disabled={locationLoading}
              >
                <Ionicons 
                  name={locationLoading ? "reload" : "location"} 
                  size={16} 
                  color={locationLoading ? "#95a5a6" : "#3498db"} 
                />
                <Text style={[styles.locationButtonText, locationLoading && styles.locationButtonTextDisabled]}>
                  {locationLoading ? 'Detecting...' : 'Use Current Location'}
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter your store address"
              value={address}
              onChangeText={setAddress}
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Operating Hours *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Mon-Fri: 9AM-6PM, Sat-Sun: 10AM-4PM"
              value={hours}
              onChangeText={setHours}
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>About Your Store *</Text>
            <Text style={styles.subtitle}>Tell customers about your store, what you sell, your contact info, and your story...</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your store, products, contact information (phone, email, etc.), and your story..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleUpdateStore}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Updating Store...' : 'Update Store'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // Increased padding at bottom for better scrolling
  },
  form: {
    flex: 1,
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
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  locationButtonDisabled: {
    backgroundColor: '#f8f9fa',
    borderColor: '#ecf0f1',
  },
  locationButtonText: {
    color: '#3498db',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  locationButtonTextDisabled: {
    color: '#95a5a6',
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
    height: 120,
    textAlignVertical: 'top',
  },
  // Category Selection Styles
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  categoryButtonSelected: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  categoryButtonText: {
    fontSize: 12,
    color: '#3498db',
    marginLeft: 6,
    fontWeight: '500',
  },
  categoryButtonTextSelected: {
    color: '#fff',
  },
  // Image Selection Styles
  imageSection: {
    marginBottom: 20,
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  imageContainer: {
    alignItems: 'center',
  },
  addImageButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#ecf0f1',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
  },
  addCoverImageButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#ecf0f1',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 120,
  },
  addImageText: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  selectedImageContainer: {
    position: 'relative',
  },
  profileImagePreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#3498db',
  },
  coverImagePreview: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#3498db',
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
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
