import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useLanguage } from '../../contexts/LanguageContext'; // Corrected import
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../styles/theme';

const BusinessPortfolioTab = ({ store, navigation, isMyStore = false }) => {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    fetchPortfolio();
  }, [store.id]);

  const fetchPortfolio = async () => {
    try {
      const portfolioQuery = query(
        collection(db, 'portfolio'),
        where('storeId', '==', store.id)
      );
      const querySnapshot = await getDocs(portfolioQuery);
      const portfolioData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPortfolio(portfolioData);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      Alert.alert(t('error'), t('failedToFetchPortfolio'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (imageId) => {
    Alert.alert(
      t('deleteImage'),
      t('areYouSureDeleteImage'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('delete'), style: 'destructive', onPress: () => deleteImage(imageId) },
      ]
    );
  };

  const deleteImage = async (imageId) => {
    try {
      await deleteDoc(doc(db, 'portfolio', imageId));
      fetchPortfolio(); // Refresh the list
      Alert.alert(t('success'), t('imageDeletedSuccess'));
    } catch (error) {
      console.error("Error deleting image:", error);
      Alert.alert(t('error'), t('failedToDeleteImage'));
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
          onPress={() => navigation.navigate('AddPortfolioImage', { storeId: store.id })}
        >
          <Ionicons name="add-circle-outline" size={24} color={Colors.background.primary} />
          <Text style={styles.addButtonText}>{t('addPortfolioImage')}</Text>
        </TouchableOpacity>
      )}

      {portfolio.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="images-outline" size={64} color={Colors.text.light} />
          <Text style={styles.emptyText}>{t('noPortfolioImagesAvailable')}</Text>
        </View>
      ) : (
        <View style={styles.portfolioGrid}>
          {portfolio.map(item => (
            <View key={item.id} style={styles.portfolioItemContainer}>
              <Image source={{ uri: item.imageUrl }} style={styles.portfolioImage} />
              {isMyStore && (
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDelete(item.id)}
                >
                  <Ionicons name="trash-outline" size={22} color={Colors.text.white} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default BusinessPortfolioTab;

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
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  portfolioItemContainer: {
    width: '32%',
    marginBottom: Spacing.sm,
    position: 'relative',
  },
  portfolioImage: {
    width: '100%',
    height: 120,
    borderRadius: BorderRadius.lg,
  },
  deleteButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: BorderRadius.full,
    padding: Spacing.xs,
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

