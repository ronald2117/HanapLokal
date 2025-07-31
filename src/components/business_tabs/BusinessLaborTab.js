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

const BusinessLaborTab = ({ store, navigation, isMyStore = false }) => {
  const [labors, setLabors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    fetchLabors();
  }, [store.id]);

  const fetchLabors = async () => {
    try {
      const laborsQuery = query(
        collection(db, 'labors'),
        where('storeId', '==', store.id)
      );
      const querySnapshot = await getDocs(laborsQuery);
      const laborsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLabors(laborsData);
    } catch (error) {
      console.error("Error fetching labors:", error);
      Alert.alert(t('error'), t('failedToFetchLabors'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (laborId) => {
    Alert.alert(
      t('deleteLabor'),
      t('areYouSureDeleteLabor'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('delete'), style: 'destructive', onPress: () => deleteLabor(laborId) },
      ]
    );
  };

  const deleteLabor = async (laborId) => {
    try {
      await deleteDoc(doc(db, 'labors', laborId));
      fetchLabors(); // Refresh the list
      Alert.alert(t('success'), t('laborDeletedSuccess'));
    } catch (error) {
      console.error("Error deleting labor:", error);
      Alert.alert(t('error'), t('failedToDeleteLabor'));
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
          onPress={() => navigation.navigate('AddLabor', { storeId: store.id })}
        >
          <Ionicons name="add-circle-outline" size={24} color={Colors.background.primary} />
          <Text style={styles.addButtonText}>{t('addLabor')}</Text>
        </TouchableOpacity>
      )}

      {labors.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="body-outline" size={64} color={Colors.text.light} />
          <Text style={styles.emptyText}>{t('noLaborsAvailable')}</Text>
        </View>
      ) : (
        labors.map(item => (
          <View key={item.id} style={styles.laborCard}>
            <View style={styles.laborInfo}>
              <Text style={styles.laborName}>{item.name}</Text>
              <Text style={styles.laborDescription}>{item.description}</Text>
              <Text style={styles.laborPrice}>{item.price}</Text>
            </View>
            {isMyStore && (
              <View style={styles.actionsContainer}>
                <TouchableOpacity onPress={() => navigation.navigate('EditLabor', { labor: item, storeId: store.id })}>
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

export default BusinessLaborTab;

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
  laborCard: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Shadows.base,
  },
  laborInfo: {
    flex: 1,
  },
  laborName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  laborDescription: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  laborPrice: {
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

