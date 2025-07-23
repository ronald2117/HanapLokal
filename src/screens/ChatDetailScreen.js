import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
  arrayUnion,
  increment,
  writeBatch
} from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/theme';

const { width } = Dimensions.get('window');

export default function ChatDetailScreen({ route, navigation }) {
  const { conversationId, otherParticipant } = route.params;
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);
  const { currentUser, userProfile } = useAuth();

  useEffect(() => {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = [];
      snapshot.forEach((doc) => {
        messagesData.push({ id: doc.id, ...doc.data() });
      });
      setMessages(messagesData);
      setLoading(false);
      
      // Mark messages as read
      markMessagesAsRead();
      
      // Scroll to bottom when new messages arrive
      setTimeout(() => {
        if (flatListRef.current && messagesData.length > 0) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
    });

    return () => unsubscribe();
  }, [conversationId]);

  const markMessagesAsRead = async () => {
    try {
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        [`unreadCount.${currentUser.uid}`]: 0
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || sending) return;

    const message = messageText.trim();
    setMessageText('');
    setSending(true);

    try {
      const batch = writeBatch(db);
      
      // Add message to subcollection
      const messageRef = doc(collection(db, 'conversations', conversationId, 'messages'));
      batch.set(messageRef, {
        text: message,
        senderId: currentUser.uid,
        senderName: userProfile?.firstName ? `${userProfile.firstName} ${userProfile.lastName || ''}`.trim() : currentUser.email,
        timestamp: serverTimestamp(),
      });

      // Update conversation with last message info
      const conversationRef = doc(db, 'conversations', conversationId);
      batch.update(conversationRef, {
        lastMessage: message,
        lastMessageTime: serverTimestamp(),
        [`unreadCount.${otherParticipant.uid}`]: increment(1)
      });

      await batch.commit();
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
      setMessageText(message); // Restore the message text
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const shouldShowDateHeader = (currentMessage, previousMessage) => {
    if (!previousMessage) return true;
    
    const currentDate = currentMessage.timestamp?.toDate?.() || new Date(currentMessage.timestamp);
    const previousDate = previousMessage.timestamp?.toDate?.() || new Date(previousMessage.timestamp);
    
    return currentDate.toDateString() !== previousDate.toDateString();
  };

  const renderMessage = ({ item, index }) => {
    const isMyMessage = item.senderId === currentUser.uid;
    const previousMessage = index > 0 ? messages[index - 1] : null;
    const showDateHeader = shouldShowDateHeader(item, previousMessage);

    return (
      <View>
        {showDateHeader && (
          <View style={styles.dateHeader}>
            <Text style={styles.dateText}>{formatDate(item.timestamp)}</Text>
          </View>
        )}
        
        <View style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
        ]}>
          <View style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble
          ]}>
            <Text style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.otherMessageText
            ]}>
              {item.text}
            </Text>
            <Text style={[
              styles.timestampText,
              isMyMessage ? styles.myTimestampText : styles.otherTimestampText
            ]}>
              {formatTime(item.timestamp)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[Colors.primary, Colors.primaryLight]}
      style={styles.headerGradient}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text.white} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
            <View style={styles.participantInfo}>
              {otherParticipant?.profileImage ? (
                <Image
                  source={{ uri: otherParticipant.profileImage }}
                  style={styles.headerAvatar}
                />
              ) : (
                <View style={[styles.headerAvatar, styles.defaultHeaderAvatar]}>
                  <Ionicons 
                    name={otherParticipant?.isStore ? "storefront" : "person"} 
                    size={20} 
                    color={Colors.text.white} 
                  />
                </View>
              )}
              <View style={styles.participantDetails}>
                <Text style={styles.participantName}>
                  {otherParticipant?.storeName || otherParticipant?.name || 'Unknown User'}
                </Text>
                {otherParticipant?.isStore && (
                  <Text style={styles.storeLabel}>Store</Text>
                )}
              </View>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => {
              // Show options menu
              Alert.alert(
                'Chat Options',
                'What would you like to do?',
                [
                  { text: 'View Profile', onPress: () => console.log('View profile') },
                  { text: 'Block User', onPress: () => console.log('Block user'), style: 'destructive' },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
          >
            <Ionicons name="ellipsis-vertical" size={24} color={Colors.text.white} />
          </TouchableOpacity>
        </View>
    </LinearGradient>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubble-outline" size={64} color={Colors.text.light} />
      <Text style={styles.emptyTitle}>Start the conversation</Text>
      <Text style={styles.emptySubtitle}>
        Send a message to {otherParticipant?.storeName || otherParticipant?.name}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={[
            styles.messagesContent,
            messages.length === 0 && styles.emptyMessagesContent
          ]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            if (flatListRef.current && messages.length > 0) {
              flatListRef.current.scrollToEnd({ animated: true });
            }
          }}
          ListEmptyComponent={loading ? null : renderEmptyState}
        />

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.messageInput}
              placeholder="Type a message..."
              placeholderTextColor={Colors.text.light}
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!messageText.trim() || sending) && styles.sendButtonDisabled
              ]}
              onPress={sendMessage}
              disabled={!messageText.trim() || sending}
            >
              <Ionicons 
                name={sending ? "hourglass" : "send"} 
                size={20} 
                color={Colors.text.white} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    marginRight: Spacing.sm,
  },
  
  headerContent: {
    flex: 1,
  },
  
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: Spacing.md,
  },
  
  defaultHeaderAvatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  participantDetails: {
    flex: 1,
  },
  
  participantName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.white,
  },
  
  storeLabel: {
    fontSize: Typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  
  moreButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  
  chatContainer: {
    flex: 1,
  },
  
  messagesList: {
    flex: 1,
  },
  
  messagesContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  
  emptyMessagesContent: {
    flexGrow: 1,
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
  },
  
  dateHeader: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  
  dateText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  
  messageContainer: {
    marginVertical: Spacing.xs,
    maxWidth: width * 0.75,
  },
  
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  
  messageBubble: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  
  myMessageBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 6,
  },
  
  otherMessageBubble: {
    backgroundColor: Colors.background.card,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  
  messageText: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
    marginBottom: Spacing.xs,
  },
  
  myMessageText: {
    color: Colors.text.white,
  },
  
  otherMessageText: {
    color: Colors.text.primary,
  },
  
  timestampText: {
    fontSize: Typography.fontSize.xs,
    alignSelf: 'flex-end',
  },
  
  myTimestampText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  
  otherTimestampText: {
    color: Colors.text.light,
  },
  
  inputContainer: {
    backgroundColor: Colors.background.card,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  
  messageInput: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    maxHeight: 100,
    paddingVertical: Spacing.sm,
  },
  
  sendButton: {
    backgroundColor: Colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
    ...Shadows.sm,
  },
  
  sendButtonDisabled: {
    backgroundColor: Colors.text.light,
    ...Shadows.none,
  },
});
