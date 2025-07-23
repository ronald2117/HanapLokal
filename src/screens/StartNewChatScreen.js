import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  where,
  limit
} from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/theme';

export default function StartNewChatScreen({ navigation }) {
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { currentUser, userProfile } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    const filtered = stores.filter(store =>
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.address?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredStores(filtered);
  }, [searchQuery, stores]);

  const fetchStores = async () => {
    try {
      const storesRef = collection(db, 'stores');
      const q = query(storesRef, orderBy('name'));
      const querySnapshot = await getDocs(q);
      const storesData = [];
      
      querySnapshot.forEach((doc) => {
        const storeData = { id: doc.id, ...doc.data() };
        // Don't show current user's own store
        if (storeData.userId !== currentUser.uid) {
          storesData.push(storeData);
        }
      });
      
      setStores(storesData);
      setFilteredStores(storesData);
    } catch (error) {
      console.error('Error fetching stores:', error);
      Alert.alert('Error', 'Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const startChatWithStore = async (store) => {
    try {
      console.log('Starting chat with store:', store.name, 'Owner ID:', store.ownerId);
      
      // Validate store has owner ID
      if (!store.ownerId) {
        Alert.alert('Error', 'Cannot start chat - store owner information is missing.');
        return;
      }
      
      // Prevent chatting with your own store
      if (store.ownerId === currentUser.uid) {
        Alert.alert('Error', 'You cannot chat with your own store.');
        return;
      }
      
      setLoading(true);
      
            // Check if conversation already exists
      const conversationsRef = collection(db, 'conversations');
      const existingQuery = query(
        conversationsRef,
        where('participants', 'array-contains', currentUser.uid)
      );
      
      const existingSnapshot = await getDocs(existingQuery);
      let existingConversation = null;
      
      existingSnapshot.forEach((doc) => {
        const conversationData = doc.data();
        if (conversationData.participants.includes(store.ownerId)) {
          existingConversation = { id: doc.id, ...conversationData };
        }
      });
      
      if (existingConversation) {
        // Navigate to existing conversation
        navigation.replace('ChatDetail', {
          conversationId: existingConversation.id,
          otherParticipant: {
            uid: store.ownerId,
            name: store.ownerName || 'Store Owner',
            storeName: store.name,
            profileImage: store.profileImage || null,
            isStore: true
          }
        });
        return;
      }
      
      // Create new conversation
      const conversationData = {
        participants: [currentUser.uid, store.ownerId],
        participantsInfo: [
          {
            uid: currentUser.uid,
            name: userProfile?.firstName ? `${userProfile.firstName} ${userProfile.lastName || ''}`.trim() : currentUser.email || 'Customer',
            profileImage: userProfile?.profileImage || null,
            isStore: false
          },
          {
            uid: store.ownerId,
            name: store.ownerName || 'Store Owner',
            storeName: store.name,
            profileImage: store.profileImage || null,
            isStore: true
          }
        ],
        createdAt: serverTimestamp(),
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        unreadCount: {
          [currentUser.uid]: 0,
          [store.ownerId]: 0
        }
      };
      
      const docRef = await addDoc(conversationsRef, conversationData);
      
      // Navigate to the new conversation
      navigation.replace('ChatDetail', {
        conversationId: docRef.id,
        otherParticipant: {
          uid: store.ownerId,
          name: store.ownerName || 'Store Owner',
          storeName: store.name,
          profileImage: store.profileImage || null,
          isStore: true
        }
      });
      
    } catch (error) {
      console.error('Error starting chat:', error);
      Alert.alert('Error', 'Failed to start chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryInfo = (category) => {
    const categories = {
      'sari-sari': { name: 'Sari-sari Store', emoji: '🏪' },
      'kainan': { name: 'Restaurant', emoji: '🍽️' },
      'laundry': { name: 'Laundry Shop', emoji: '👕' },
      'vegetables': { name: 'Vegetable Store', emoji: '🥬' },
      'meat': { name: 'Meat Shop', emoji: '🥩' },
      'bakery': { name: 'Bakery', emoji: '🍞' },
      'pharmacy': { name: 'Pharmacy', emoji: '💊' },
      'hardware': { name: 'Hardware Store', emoji: '🔨' },
      'clothing': { name: 'Clothing Store', emoji: '👔' },
      'electronics': { name: 'Electronics', emoji: '📱' },
      'beauty': { name: 'Beauty Salon', emoji: '✂️' },
      'automotive': { name: 'Automotive Shop', emoji: '🚗' },
      'other': { name: 'Other', emoji: '🏪' },
    };
    
    return categories[category] || categories['other'];
  };

  const renderStoreItem = ({ item }) => {
    const categoryInfo = getCategoryInfo(item.category);
    
    return (
      <TouchableOpacity
        style={styles.storeItem}
        onPress={() => startChatWithStore(item)}
        disabled={loading}
      >
        <View style={styles.storeIconContainer}>
          {item.profileImage ? (
            <Image 
              source={{ uri: item.profileImage }} 
              style={styles.storeImage}
            />
          ) : (
            <View style={styles.defaultStoreIcon}>
              <Text style={styles.storeEmoji}>{categoryInfo.emoji}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.storeInfo}>
          <Text style={styles.storeName}>{item.name}</Text>
          {item.category && (
            <Text style={styles.storeCategory}>{categoryInfo.name}</Text>
          )}
          <Text style={styles.storeAddress} numberOfLines={2}>
            {item.address}
          </Text>
        </View>
        
        <View style={styles.chatIconContainer}>
          <Ionicons name="chatbubble" size={24} color={Colors.primary} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryLight]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('startNewChat')}</Text>
          <View style={styles.headerRight} />
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stores..."
            placeholderTextColor={Colors.text.light}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={Colors.text.secondary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </LinearGradient>

      {/* Stores List */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading stores...</Text>
          </View>
        ) : filteredStores.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="storefront-outline" size={64} color={Colors.text.light} />
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No stores found' : 'No stores available'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery 
                ? 'Try searching with different keywords'
                : 'Check back later for stores to chat with'
              }
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              {filteredStores.length} store{filteredStores.length !== 1 ? 's' : ''} available
            </Text>
            <FlatList
              data={filteredStores}
              renderItem={renderStoreItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  
  headerGradient: {
    paddingBottom: Spacing.lg,
    borderBottomLeftRadius: BorderRadius['2xl'],
    borderBottomRightRadius: BorderRadius['2xl'],
    ...Shadows.base,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  
  backButton: {
    padding: Spacing.sm,
  },
  
  headerTitle: {
    flex: 1,
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.white,
    textAlign: 'center',
    marginHorizontal: Spacing.lg,
  },
  
  headerRight: {
    width: 40, // Balance the back button
  },
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    marginHorizontal: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    ...Shadows.base,
  },
  
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
  },
  
  content: {
    flex: 1,
    paddingTop: Spacing.lg,
  },
  
  sectionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  
  emptyTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  
  emptySubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
  },
  
  listContent: {
    paddingBottom: Spacing.xl,
  },
  
  storeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.base,
  },
  
  storeIconContainer: {
    marginRight: Spacing.lg,
  },
  
  storeImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  
  defaultStoreIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  storeEmoji: {
    fontSize: 24,
  },
  
  storeInfo: {
    flex: 1,
  },
  
  storeName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  
  storeCategory: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  
  storeAddress: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
  },
  
  chatIconContainer: {
    padding: Spacing.sm,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.full,
  },
});
