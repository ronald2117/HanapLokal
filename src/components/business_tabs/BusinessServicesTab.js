import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useLanguage } from '../../contexts/LanguageContext'; // Corrected import
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../styles/theme';

const BusinessServicesTab = ({ store, navigation, isMyStore = false }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchServices();
  }, [store.id]);

  const fetchServices = async () => {
    try {
      const servicesQuery = query(
        collection(db, 'services'),
        where('storeId', '==', store.id)
      );
      const querySnapshot = await getDocs(servicesQuery);
      const servicesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setServices(servicesData);
    } catch (error) {
      console.error("Error fetching services:", error);
      Alert.alert(t('error'), t('failedToFetchServices'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (serviceId) => {
    Alert.alert(
      t('deleteService'),
      t('areYouSureDeleteService'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('delete'), style: 'destructive', onPress: () => deleteService(serviceId) },
      ]
    );
  };

  const deleteService = async (serviceId) => {
    try {
      await deleteDoc(doc(db, 'services', serviceId));
      fetchServices(); // Refresh the list
      Alert.alert(t('success'), t('serviceDeletedSuccess'));
    } catch (error) {
      console.error("Error deleting service:", error);
      Alert.alert(t('error'), t('failedToDeleteService'));
    }
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>{t('loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isMyStore && (
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddService', { storeId: store.id })}
        >
          <Ionicons name="add-circle-outline" size={24} color={Colors.background.primary} />
          <Text style={styles.addButtonText}>{t('addService')}</Text>
        </TouchableOpacity>
      )}
      
      {services.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="construct-outline" size={64} color={Colors.text.light} />
          <Text style={styles.emptyText}>{t('noServicesAvailable')}</Text>
        </View>
      ) : (
        services.map(item => (
          <View key={item.id} style={styles.serviceCard}>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{item.name}</Text>
              <Text style={styles.serviceDescription}>{item.description}</Text>
              <Text style={styles.servicePrice}>{item.price}</Text>
            </View>
            {isMyStore && (
              <View style={styles.actionsContainer}>
                <TouchableOpacity onPress={() => navigation.navigate('EditService', { service: item, storeId: store.id })}>
                  <Ionicons name="pencil-outline" size={24} color={Colors.secondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Ionicons name="trash-outline" size={24} color={Colors.error} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))
      )}
    </View>
  );
};

export default BusinessServicesTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.base,
    backgroundColor: Colors.background.secondary,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.sm,
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    ...Shadows.base,
  },
  addButtonText: {
    color: Colors.text.white,
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  serviceCard: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Shadows.base,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  serviceDescription: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  servicePrice: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary,
    marginTop: Spacing.sm,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text.light,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
});

