import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToCloudinary } from '../services/cloudinaryService';

export default function ImageUploader({ 
  onImageUploaded, 
  currentImageUrl = null, 
  style,
  placeholder = "Add Product Image" 
}) {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(currentImageUrl);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera roll permissions to upload images!'
      );
      return false;
    }
    return true;
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Select Image',
      'Choose how you want to select an image',
      [
        { text: 'Camera', onPress: () => openCamera() },
        { text: 'Gallery', onPress: () => openImageLibrary() },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const openCamera = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio for product images
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await handleImageUpload(result.assets[0].uri);
    }
  };

  const openImageLibrary = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio for product images
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await handleImageUpload(result.assets[0].uri);
    }
  };

  const handleImageUpload = async (uri) => {
    try {
      setUploading(true);
      
      const uploadResult = await uploadImageToCloudinary(uri);
      
      if (uploadResult.success) {
        setImageUrl(uploadResult.url);
        onImageUploaded(uploadResult.url, uploadResult.publicId);
        Alert.alert('Success', 'Image uploaded successfully!');
      } else {
        Alert.alert('Upload Failed', uploadResult.error || 'Failed to upload image');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while uploading the image');
      console.error('Image upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[styles.imageContainer, uploading && styles.uploading]}
        onPress={showImagePickerOptions}
        disabled={uploading}
      >
        {uploading ? (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={styles.uploadingText}>Uploading...</Text>
          </View>
        ) : imageUrl ? (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: imageUrl }} style={styles.image} />
            <View style={styles.changeImageOverlay}>
              <Ionicons name="camera" size={24} color="#fff" />
              <Text style={styles.changeImageText}>Change</Text>
            </View>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons name="camera" size={48} color="#bdc3c7" />
            <Text style={styles.placeholderText}>{placeholder}</Text>
            <Text style={styles.tapText}>Tap to select image</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  uploading: {
    borderColor: '#3498db',
    backgroundColor: '#f0f8ff',
  },
  uploadingContainer: {
    alignItems: 'center',
  },
  uploadingText: {
    marginTop: 10,
    color: '#3498db',
    fontSize: 16,
    fontWeight: '600',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  changeImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 8,
    alignItems: 'center',
  },
  changeImageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  placeholderContainer: {
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  tapText: {
    marginTop: 5,
    fontSize: 14,
    color: '#95a5a6',
  },
});
