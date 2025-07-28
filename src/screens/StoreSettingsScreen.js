import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { Colors } from '../styles/theme';

export default function StoreSettingsScreen({ navigation, route }) {
  const { businessProfile } = route.params;
  const [loading, setLoading] = useState(false);

  const deleteBusinessProfile = async () => {
    Alert.alert(
      'Tanggalin ang Business Profile',
      'Sigurado ka ba na gusto mong tanggalin ang inyong business profile? Hindi na pwedeng ibalik ang lahat ng produkto at impormasyon.',
      [
        {
          text: 'Huwag na lang',
          style: 'cancel',
        },
        {
          text: 'Oo, tanggalin',
          style: 'destructive',
          onPress: () => {
            const performDelete = async () => {
              try {
                setLoading(true);
                
                // First, delete all products associated with this business profile
                const productsQuery = query(
                  collection(db, 'products'),
                  where('storeId', '==', businessProfile.id)
                );
                
                const productsSnapshot = await getDocs(productsQuery);
                const deleteProductPromises = productsSnapshot.docs.map(productDoc => 
                  deleteDoc(doc(db, 'products', productDoc.id))
                );
                
                await Promise.all(deleteProductPromises);
                console.log('🗑️ Deleted', productsSnapshot.docs.length, 'products');
                
                // Then delete the business profile itself
                await deleteDoc(doc(db, 'businessProfiles', businessProfile.id));
                console.log('🗑️ Business profile deleted successfully');
                
                Alert.alert(
                  'Matagumpay!',
                  'Ang inyong business profile at lahat ng produkto ay natanggal na.',
                  [{ 
                    text: 'OK',
                    onPress: () => {
                      // Navigate back to MyStore which will show the "no store" state
                      navigation.navigate('MyStoreMain');
                    }
                  }]
                );
                
              } catch (error) {
                console.error('Error deleting store:', error);
                Alert.alert(
                  'Error', 
                  'Hindi natanggal ang tindahan. Subukan ulit.'
                );
              } finally {
                setLoading(false);
              }
            };
            
            performDelete();
          },
        },
      ]
    );
  };

  const settingsOptions = [
    {
      id: 'edit',
      title: 'I-edit ang Business Profile',
      subtitle: 'Baguhin ang impormasyon ng business profile',
      icon: 'pencil',
      iconColor: Colors.primary,
      onPress: () => navigation.navigate('EditStore', { store: businessProfile }),
    },
    {
      id: 'delete',
      title: 'Tanggalin ang Business Profile',
      subtitle: 'Permanenteng tanggalin ang business profile at lahat ng produkto',
      icon: 'trash',
      iconColor: '#e74c3c',
      onPress: deleteBusinessProfile,
      disabled: loading,
    },
  ];

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.storeInfo}>
        <Ionicons name="storefront" size={48} color={Colors.primary} />
        <Text style={styles.storeName}>{businessProfile.name}</Text>
        <Text style={styles.storeAddress}>{businessProfile.address}</Text>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Mga Setting ng Business Profile</Text>
        
        {settingsOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.settingOption,
              option.disabled && styles.settingOptionDisabled
            ]}
            onPress={option.onPress}
            disabled={option.disabled}
          >
            <View style={styles.settingIcon}>
              <Ionicons 
                name={option.icon} 
                size={24} 
                color={option.disabled ? '#bdc3c7' : option.iconColor} 
              />
            </View>
            <View style={styles.settingContent}>
              <Text style={[
                styles.settingTitle,
                option.disabled && styles.settingTitleDisabled
              ]}>
                {option.title}
              </Text>
              <Text style={[
                styles.settingSubtitle,
                option.disabled && styles.settingSubtitleDisabled
              ]}>
                {option.subtitle}
              </Text>
            </View>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={option.disabled ? '#bdc3c7' : '#95a5a6'} 
            />
          </TouchableOpacity>
        ))}
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Tinatanggal ang tindahan...</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  storeInfo: {
    backgroundColor: '#fff',
    padding: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  storeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 15,
    textAlign: 'center',
  },
  storeAddress: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 5,
    textAlign: 'center',
  },
  settingsSection: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  settingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  settingOptionDisabled: {
    opacity: 0.6,
  },
  settingIcon: {
    width: 40,
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
    marginLeft: 15,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  settingTitleDisabled: {
    color: '#bdc3c7',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  settingSubtitleDisabled: {
    color: '#bdc3c7',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#2c3e50',
    marginTop: 10,
  },
});
