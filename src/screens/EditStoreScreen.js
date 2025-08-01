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
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { BUSINESS_CATEGORIES, PROFILE_TYPES } from '../config/categories';
import { Colors, Typography, Spacing, BorderRadius } from '../styles/theme';

export default function EditStoreScreen({ route, navigation }) {
  const { store } = route.params;
  const { currentUser, isGuestUser } = useAuth();
  const { t } = useLanguage();
  
  const [businessName, setBusinessName] = useState(store.name);
  const [address, setAddress] = useState(store.address);
  const [hours, setHours] = useState(store.hours);
  const [description, setDescription] = useState(store.description);
  const [profileType, setProfileType] = useState(store.profileType || '');
  const [categories, setCategories] = useState(Array.isArray(store.categories) ? store.categories : []);
  const [profileImage, setProfileImage] = useState(store.profileImage || null);
  const [coverImage, setCoverImage] = useState(store.coverImage || null);
  const [coordinates, setCoordinates] = useState(store.coordinates || null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(store.isMobile || false);
  const [serviceRadius, setServiceRadius] = useState(store.serviceRadius || 5);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showProfileTypeDropdown, setShowProfileTypeDropdown] = useState(false);
  const [socialLinks, setSocialLinks] = useState(() => {
    // Initialize with existing social links or empty ones
    const existingLinks = store.socialLinks || [];
    const links = [];
    
    // Fill with existing links
    for (let i = 0; i < 4; i++) {
      if (i < existingLinks.length) {
        links.push(existingLinks[i]);
      } else {
        links.push({ id: i + 1, url: '', platform: 'link' });
      }
    }
    
    return links;
  });
  const [contactNumbers, setContactNumbers] = useState(() => {
    // Initialize with existing contact numbers or defaults
    const existingContacts = store.contactNumbers || [];
    const contacts = [];
    
    // Fill with existing contacts
    for (let i = 0; i < 2; i++) {
      if (i < existingContacts.length) {
        contacts.push(existingContacts[i]);
      } else {
        contacts.push({ 
          id: i + 1, 
          number: '', 
          label: i === 0 ? 'Mobile' : 'Landline', 
          type: i === 0 ? 'mobile' : 'landline' 
        });
      }
    }
    
    return contacts;
  });

  // Get available categories based on selected profile type
  const getAvailableCategories = () => {
    if (!profileType) return [];
    return BUSINESS_CATEGORIES.filter(category => 
      category.types.includes(profileType)
    );
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
    const newId = Math.max(...contactNumbers.map(c => c.id)) + 1;
    setContactNumbers(prev => [...prev, {
      id: newId,
      number: '',
      label: 'Mobile',
      type: 'mobile'
    }]);
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
      telegram: 'send',
      viber: 'call-outline',
      other: 'chatbubble'
    };
    return icons[type] || 'call';
  };

  const getContactColor = (type) => {
    const colors = {
      mobile: '#27ae60',
      landline: '#3498db',
      whatsapp: '#25D366',
      telegram: '#0088CC',
      viber: '#665CAC',
      other: '#95a5a6'
    };
    return colors[type] || '#95a5a6';
  };

  const handleUpdateStore = async () => {
    if (!businessName || !address || !hours || !description || !profileType || (categories || []).length === 0) {
      Alert.alert('Error', 'Please fill in all required fields including profile type and categories');
      return;
    }

    try {
      setLoading(true);
      
      // Filter out empty social links and contact numbers
      const validSocialLinks = socialLinks.filter(link => link.url.trim() !== '');
      const validContactNumbers = contactNumbers.filter(contact => contact.number.trim() !== '');
      
      const businessProfileRef = doc(db, 'businessProfiles', store.id);
      await updateDoc(businessProfileRef, {
        name: businessName,
        profileType: profileType,
        categories: categories,
        address: address,
        hours: hours,
        description: description,
        profileImage: profileImage || '',
        coverImage: coverImage || '',
        coordinates: coordinates ? {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          accuracy: 10
        } : null,
        socialLinks: validSocialLinks,
        contactNumbers: validContactNumbers,
        isMobile: isMobile,
        serviceRadius: isMobile ? serviceRadius : null,
        updatedAt: new Date()
      });

      Alert.alert('Success', 'Business profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update business profile');
      console.error('Error updating business profile:', error);
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

      console.log('🔍 Requesting high-accuracy location for store update...');

      // Get current position with enhanced accuracy
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation, // Highest accuracy for GPS coordinates
        timeout: 15000, // Increased timeout for better accuracy
        maximumAge: 0, // Don't use cached location
      });

      console.log('📍 Current location detected:', {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy
      });

      // Store coordinates for the store
      const newCoordinates = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setCoordinates(newCoordinates);

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
            'Location Updated!', 
            `Address: ${formattedAddress}\n\nCoordinates: ${newCoordinates.latitude.toFixed(6)}, ${newCoordinates.longitude.toFixed(6)}\nAccuracy: ${Math.round(location.coords.accuracy)}m`
          );
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

  // For testing: Allow manual coordinate input (development only)
  const setTestCoordinates = () => {
    Alert.prompt(
      'Update Test Coordinates',
      'Enter coordinates as: latitude,longitude\n(Example: 14.5995,120.9842 for Manila)',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Set',
          onPress: (input) => {
            try {
              const [lat, lng] = input.split(',').map(coord => parseFloat(coord.trim()));
              if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
                setCoordinates({ latitude: lat, longitude: lng });
                Alert.alert(
                  'Test Coordinates Updated!', 
                  `Latitude: ${lat}\nLongitude: ${lng}\n\nNote: This is for testing only.`
                );
              } else {
                Alert.alert('Error', 'Invalid format. Use: latitude,longitude');
              }
            } catch (error) {
              Alert.alert('Error', 'Invalid format. Use: latitude,longitude');
            }
          },
        },
      ],
      'plain-text',
      coordinates ? `${coordinates.latitude},${coordinates.longitude}` : '14.5995,120.9842'
    );
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
          <Text style={styles.title}>{t('editStore')}</Text>
          <Text style={styles.subtitle}>
            {t('updateStoreInformation')}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('businessName')} *</Text>
            <TextInput
              style={styles.input}
              placeholder={t('enterBusinessName')}
              value={businessName}
              onChangeText={setBusinessName}
            />
          </View>

          {/* Profile Type Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('profileType')} *</Text>
            <Text style={styles.sectionSubtitle}>
              {t('selectProfileTypeDescription')}
            </Text>
            
            <TouchableOpacity
              style={styles.profileTypeDropdownButton}
              onPress={() => setShowProfileTypeDropdown(!showProfileTypeDropdown)}
            >
              <View style={styles.profileTypeDropdownHeader}>
                <Ionicons 
                  name={profileType ? PROFILE_TYPES.find(p => p.id === profileType)?.icon : 'business'} 
                  size={20} 
                  color={Colors.primary} 
                />
                <Text style={styles.profileTypeDropdownText}>
                  {profileType ? PROFILE_TYPES.find(p => p.id === profileType)?.name : t('selectProfileType')}
                </Text>
                <Ionicons 
                  name={showProfileTypeDropdown ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={Colors.text.secondary} 
                />
              </View>
              
              {showProfileTypeDropdown && (
                <View style={styles.profileTypeDropdownContent}>
                  <ScrollView 
                    style={styles.profileTypeScrollView}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                  >
                    <View style={styles.profileTypeList}>
                      {PROFILE_TYPES.map((type) => (
                        <TouchableOpacity
                          key={type.id}
                          style={[
                            styles.profileTypeItem,
                            profileType === type.id && styles.profileTypeItemSelected
                          ]}
                          onPress={() => {
                            setProfileType(type.id);
                            setCategories([]); // Reset categories when profile type changes
                            setShowProfileTypeDropdown(false);
                          }}
                        >
                          <Ionicons 
                            name={type.icon} 
                            size={24} 
                            color={profileType === type.id ? '#fff' : Colors.primary}
                            style={styles.profileTypeItemIcon}
                          />
                          <View style={styles.profileTypeItemContent}>
                            <Text style={[
                              styles.profileTypeItemText,
                              profileType === type.id && styles.profileTypeItemTextSelected
                            ]}>
                              {type.name}
                            </Text>
                            <Text style={[
                              styles.profileTypeItemDescription,
                              profileType === type.id && styles.profileTypeItemDescriptionSelected
                            ]}>
                              {type.description}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Categories Selection */}
          {profileType && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('categories')} *</Text>
              <Text style={styles.sectionSubtitle}>
                {t('selectCategoriesDescription')}
              </Text>
              
              <TouchableOpacity
                style={styles.categoryDropdownButton}
                onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
              >
                <View style={styles.categoryDropdownHeader}>
                  <Ionicons name="grid" size={20} color={Colors.primary} />
                  <Text style={styles.categoryDropdownTitle}>
                    {(categories || []).length > 0 ? `${(categories || []).length} ${t('categoriesSelected')}` : t('selectCategories')}
                  </Text>
                  <TouchableOpacity 
                    style={styles.closeDropdownButton}
                    onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  >
                    <Ionicons 
                      name={showCategoryDropdown ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color={Colors.text.secondary} 
                    />
                  </TouchableOpacity>
                </View>
                
                {showCategoryDropdown && (
                  <View style={styles.categoryDropdownContent}>
                    <ScrollView 
                      style={styles.categoryScrollView}
                      nestedScrollEnabled={true}
                      showsVerticalScrollIndicator={true}
                    >
                      <View style={styles.categoryGrid}>
                        {getAvailableCategories().map((category) => (
                          <TouchableOpacity
                            key={category.id}
                            style={[
                              styles.categoryGridItem,
                              (categories || []).includes(category.id) && styles.categoryGridItemSelected
                            ]}
                            onPress={() => {
                              const currentCategories = categories || [];
                              if (currentCategories.includes(category.id)) {
                                setCategories(prev => (prev || []).filter(id => id !== category.id));
                              } else {
                                setCategories(prev => [...(prev || []), category.id]);
                              }
                            }}
                          >
                            <Ionicons 
                              name={category.icon} 
                              size={16} 
                              color={(categories || []).includes(category.id) ? '#fff' : Colors.primary}
                            />
                            <Text style={[
                              styles.categoryGridItemText,
                              (categories || []).includes(category.id) && styles.categoryGridItemTextSelected
                            ]}>
                              {category.name}
                            </Text>
                            {(categories || []).includes(category.id) && (
                              <Ionicons 
                                name="checkmark-circle" 
                                size={16} 
                                color="#fff"
                                style={styles.categoryCheckmark}
                              />
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                )}
              </TouchableOpacity>
              
              {/* Selected Categories Display */}
              {(categories || []).length > 0 && (
                <View style={styles.selectedCategoriesContainer}>
                  <Text style={styles.selectedCategoriesLabel}>{t('selectedCategories')}:</Text>
                  <View style={styles.selectedCategoriesGrid}>
                    {(categories || []).map((categoryId) => {
                      const category = BUSINESS_CATEGORIES.find(cat => cat.id === categoryId);
                      return (
                        <View key={categoryId} style={styles.selectedCategoryChip}>
                          <Ionicons name={category?.icon} size={12} color={Colors.primary} />
                          <Text style={styles.selectedCategoryText}>{category?.name}</Text>
                          <TouchableOpacity 
                            onPress={() => setCategories(prev => (prev || []).filter(id => id !== categoryId))}
                            style={styles.removeCategoryButton}
                          >
                            <Ionicons name="close" size={12} color={Colors.text.secondary} />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Mobile Service Section */}
          {profileType === 'service-provider' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('serviceType')}</Text>
              <Text style={styles.sectionSubtitle}>
                {t('serviceTypeDescription')}
              </Text>
              
              <View style={styles.mobileServiceContainer}>
                <TouchableOpacity 
                  style={styles.checkboxContainer}
                  onPress={() => setIsMobile(!isMobile)}
                >
                  <Ionicons 
                    name={isMobile ? "checkbox" : "square-outline"} 
                    size={24} 
                    color={isMobile ? Colors.primary : Colors.text.secondary} 
                  />
                  <Text style={styles.checkboxText}>{t('mobileService')}</Text>
                </TouchableOpacity>
                
                {isMobile && (
                  <View style={styles.radiusContainer}>
                    <Text style={styles.radiusLabel}>{t('serviceRadius')}</Text>
                    <View style={styles.radiusButtons}>
                      {[1, 3, 5, 10, 15, 20].map((radius) => (
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

          {/* Contact Numbers Section */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('contactNumbers')}</Text>
            <Text style={styles.sectionSubtitle}>
              {t('contactNumbersDescription')}
            </Text>
            
            <View style={styles.contactNumbersContainer}>
              {contactNumbers.map((contact, index) => (
                <View key={contact.id} style={styles.contactNumberItem}>
                  <View style={styles.contactNumberRow}>
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
                          Alert.alert(
                            t('selectContactType'),
                            '',
                            [
                              { text: 'Mobile', onPress: () => updateContactLabel(contact.id, 'Mobile', 'mobile') },
                              { text: 'Landline', onPress: () => updateContactLabel(contact.id, 'Landline', 'landline') },
                              { text: 'WhatsApp', onPress: () => updateContactLabel(contact.id, 'WhatsApp', 'whatsapp') },
                              { text: 'Telegram', onPress: () => updateContactLabel(contact.id, 'Telegram', 'telegram') },
                              { text: 'Viber', onPress: () => updateContactLabel(contact.id, 'Viber', 'viber') },
                              { text: t('cancel'), style: 'cancel' }
                            ]
                          );
                        }}
                      >
                        <Text style={styles.contactTypeText}>{contact.label}</Text>
                        <Ionicons name="chevron-down" size={12} color={Colors.text.secondary} />
                      </TouchableOpacity>
                    </View>
                    
                    <TextInput
                      style={styles.contactNumberInput}
                      placeholder={t('enterContactNumber')}
                      value={contact.number}
                      onChangeText={(text) => updateContactNumber(contact.id, text)}
                      keyboardType="phone-pad"
                    />
                    
                    {contactNumbers.length > 1 && (
                      <TouchableOpacity 
                        onPress={() => removeContactNumber(contact.id)}
                        style={styles.removeContactButton}
                      >
                        <Ionicons name="trash" size={20} color="#e74c3c" />
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  {contact.number.trim() && (
                    <View style={styles.contactPreview}>
                      <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
                      <Text style={styles.contactPreviewText}>
                        {contact.label}: {contact.number}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
              
              {contactNumbers.length < 5 && (
                <TouchableOpacity 
                  style={styles.addContactButton}
                  onPress={addContactNumber}
                >
                  <Ionicons name="add" size={20} color={Colors.primary} />
                  <Text style={styles.addContactText}>{t('addContactNumber')}</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.contactNumbersNote}>
              <Ionicons name="information-circle" size={16} color="#e74c3c" />
              <Text style={styles.noteText}>
                {t('contactNumbersNote')}
              </Text>
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
            
            {/* Test coordinate button for development */}
            <TouchableOpacity 
              style={[styles.button, styles.testButton]} 
              onPress={setTestCoordinates}
            >
              <Text style={styles.buttonText}>Update Test Coordinates (Dev)</Text>
            </TouchableOpacity>
            
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

          {/* Social Links Section */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Social Links & Online Presence</Text>
            <Text style={styles.subtitle}>Add up to 4 links to your social media, website, or online stores (Facebook, Instagram, Shopee, etc.)</Text>
            
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
            
            <View style={styles.socialLinksNote}>
              <Ionicons name="information-circle" size={16} color="#7f8c8d" />
              <Text style={styles.noteText}>
                Platform icons will automatically appear based on your URL. These links will be displayed on your store profile.
              </Text>
            </View>
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
  testButton: {
    backgroundColor: '#f39c12',
    marginTop: 10,
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
  
  // Profile Type Dropdown Styles
  profileTypeDropdownButton: {
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
  profileTypeDropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
  },
  profileTypeDropdownText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    marginLeft: 12,
    fontWeight: '500',
  },
  profileTypeDropdownContent: {
    backgroundColor: Colors.background.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    maxHeight: 400,
  },
  profileTypeScrollView: {
    maxHeight: 400,
    padding: 16,
  },
  profileTypeList: {
    paddingBottom: 20,
  },
  profileTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileTypeItemSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    elevation: 6,
  },
  profileTypeItemIcon: {
    marginRight: 16,
  },
  profileTypeItemContent: {
    flex: 1,
  },
  profileTypeItemText: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileTypeItemTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  profileTypeItemDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  profileTypeItemDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.9)',
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
    width: '100%',
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
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 12,
    lineHeight: 20,
  },
});
