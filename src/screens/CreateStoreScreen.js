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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { Colors, Typography, Spacing, BorderRadius } from '../styles/theme';

export default function CreateStoreScreen({ navigation }) {
  const [storeName, setStoreName] = useState('');
  const [address, setAddress] = useState('');
  const [hours, setHours] = useState('');
  const [contact, setContact] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser, isGuestUser } = useAuth();

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
