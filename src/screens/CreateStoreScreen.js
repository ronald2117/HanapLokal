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
import { 
  PROFILE_TYPES, 
  BUSINESS_CATEGORIES, 
  getCategoriesForProfileType,
  getProfileTypeInfo 
} from '../config/categories';

// Helper function to get category info by ID
const getCategoryInfo = (categoryId) => {
  return BUSINESS_CATEGORIES.find(cat => cat.id === categoryId) || { name: 'Unknown Category' };
};

export default function CreateStoreScreen({ navigation }) {
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const [profileTypes, setProfileTypes] = useState([]); // Multi-select
  const [primaryType, setPrimaryType] = useState(''); // Main business type
  const [categories, setCategories] = useState([]); // Multi-select categories
  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [serviceRadius, setServiceRadius] = useState(5);
  const [socialLinks, setSocialLinks] = useState([
    { id: 1, url: '', platform: 'link' },
    { id: 2, url: '', platform: 'link' },
    { id: 3, url: '', platform: 'link' },
    { id: 4, url: '', platform: 'link' }
  ]);
  const [contactNumbers, setContactNumbers] = useState([
    { id: 1, number: '', label: 'Mobile', type: 'mobile' },
    { id: 2, number: '', label: 'Landline', type: 'landline' }
  ]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const { currentUser, isGuestUser } = useAuth();

  // Get available categories based on selected profile types
  const getAvailableCategories = () => {
    if (profileTypes.length === 0) return BUSINESS_CATEGORIES;
    
    const availableCategories = new Set();
    profileTypes.forEach(typeId => {
      getCategoriesForProfileType(typeId).forEach(cat => {
        availableCategories.add(cat);
      });
    });
    
    return Array.from(availableCategories);
  };

  // Function to detect social platform from URL
  const detectPlatform = (url) => {
    if (!url) return 'link';
    
    const normalizedUrl = url.toLowerCase();
    
    if (normalizedUrl.includes('facebook.com') || normalizedUrl.includes('fb.com')) return 'facebook';
    if (normalizedUrl.includes('instagram.com')) return 'instagram';
    if (normalizedUrl.includes('twitter.com') || normalizedUrl.includes('x.com')) return 'twitter';
    if (normalizedUrl.includes('youtube.com') || normalizedUrl.includes('youtu.be')) return 'youtube';
    if (normalizedUrl.includes('tiktok.com')) return 'tiktok';
    if (normalizedUrl.includes('linkedin.com')) return 'linkedin';
    if (normalizedUrl.includes('whatsapp.com') || normalizedUrl.includes('wa.me')) return 'whatsapp';
    if (normalizedUrl.includes('telegram.org') || normalizedUrl.includes('t.me')) return 'telegram';
    if (normalizedUrl.includes('viber.com')) return 'viber';
    if (normalizedUrl.includes('shopee.ph') || normalizedUrl.includes('shopee.com')) return 'shopee';
    if (normalizedUrl.includes('lazada.com.ph') || normalizedUrl.includes('lazada.com')) return 'lazada';
    
    return 'link';
  };

  // Function to get platform icon
  const getPlatformIcon = (platform) => {
    const icons = {
      facebook: 'logo-facebook',
      instagram: 'logo-instagram', 
      twitter: 'logo-twitter',
      youtube: 'logo-youtube',
      tiktok: 'logo-tiktok',
      linkedin: 'logo-linkedin',
      whatsapp: 'logo-whatsapp',
      telegram: 'send',
      viber: 'call',
      shopee: 'storefront',
      lazada: 'bag',
      link: 'link'
    };
    return icons[platform] || 'link';
  };

  // Function to get platform color
  const getPlatformColor = (platform) => {
    const colors = {
      facebook: '#1877F2',
      instagram: '#E4405F',
      twitter: '#1DA1F2', 
      youtube: '#FF0000',
      tiktok: '#000000',
      linkedin: '#0A66C2',
      whatsapp: '#25D366',
      telegram: '#0088CC',
      viber: '#665CAC',
      shopee: '#FF5722',
      lazada: '#0F146D',
      link: '#6B7280'
    };
    return colors[platform] || '#6B7280';
  };

  // Function to update social link
  const updateSocialLink = (id, url) => {
    const platform = detectPlatform(url);
    setSocialLinks(prev => 
      prev.map(link => 
        link.id === id 
          ? { ...link, url: url.trim(), platform }
          : link
      )
    );
  };

  // Function to remove social link
  const removeSocialLink = (id) => {
    setSocialLinks(prev => 
      prev.map(link => 
        link.id === id 
          ? { ...link, url: '', platform: 'link' }
          : link
      )
    );
  };

  // Contact Number Management Functions
  const updateContactNumber = (id, number) => {
    setContactNumbers(prev => 
      prev.map(contact => 
        contact.id === id 
          ? { ...contact, number: number.trim() }
          : contact
      )
    );
  };

  const updateContactLabel = (id, label, type) => {
    setContactNumbers(prev => 
      prev.map(contact => 
        contact.id === id 
          ? { ...contact, label, type }
          : contact
      )
    );
  };

  const addContactNumber = () => {
    if (contactNumbers.length < 3) {
      const newId = Math.max(...contactNumbers.map(c => c.id)) + 1;
      setContactNumbers(prev => [...prev, { 
        id: newId, 
        number: '', 
        label: 'Mobile', 
        type: 'mobile' 
      }]);
    }
  };

  const removeContactNumber = (id) => {
    if (contactNumbers.length > 1) {
      setContactNumbers(prev => prev.filter(contact => contact.id !== id));
    }
  };

  const getContactIcon = (type) => {
    const icons = {
      mobile: 'phone-portrait',
      landline: 'call',
      whatsapp: 'logo-whatsapp',
      viber: 'chatbubble',
      telegram: 'send',
      fax: 'document-text'
    };
    return icons[type] || 'call';
  };

  const getContactColor = (type) => {
    const colors = {
      mobile: '#3498db',
      landline: '#2c3e50',
      whatsapp: '#25D366',
      viber: '#665CAC',
      telegram: '#0088CC',
      fax: '#7f8c8d'
    };
    return colors[type] || '#3498db';
  };

  // If user is a guest, show the guest restriction screen
  if (isGuestUser()) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryLight]}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <ScrollView contentContainerStyle={styles.guestScrollContainer}>
            <View style={styles.guestContainer}>
              {/* Header */}
              <View style={styles.guestHeader}>
                <View style={styles.iconContainer}>
                  <Image 
                    source={require('../../assets/lokalfinds-logo.png')} 
                    style={styles.guestLogo}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.guestTitle}>Ready to start your business journey?</Text>
                <Text style={styles.guestSubtitle}>
                  Join LocalFinds as a Store Owner, Service Provider, Freelancer, or any type of local entrepreneur!
                </Text>
              </View>

              {/* Benefits Section */}
              <View style={styles.benefitsContainer}>
                <Text style={styles.benefitsTitle}>What you can do on LocalFinds:</Text>
                
                <View style={styles.benefitItem}>
                  <Ionicons name="storefront" size={24} color={Colors.accent} />
                  <Text style={styles.benefitText}>Sell products from your store or home</Text>
                </View>
                
                <View style={styles.benefitItem}>
                  <Ionicons name="construct" size={24} color={Colors.accent} />
                  <Text style={styles.benefitText}>Offer services and skilled work</Text>
                </View>
                
                <View style={styles.benefitItem}>
                  <Ionicons name="laptop" size={24} color={Colors.accent} />
                  <Text style={styles.benefitText}>Freelance and showcase your portfolio</Text>
                </View>
                
                <View style={styles.benefitItem}>
                  <Ionicons name="people" size={24} color={Colors.accent} />
                  <Text style={styles.benefitText}>Connect with your local community</Text>
                </View>
                
                <View style={styles.benefitItem}>
                  <Ionicons name="trending-up" size={24} color={Colors.accent} />
                  <Text style={styles.benefitText}>Grow your income and customer base</Text>
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

  const handleCreateBusinessProfile = async () => {
    try {
      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in to create a business profile');
        return;
      }

      // Validate form data
      if (!businessName.trim() || !address.trim() || !hours.trim() || !description.trim()) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      if (profileTypes.length === 0) {
        Alert.alert('Error', 'Please select at least one business type');
        return;
      }

      if (categories.length === 0) {
        Alert.alert('Error', 'Please select at least one business category');
        return;
      }

      if (profileTypes.length > 1 && !primaryType) {
        Alert.alert('Error', 'Please select a primary business type');
        return;
      }

      // Validate contact numbers (minimum 1)
      const validContactNumbers = contactNumbers.filter(contact => contact.number.trim() !== '');
      if (validContactNumbers.length < 1) {
        Alert.alert('Error', 'Please provide at least 1 contact number for your business');
        return;
      }

      setLoading(true);

      // Filter out empty social links
      const validSocialLinks = socialLinks.filter(link => link.url.trim() !== '');

      // Generate search tags from business info
      const searchTags = [
        ...businessName.toLowerCase().split(' '),
        ...description.toLowerCase().split(' ').slice(0, 10), // First 10 words
        ...categories.map(cat => getCategoryInfo(cat).name.toLowerCase()),
        ...profileTypes.map(type => getProfileTypeInfo(type).name.toLowerCase()),
        address.toLowerCase().split(',')[1]?.trim() || '', // City from address
      ].filter(tag => tag.length > 2); // Remove short words

      const businessProfileData = {
        name: businessName.trim(),
        description: description.trim(),
        address: address.trim(),
        location: coordinates ? {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          accuracy: 10
        } : null,
        
        // Profile Configuration
        profileTypes: profileTypes,
        primaryType: primaryType || profileTypes[0],
        categories: categories,
        
        // Business Details
        hours: hours.trim(),
        isActive: true,
        isMobile: isMobile,
        serviceRadius: isMobile ? serviceRadius : 0,
        
        // Media
        profileImage: profileImage || '',
        coverImage: coverImage || '',
        
        // Contact & Social
        contactNumbers: validContactNumbers,
        socialLinks: validSocialLinks,
        
        // Metadata
        ownerId: currentUser.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        
        // Stats
        totalListings: 0,
        totalViews: 0,
        rating: 0,
        reviewCount: 0,
        
        // Search optimization
        searchTags: [...new Set(searchTags)] // Remove duplicates
      };

      const docRef = await addDoc(collection(db, 'businessProfiles'), businessProfileData);
      console.log('✅ Business profile created with ID:', docRef.id);
      
      Alert.alert('Success', 'Business profile created successfully!', [
        { 
          text: 'OK', 
          onPress: () => {
            // Navigate back to MyStore tab and refresh
            navigation.navigate('MyStoreMain');
          }
        }
      ]);

    } catch (error) {
      console.error('❌ Error creating business profile:', error);
      Alert.alert('Error', `Failed to create business profile: ${error.message}`);
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

      // Get current position with high accuracy
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
        timeout: 15000,
        maximumAge: 10000,
      });

      console.log('📍 Current location detected:', {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy
      });

      // Store coordinates for the store
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };
      setCoordinates(coords);

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
          Alert.alert(
            'Location Detected!', 
            `Address: ${formattedAddress}\n\nCoordinates: ${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}\nAccuracy: ${Math.round(location.coords.accuracy)}m`
          );
        } else {
          throw new Error('Could not format address');
        }
      } else {
        throw new Error('No address found for this location');
      }

    } catch (error) {
      console.error('❌ Error getting location:', error);
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
          <Text style={styles.title}>Create Your Business Profile</Text>
          <Text style={styles.subtitle}>
            Set up your profile to start connecting with local customers - whether you're a store owner, service provider, freelancer, or entrepreneur!
          </Text>

          {/* Business Type Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>What type of business are you? *</Text>
            <Text style={styles.sectionSubtitle}>Select all that apply to your business</Text>
            <View style={styles.profileTypeContainer}>
              {PROFILE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.profileTypeButton,
                    profileTypes.includes(type.id) && styles.profileTypeButtonSelected
                  ]}
                  onPress={() => {
                    if (profileTypes.includes(type.id)) {
                      setProfileTypes(prev => prev.filter(t => t !== type.id));
                      if (primaryType === type.id) {
                        setPrimaryType('');
                      }
                    } else {
                      setProfileTypes(prev => [...prev, type.id]);
                      if (!primaryType) {
                        setPrimaryType(type.id);
                      }
                    }
                  }}
                >
                  <View style={styles.profileTypeIcon}>
                    <Ionicons 
                      name={type.icon} 
                      size={28} 
                      color={profileTypes.includes(type.id) ? '#fff' : type.color} 
                    />
                  </View>
                  <View style={styles.profileTypeContent}>
                    <Text style={[
                      styles.profileTypeButtonText,
                      profileTypes.includes(type.id) && styles.profileTypeButtonTextSelected
                    ]}>
                      {type.name}
                    </Text>
                    <TouchableOpacity
                      style={styles.infoButton}
                      onPress={() => {
                        Alert.alert(
                          type.name,
                          type.description,
                          [{ text: 'OK', style: 'default' }]
                        );
                      }}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons 
                        name="information-circle-outline" 
                        size={20} 
                        color={profileTypes.includes(type.id) ? 'rgba(255, 255, 255, 0.8)' : '#7f8c8d'} 
                      />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Primary Type Selection */}
            {profileTypes.length > 1 && (
              <View style={styles.primaryTypeSection}>
                <Text style={styles.label}>Primary Business Type</Text>
                <Text style={styles.sectionSubtitle}>Which one best describes your main business?</Text>
                <View style={styles.primaryTypeContainer}>
                  {profileTypes.map((typeId) => {
                    const type = getProfileTypeInfo(typeId);
                    return (
                      <TouchableOpacity
                        key={typeId}
                        style={[
                          styles.primaryTypeButton,
                          primaryType === typeId && styles.primaryTypeButtonSelected
                        ]}
                        onPress={() => setPrimaryType(typeId)}
                      >
                        <Ionicons 
                          name={type.icon} 
                          size={16} 
                          color={primaryType === typeId ? '#fff' : type.color} 
                        />
                        <Text style={[
                          styles.primaryTypeButtonText,
                          primaryType === typeId && styles.primaryTypeButtonTextSelected
                        ]}>
                          {type.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Business Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your business name"
              value={businessName}
              onChangeText={setBusinessName}
            />
          </View>

          {/* Business Categories */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Business Categories *</Text>
            <Text style={styles.sectionSubtitle}>What categories best describe your business?</Text>
            
            {/* Category Dropdown */}
            <TouchableOpacity 
              style={styles.categoryDropdownButton}
              onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              <View style={styles.categoryDropdownHeader}>
                <Ionicons name="apps" size={20} color={Colors.primary} />
                <Text style={styles.categoryDropdownText}>
                  {categories.length === 0 
                    ? 'Select business categories' 
                    : `${categories.length} categor${categories.length === 1 ? 'y' : 'ies'} selected`
                  }
                </Text>
                <Ionicons 
                  name={showCategoryDropdown ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#7f8c8d" 
                />
              </View>
            </TouchableOpacity>
            
            {/* Selected Categories Preview */}
            {categories.length > 0 && (
              <View style={styles.selectedCategoriesContainer}>
                <Text style={styles.selectedCategoriesLabel}>Selected:</Text>
                <View style={styles.selectedCategoriesGrid}>
                  {categories.map((catId) => {
                    const cat = getAvailableCategories().find(c => c.id === catId);
                    return cat ? (
                      <View key={catId} style={styles.selectedCategoryChip}>
                        <Ionicons name={cat.icon} size={14} color={Colors.primary} />
                        <Text style={styles.selectedCategoryText}>{cat.name}</Text>
                        <TouchableOpacity
                          onPress={() => setCategories(prev => prev.filter(c => c !== catId))}
                          style={styles.removeCategoryButton}
                        >
                          <Ionicons name="close" size={14} color="#e74c3c" />
                        </TouchableOpacity>
                      </View>
                    ) : null;
                  })}
                </View>
              </View>
            )}
            
            {/* Category Dropdown Content */}
            {showCategoryDropdown && (
              <View style={styles.categoryDropdownContent}>
                <ScrollView style={styles.categoryScrollView} nestedScrollEnabled>
                  <View style={styles.categoryGrid}>
                    {getAvailableCategories().map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.categoryGridItem,
                          categories.includes(cat.id) && styles.categoryGridItemSelected
                        ]}
                        onPress={() => {
                          if (categories.includes(cat.id)) {
                            setCategories(prev => prev.filter(c => c !== cat.id));
                          } else {
                            setCategories(prev => [...prev, cat.id]);
                          }
                        }}
                      >
                        <Ionicons 
                          name={cat.icon} 
                          size={20} 
                          color={categories.includes(cat.id) ? '#fff' : Colors.primary} 
                        />
                        <Text style={[
                          styles.categoryGridItemText,
                          categories.includes(cat.id) && styles.categoryGridItemTextSelected
                        ]}>
                          {cat.name}
                        </Text>
                        {categories.includes(cat.id) && (
                          <Ionicons name="checkmark-circle" size={16} color="#fff" style={styles.categoryCheckmark} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}
          </View>

          {/* Business Images Section */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Business Images</Text>
            <Text style={styles.sectionSubtitle}>Add profile and cover photos to make your business more attractive</Text>
            
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

          {/* Service Area & Mobility */}
          {(profileTypes.includes('service-provider') || profileTypes.includes('freelancer') || profileTypes.includes('informal-worker')) && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Service Options</Text>
              
              <View style={styles.mobileServiceContainer}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => setIsMobile(!isMobile)}
                >
                  <Ionicons 
                    name={isMobile ? "checkbox" : "square-outline"} 
                    size={24} 
                    color={isMobile ? "#27ae60" : "#7f8c8d"} 
                  />
                  <Text style={styles.checkboxText}>
                    I can travel to customers (Mobile Service)
                  </Text>
                </TouchableOpacity>
                
                {isMobile && (
                  <View style={styles.radiusContainer}>
                    <Text style={styles.radiusLabel}>Service Radius: {serviceRadius} km</Text>
                    <View style={styles.radiusButtons}>
                      {[3, 5, 10, 15, 20].map(radius => (
                        <TouchableOpacity
                          key={radius}
                          style={[
                            styles.radiusButton,
                            serviceRadius === radius && styles.radiusButtonSelected
                          ]}
                          onPress={() => setServiceRadius(radius)}
                        >
                          <Text style={[
                            styles.radiusButtonText,
                            serviceRadius === radius && styles.radiusButtonTextSelected
                          ]}>
                            {radius}km
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

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
              placeholder="Enter your business address"
              value={address}
              onChangeText={setAddress}
              multiline
            />
            
            {/* Display current coordinates */}
            {coordinates && (
              <View style={styles.coordinateDisplay}>
                <Text style={styles.coordinateText}>
                  📍 GPS Coordinates: {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
                </Text>
                <Text style={styles.coordinateSubtext}>
                  These coordinates will be used for precise map positioning
                </Text>
              </View>
            )}
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
            <Text style={styles.label}>About Your Business *</Text>
            <Text style={styles.sectionSubtitle}>Tell customers about your business, what you offer, your contact info, and your story...</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your business, products/services, contact information (phone, email, etc.), and your story..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
            />
          </View>

          {/* Contact Numbers Section */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Numbers *</Text>
            <Text style={styles.sectionSubtitle}>Add at least 1 contact number for your business (Mobile, Landline, WhatsApp, etc.)</Text>
            
            <View style={styles.contactNumbersContainer}>
              {contactNumbers.map((contact, index) => (
                <View key={contact.id} style={styles.contactNumberItem}>
                  <View style={styles.contactNumberRow}>
                    {/* Contact Type Selector */}
                    <View style={styles.contactTypeContainer}>
                      <View style={[styles.contactTypeIcon, { backgroundColor: getContactColor(contact.type) }]}>
                        <Ionicons 
                          name={getContactIcon(contact.type)} 
                          size={20} 
                          color="#fff" 
                        />
                      </View>
                      <TouchableOpacity 
                        style={styles.contactTypeButton}
                        onPress={() => {
                          // Show contact type picker
                          Alert.alert(
                            'Select Contact Type',
                            'Choose the type of contact number',
                            [
                              { text: 'Mobile', onPress: () => updateContactLabel(contact.id, 'Mobile', 'mobile') },
                              { text: 'Landline', onPress: () => updateContactLabel(contact.id, 'Landline', 'landline') },
                              { text: 'WhatsApp', onPress: () => updateContactLabel(contact.id, 'WhatsApp', 'whatsapp') },
                              { text: 'Viber', onPress: () => updateContactLabel(contact.id, 'Viber', 'viber') },
                              { text: 'Telegram', onPress: () => updateContactLabel(contact.id, 'Telegram', 'telegram') },
                              { text: 'Fax', onPress: () => updateContactLabel(contact.id, 'Fax', 'fax') },
                              { text: 'Cancel', style: 'cancel' }
                            ]
                          );
                        }}
                      >
                        <Text style={styles.contactTypeText}>{contact.label}</Text>
                        <Ionicons name="chevron-down" size={16} color="#7f8c8d" />
                      </TouchableOpacity>
                    </View>
                    
                    {/* Contact Number Input */}
                    <TextInput
                      style={styles.contactNumberInput}
                      placeholder={`Enter ${contact.label.toLowerCase()} number`}
                      value={contact.number}
                      onChangeText={(text) => updateContactNumber(contact.id, text)}
                      keyboardType="phone-pad"
                      autoCorrect={false}
                    />
                    
                    {/* Remove Button (only show if more than 1 contact) */}
                    {contactNumbers.length > 1 && (
                      <TouchableOpacity 
                        style={styles.removeContactButton}
                        onPress={() => removeContactNumber(contact.id)}
                      >
                        <Ionicons name="close-circle" size={24} color="#e74c3c" />
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  {/* Contact Number Preview */}
                  {contact.number !== '' && (
                    <View style={styles.contactPreview}>
                      <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
                      <Text style={styles.contactPreviewText}>
                        {contact.label}: {contact.number}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
              
              {/* Add Contact Button */}
              {contactNumbers.length < 3 && (
                <TouchableOpacity 
                  style={styles.addContactButton}
                  onPress={addContactNumber}
                >
                  <Ionicons name="add-circle" size={24} color="#3498db" />
                  <Text style={styles.addContactText}>Add Another Contact Number</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Social Links Section */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Social Links & Online Presence</Text>
            <Text style={styles.sectionSubtitle}>Add up to 4 links to your social media, website, or online stores (Facebook, Instagram, Shopee, etc.)</Text>
            
            <View style={styles.socialLinksContainer}>
              {socialLinks.map((link, index) => (
                <View key={link.id} style={styles.socialLinkItem}>
                  <View style={styles.socialLinkInputContainer}>
                    <View style={[styles.platformIcon, { backgroundColor: getPlatformColor(link.platform) }]}>
                      <Ionicons 
                        name={getPlatformIcon(link.platform)} 
                        size={20} 
                        color="#fff" 
                      />
                    </View>
                    <TextInput
                      style={styles.socialLinkInput}
                      placeholder={`Link ${index + 1} - Enter URL (e.g., https://facebook.com/yourstore)`}
                      value={link.url}
                      onChangeText={(text) => updateSocialLink(link.id, text)}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="url"
                    />
                    {link.url !== '' && (
                      <TouchableOpacity 
                        style={styles.removeLinkButton}
                        onPress={() => removeSocialLink(link.id)}
                      >
                        <Ionicons name="close" size={20} color="#e74c3c" />
                      </TouchableOpacity>
                    )}
                  </View>
                  {link.url !== '' && (
                    <View style={styles.platformPreview}>
                      <Text style={styles.platformName}>
                        {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)} detected
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleCreateBusinessProfile}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating Profile...' : 'Create Business Profile'}
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
  
  guestLogo: {
    width: 80,
    height: 80,
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
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 28,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  locationButtonDisabled: {
    backgroundColor: '#f8f9fa',
    borderColor: '#ecf0f1',
  },
  locationButtonText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  locationButtonTextDisabled: {
    color: '#95a5a6',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border.light,
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.background.card,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  
  // Category Dropdown Styles
  categoryDropdownButton: {
    backgroundColor: Colors.background.card,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryDropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
  },
  categoryDropdownText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    marginLeft: 12,
    fontWeight: '500',
  },
  categoryDropdownTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    flex: 1,
  },
  closeDropdownButton: {
    padding: 4,
  },
  categoryDropdownContent: {
    backgroundColor: Colors.background.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    maxHeight: 300,
  },
  categoryScrollView: {
    maxHeight: 300,
    padding: 16,
  },
  categoryGrid: {
    paddingBottom: 20,
    gap: 8,
  },
  categoryGridItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    width: '100%', // Single column
    position: 'relative',
  },
  categoryGridItemSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryGridItemText: {
    fontSize: 13,
    color: Colors.text.primary,
    marginLeft: 8,
    fontWeight: '500',
    flex: 1,
  },
  categoryGridItemTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  categoryCheckmark: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  selectedCategoriesContainer: {
    marginTop: 12,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  selectedCategoriesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  selectedCategoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedCategoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  selectedCategoryText: {
    fontSize: 12,
    color: Colors.text.primary,
    marginLeft: 6,
    marginRight: 4,
    fontWeight: '500',
  },
  removeCategoryButton: {
    marginLeft: 4,
  },

  // Profile Type Selection Styles
  profileTypeContainer: {
    marginTop: 12,
  },
  profileTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    width: '100%', // Single column
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  profileTypeButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    borderWidth: 2,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    elevation: 8,
  },
  profileTypeIcon: {
    marginRight: 12,
  },
  profileTypeContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileTypeButtonText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
    lineHeight: 20,
    flex: 1,
  },
  profileTypeButtonTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  infoButton: {
    marginLeft: 8,
    padding: 4,
  },

  // Primary Type Selection
  primaryTypeSection: {
    marginTop: 24,
    padding: 20,
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  primaryTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  primaryTypeButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  primaryTypeButtonText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginLeft: 6,
    fontWeight: '500',
  },
  primaryTypeButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },

  // Mobile Service Styles
  mobileServiceContainer: {
    marginTop: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkboxText: {
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 10,
    fontWeight: '500',
  },
  radiusContainer: {
    marginLeft: 34,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  radiusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  radiusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radiusButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  radiusButtonSelected: {
    backgroundColor: '#27ae60',
    borderColor: '#27ae60',
  },
  radiusButtonText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  radiusButtonTextSelected: {
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
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  coordinateDisplay: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  coordinateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  coordinateSubtext: {
    fontSize: 12,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  
  // Contact Numbers Styles
  contactNumbersContainer: {
    marginTop: 10,
  },
  contactNumberItem: {
    marginBottom: 15,
  },
  contactNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contactTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingRight: 8,
    minWidth: 120,
  },
  contactTypeIcon: {
    width: 40,
    height: 40,
    borderTopLeftRadius: 7,
    borderBottomLeftRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  contactTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
  },
  contactNumberInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  removeContactButton: {
    padding: 4,
  },
  contactPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 130,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f8ff',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#27ae60',
  },
  contactPreviewText: {
    fontSize: 12,
    color: '#27ae60',
    fontWeight: '600',
    marginLeft: 6,
  },
  addContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#3498db',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  addContactText: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '600',
    marginLeft: 8,
  },
  contactNumbersNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  
  // Social Links Styles
  socialLinksContainer: {
    marginTop: 10,
  },
  socialLinkItem: {
    marginBottom: 15,
  },
  socialLinkInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingRight: 10,
  },
  platformIcon: {
    width: 40,
    height: 40,
    borderTopLeftRadius: 7,
    borderBottomLeftRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  socialLinkInput: {
    flex: 1,
    padding: 15,
    fontSize: 14,
    paddingLeft: 0,
  },
  removeLinkButton: {
    padding: 8,
  },
  platformPreview: {
    marginTop: 5,
    paddingLeft: 50,
  },
  platformName: {
    fontSize: 12,
    color: '#27ae60',
    fontWeight: '600',
  },
  socialLinksNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 8,
    lineHeight: 16,
  },
});
