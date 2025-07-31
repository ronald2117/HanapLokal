import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/theme';

export default function ChatsScreen({ navigation }) {
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { currentUser, userProfile, isGuestUser, logoutGuestAndSignup } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (!currentUser || isGuestUser()) {
      setLoading(false);
      return;
    }

    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', currentUser.uid),
      orderBy('lastMessageTime', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const conversationsData = [];
      snapshot.forEach((doc) => {
        const conversation = { id: doc.id, ...doc.data() };
        conversationsData.push(conversation);
      });
      setConversations(conversationsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching conversations:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const filteredConversations = conversations.filter(conversation =>
    conversation.participantsInfo?.some(participant => 
      participant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      participant.storeName?.toLowerCase().includes(searchQuery.toLowerCase())
    ) ||
    conversation.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // Less than a week
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participantsInfo?.find(
      participant => participant.uid !== currentUser.uid
    );
  };

  const renderConversationItem = ({ item }) => {
    const otherParticipant = getOtherParticipant(item);
    const isUnread = item.unreadCount && item.unreadCount[currentUser.uid] > 0;
    
    return (
      <TouchableOpacity
        style={[styles.conversationItem, isUnread && styles.unreadConversation]}
        onPress={() => navigation.navigate('ChatDetail', { 
          conversationId: item.id,
          otherParticipant: otherParticipant
        })}
      >
        <View style={styles.avatarContainer}>
          {otherParticipant?.profileImage ? (
            <Image
              source={{ uri: otherParticipant.profileImage }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.defaultAvatar]}>
              <Ionicons 
                name={otherParticipant?.isStore ? "storefront" : "person"} 
                size={24} 
                color={Colors.text.white} 
              />
            </View>
          )}
          {otherParticipant?.isStore && (
            <View style={styles.storeBadge}>
              <Ionicons name="storefront" size={12} color={Colors.text.white} />
            </View>
          )}
        </View>
        
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.participantName, isUnread && styles.unreadText]}>
              {otherParticipant?.storeName || otherParticipant?.name || 'Unknown User'}
            </Text>
            <Text style={styles.timestamp}>
              {formatTime(item.lastMessageTime)}
            </Text>
          </View>
          
          <View style={styles.lastMessageContainer}>
            <Text 
              style={[styles.lastMessage, isUnread && styles.unreadMessage]} 
              numberOfLines={2}
            >
              {item.lastMessage || 'No messages yet'}
            </Text>
            {isUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>
                  {item.unreadCount[currentUser.uid]}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const startNewChat = () => {
    // Navigate to a screen to select a store or user to chat with
    navigation.navigate('StartNewChat');
  };

  if (isGuestUser()) {
    return (
      <View style={styles.container}>
          <View style={styles.guestContainer}>
            <View style={styles.guestIconContainer}>
              <Ionicons name="chatbubbles" size={80} color={Colors.primary} style={{marginBottom: 20}}/>
            </View>
            <Text style={styles.guestTitle}>Chat with Stores</Text>
            <Text style={styles.guestSubtitle}>
              Connect with local businesses and get quick answers about their products and services.
            </Text>
            <Text style={styles.guestDescription}>
              Sign up to start chatting with store owners and other customers in your community.
            </Text>
            <TouchableOpacity
              style={styles.signupButton}
              onPress={async () => {
              // Set a flag to remember user wants to signup
              await AsyncStorage.setItem('pendingSignup', 'true');
              // Logout guest session - this will trigger navigation to AuthStack
              await logoutGuestAndSignup();
            }}
            >
              <Ionicons name="person-add" size={20} color={Colors.background.secondary} />
              <Text style={styles.signupButtonText}>Sign Up to Chat</Text>
            </TouchableOpacity>
          </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryLight]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('chats')}</Text>
          <TouchableOpacity
            style={styles.newChatButton}
            onPress={startNewChat}
          >
            <Ionicons name="add" size={24} color={Colors.text.white} />
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search chats..."
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

      {/* Conversations List */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading chats...</Text>
          </View>
        ) : filteredConversations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color={Colors.text.light} />
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No chats found' : 'No chats yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery 
                ? 'Try searching with different keywords'
                : 'Start a conversation with local stores'
              }
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={styles.startChatButton}
                onPress={startNewChat}
              >
                <Ionicons name="chatbubble" size={20} color={Colors.text.white} />
                <Text style={styles.startChatButtonText}>Start New Chat</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={filteredConversations}
            renderItem={renderConversationItem}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.primary]}
                tintColor={Colors.primary}
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  
  headerGradient: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomLeftRadius: BorderRadius['2xl'],
    borderBottomRightRadius: BorderRadius['2xl'],
    ...Shadows.base,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  
  headerTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.white,
  },
  
  newChatButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: Spacing.sm,
    borderRadius: BorderRadius.full,
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
    marginBottom: Spacing.xl,
  },
  
  startChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.base,
  },
  
  startChatButtonText: {
    color: Colors.text.white,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginLeft: Spacing.sm,
  },
  
  listContent: {
    paddingBottom: Spacing.xl,
  },
  
  conversationItem: {
    flexDirection: 'row',
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    ...Shadows.base,
  },
  
  unreadConversation: {
    backgroundColor: Colors.primaryLight,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  
  avatarContainer: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  
  defaultAvatar: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  storeBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: Colors.accent,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background.card,
  },
  
  conversationContent: {
    flex: 1,
  },
  
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  
  participantName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  
  unreadText: {
    fontWeight: Typography.fontWeight.bold,
  },
  
  timestamp: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  
  lastMessageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  
  lastMessage: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    flex: 1,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
  },
  
  unreadMessage: {
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.medium,
  },
  
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  
  unreadCount: {
    color: Colors.text.white,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  
  // Guest User Styles
  guestGradient: {
    flex: 1,
  },
  
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 100,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },

  guestTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  
  guestSubtitle: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  
  guestDescription: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  
  signupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.base,
    marginTop: 40,
  },
  
  signupButtonText: {
    color: 'white',
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginLeft: Spacing.sm,
  },
});
