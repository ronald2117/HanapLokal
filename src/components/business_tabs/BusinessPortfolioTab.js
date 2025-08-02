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
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useLanguage } from '../../contexts/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../styles/theme';

const BusinessPortfolioTab = ({ store, navigation, isMyStore = false }) => {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const portfolioQuery = query(
      collection(db, 'portfolio'),
      where('storeId', '==', store.id)
    );

    const unsubscribe = onSnapshot(portfolioQuery, (querySnapshot) => {
      const portfolioData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by createdAt descending
      portfolioData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPortfolio(portfolioData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching portfolio:", error);
      Alert.alert(t('error'), 'Failed to load portfolio images');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [store.id]);

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
      Alert.alert(t('success'), 'Image deleted successfully');
    } catch (error) {
      console.error("Error deleting image:", error);
      Alert.alert(t('error'), 'Failed to delete image');
    }
  };

  const renderPortfolioCard = (item) => (
    <View key={item.id} style={styles.portfolioCard}>
      <Image source={{ uri: item.imageUrl }} style={styles.portfolioImage} />
      <View style={styles.portfolioInfo}>
        {item.title && <Text style={styles.portfolioTitle}>{item.title}</Text>}
        <Text style={styles.portfolioDescription} numberOfLines={2}>
          {item.description || 'No description'}
        </Text>
        <View style={styles.portfolioMeta}>
          <Text style={styles.portfolioDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
      {isMyStore && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('EditPortfolioImage', { portfolio: item })}>
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
          onPress={() => navigation.navigate('AddPortfolioImage', { storeId: store.id })}
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
        <ScrollView showsVerticalScrollIndicator={false}>
          {portfolio.map(item => renderPortfolioCard(item))}
        </ScrollView>
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
  portfolioCard: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.base,
    flexDirection: 'row',
    ...Shadows.base,
  },
  portfolioImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.lg,
    backgroundColor: Colors.background.secondary,
  },
  portfolioInfo: {
    flex: 1,
  },
  portfolioTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  portfolioDescription: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
    lineHeight: 20,
  },
  portfolioMeta: {
    marginTop: Spacing.sm,
  },
  portfolioDate: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.light,
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

