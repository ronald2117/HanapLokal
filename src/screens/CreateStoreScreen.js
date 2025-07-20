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
  Platform
} from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';

export default function CreateStoreScreen({ navigation }) {
  const [storeName, setStoreName] = useState('');
  const [address, setAddress] = useState('');
  const [hours, setHours] = useState('');
  const [contact, setContact] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser, isGuestUser } = useAuth();

  const handleCreateStore = async () => {
    try {
      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in to create a store');
        return;
      }

      // Check if user is a guest/anonymous user
      if (isGuestUser()) {
        Alert.alert(
          'Mag-create ng Account', 
          'Hindi pwedeng mag-create ng tindahan ang mga guest user. Kailangan mag-register muna para magkaroon ng sariling tindahan.',
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Mag-register',
              onPress: () => {
                // Navigate to sign up and then logout to clear guest session
                navigation.navigate('Auth', { screen: 'Signup' });
              }
            }
          ]
        );
        return;
      }

      // Validate form data
      if (!storeName.trim() || !address.trim() || !hours.trim() || !contact.trim() || !description.trim()) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      setLoading(true);

      const storeData = {
        name: storeName.trim(),
        address: address.trim(),
        hours: hours.trim(),
        contact: contact.trim(),
        description: description.trim(),
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

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
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
            <Text style={styles.label}>Address *</Text>
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
            <Text style={styles.label}>Contact Information *</Text>
            <TextInput
              style={styles.input}
              placeholder="Phone number, email, etc."
              value={contact}
              onChangeText={setContact}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>About Your Store *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell customers about your store, what you sell, your story..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
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
  button: {
    backgroundColor: '#3498db',
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
