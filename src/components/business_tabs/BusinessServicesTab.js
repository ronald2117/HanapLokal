import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  FlatList,
} from 'react-native';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../styles/theme';

const BusinessServicesTab = ({ store, navigation, isMyStore = false }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const { currentUser } = useAuth();

  useEffect(() => {
    const servicesQuery = query(
      collection(db, 'services'),
      where('storeId', '==', store.id)
    );

    const unsubscribe = onSnapshot(servicesQuery, (querySnapshot) => {
      const servicesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setServices(servicesData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching services:", error);
      Alert.alert(t('error'), t('failedToFetchServices'));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [store.id]);

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
      Alert.alert(t('success'), t('serviceDeletedSuccess'));
    } catch (error) {
      console.error("Error deleting service:", error);
      Alert.alert(t('error'), t('failedToDeleteService'));
    }
  };

  const renderServiceCard = ({ item }) => (
    <View style={styles.serviceCard}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.serviceImage} />
      ) : (
        <View style={styles.serviceImagePlaceholder}>
          <Ionicons name="construct-outline" size={40} color={Colors.text.light} />
        </View>
      )}
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{item.name}</Text>
        <Text style={styles.serviceDescription}>{item.description}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>{`₱${item.price}`}</Text>
          <Text style={styles.priceFormatText}>{item.priceFormat}</Text>
        </View>
        <Text style={styles.serviceArea}>{`Coverage: ${item.serviceArea}`}</Text>
        <View style={styles.availabilityContainer}>
          <View style={[styles.availabilityIndicator, { backgroundColor: item.isAvailable ? Colors.success : Colors.error }]} />
          <Text style={styles.availabilityText}>{item.isAvailable ? t('available') : t('unavailable')}</Text>
        </View>
      </View>
      {isMyStore && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('EditService', { service: item })}>
            <Ionicons name="pencil-outline" size={24} color={Colors.secondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <Ionicons name="trash-outline" size={24} color={Colors.error} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

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
        <FlatList
          data={services}
          renderItem={renderServiceCard}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
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
    ...Shadows.base,
  },
  serviceImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.lg,
    backgroundColor: Colors.background.secondary,
  },
  serviceImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.lg,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
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
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  priceText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary,
  },
  priceFormatText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginLeft: Spacing.xs,
  },
  serviceArea: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.light,
    marginTop: Spacing.sm,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  availabilityIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.sm,
  },
  availabilityText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  actionsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
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