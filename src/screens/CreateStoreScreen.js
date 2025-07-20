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
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { Colors, Typography, Spacing, BorderRadius } from '../styles/theme';

export default function CreateStoreScreen({ navigation }) {
  const [storeName, setStoreName] = useState('');
  const [address, setAddress] = useState('');
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const { currentUser, isGuestUser } = useAuth();

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

  // If user is a guest, show the guest restriction screen
  if (isGuestUser()) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark, Colors.secondary]}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <ScrollView contentContainerStyle={styles.guestScrollContainer}>
            <View style={styles.guestContainer}>
              {/* Header */}
              <View style={styles.guestHeader}>
                <View style={styles.iconContainer}>
                  <Ionicons name="storefront" size={80} color={Colors.accent} />
                </View>
                <Text style={styles.guestTitle}>Gusto mo bang magkaroon ng sariling tindahan?</Text>
                <Text style={styles.guestSubtitle}>
                  Mga guest user ay hindi pwedeng mag-create ng store. Mag-register muna para sa full access!
                </Text>
              </View>

              {/* Benefits Section */}
              <View style={styles.benefitsContainer}>
                <Text style={styles.benefitsTitle}>Benefits ng pagkakaroon ng Store:</Text>
                
                <View style={styles.benefitItem}>
                  <Ionicons name="cash" size={24} color={Colors.accent} />
                  <Text style={styles.benefitText}>Mag-earn ng extra income</Text>
                </View>
                
                <View style={styles.benefitItem}>
                  <Ionicons name="people" size={24} color={Colors.accent} />
                  <Text style={styles.benefitText}>Maging kilala sa inyong community</Text>
                </View>
                
                <View style={styles.benefitItem}>
                  <Ionicons name="trending-up" size={24} color={Colors.accent} />
                  <Text style={styles.benefitText}>Palakihin ang inyong business</Text>
                </View>
                
                <View style={styles.benefitItem}>
                  <Ionicons name="phone-portrait" size={24} color={Colors.accent} />
                  <Text style={styles.benefitText}>Madaling ma-contact ng mga customers</Text>
                </View>
                
                <View style={styles.benefitItem}>
                  <Ionicons name="shield-checkmark" size={24} color={Colors.accent} />
                  <Text style={styles.benefitText}>Secure at trusted platform</Text>
                </View>
              </View>

              {/* Call to Action */}
              <View style={styles.ctaContainer}>
                <TouchableOpacity
                  style={styles.signupButton}
                  onPress={() => navigation.navigate('Auth', { screen: 'Signup' })}
                >
                  <Ionicons name="person-add" size={20} color={Colors.text.white} style={styles.buttonIcon} />
                  <Text style={styles.signupButtonText}>Mag-register ngayon!</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={styles.backButtonText}>Bumalik sa Home</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </LinearGradient>
      </View>
    );
  }

  const handleCreateStore = async () => {
    try {
      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in to create a store');
        return;
      }

      // Validate form data
      if (!storeName.trim() || !address.trim() || !hours.trim() || !description.trim() || !category) {
        Alert.alert('Error', 'Please fill in all required fields including store category');
        return;
      }

      setLoading(true);

      const storeData = {
        name: storeName.trim(),
        address: address.trim(),
        hours: hours.trim(),
        description: description.trim(),
        category: category,
        profileImage: profileImage || '', // Store the image URI or empty string as placeholder
        coverImage: coverImage || '', // Store the image URI or empty string as placeholder
        ownerId: currentUser.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'stores'), storeData);
      console.log('✅ Store created with ID:', docRef.id);
      
      Alert.alert('Success', 'Store created successfully!', [
        { 
          text: 'OK', 
          onPress: () => {
            // Navigate back to MyStore tab and refresh
            navigation.navigate('MyStoreMain');
          }
        }
      ]);

    } catch (error) {
      console.error('❌ Error creating store:', error);
      Alert.alert('Error', `Failed to create store: ${error.message}`);
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
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <Text style={styles.title}>Create Your Store</Text>
          <Text style={styles.subtitle}>
            Set up your store profile to start connecting with local customers
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
            <Text style={styles.subtitle}>Add profile and cover photos to make your store more attractive</Text>
            
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
                  color={locationLoading ? "#95a5a6" : Colors.primary} 
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
            onPress={handleCreateStore}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating Store...' : 'Create Store'}
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
  
  // Guest User Styles
  gradientBackground: {
    flex: 1,
  },
  
  guestScrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing['2xl'],
  },
  
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  
  guestHeader: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  
  guestTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.text.white,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  
  guestSubtitle: {
    fontSize: Typography.fontSize.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.md,
  },
  
  benefitsContainer: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    shadowColor: Colors.text.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  
  benefitsTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  
  benefitText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    marginLeft: Spacing.lg,
    flex: 1,
    fontWeight: Typography.fontWeight.medium,
  },
  
  ctaContainer: {
    alignItems: 'center',
  },
  
  signupButton: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing['2xl'],
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    minWidth: 200,
    shadowColor: Colors.text.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  
  buttonIcon: {
    marginRight: Spacing.sm,
  },
  
  signupButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.white,
  },
  
  backButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  
  backButtonText: {
    fontSize: Typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  
  // Regular Form Styles
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
    color: Colors.primary,
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
    width: '100%',
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
    width: '100%',
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
    resizeMode: 'cover',
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
