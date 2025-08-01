import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useLanguage } from '../../contexts/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../styles/theme';

const BusinessPortfolioTab = ({ store, navigation, isMyStore = false }) => {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    if (store?.id) {
      fetchPortfolio();
    }
  }, [store.id]);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const portfolioQuery = query(
        collection(db, 'portfolio'),
        where('storeId', '==', store.id),
        orderBy('createdAt', 'desc')
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
    <ScrollView style={styles.container}>
      {isMyStore && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddPortfolioImage', { storeId: store.id, onGoBack: fetchPortfolio })}
        >
          <Ionicons name="add-circle-outline" size={24} color={Colors.text.white} />
          <Text style={styles.addButtonText}>{t('addPortfolioImage')}</Text>
        </TouchableOpacity>
      )}

      {portfolio.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="images-outline" size={64} color={Colors.text.light} />
          <Text style={styles.emptyText}>{t('noPortfolioImagesAvailable')}</Text>
        </View>
      ) : (
        portfolio.map(item => (
          <View key={item.id} style={styles.portfolioItemCard}>
            <Image source={{ uri: item.imageUrl }} style={styles.portfolioImage} />
            <View style={styles.portfolioTextContainer}>
              {item.title && <Text style={styles.portfolioTitle}>{item.title}</Text>}
              {item.description && <Text style={styles.portfolioDescription}>{item.description}</Text>}
            </View>
            {isMyStore && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item.id)}
              >
                <Ionicons name="trash-outline" size={22} color={Colors.error} />
              </TouchableOpacity>
            )}
          </View>
        ))
      )}
    </ScrollView>
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
  portfolioItemCard: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    ...Shadows.base,
    overflow: 'hidden', // Ensures image corners are rounded
  },
  portfolioImage: {
    width: '100%',
    height: 200,
  },
  portfolioTextContainer: {
    padding: Spacing.lg,
  },
  portfolioTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  portfolioDescription: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  deleteButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: BorderRadius.full,
    padding: Spacing.sm,
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

