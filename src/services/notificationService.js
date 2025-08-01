import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
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
  getDocs,
  writeBatch,
  getDoc
} from 'firebase/firestore';
import { db } from './firebaseConfig';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Notification Types
export const NOTIFICATION_TYPES = {
  CHAT_MESSAGE: 'chat_message',
  STORE_PROMOTION: 'store_promotion',
  ORDER_UPDATE: 'order_update',
  PRODUCT_AVAILABILITY: 'product_availability',
  REVIEW_REQUEST: 'review_request',
  SYSTEM_ANNOUNCEMENT: 'system_announcement',
  STORE_FOLLOW: 'store_follow',
  FAVORITE_STORE_UPDATE: 'favorite_store_update',
};

// Notification Categories for grouping and filtering
export const NOTIFICATION_CATEGORIES = {
  COMMUNICATION: 'communication', // Chat messages
  MARKETING: 'marketing', // Promotions, announcements
  TRANSACTIONAL: 'transactional', // Orders, reviews
  SOCIAL: 'social', // Follows, likes
  SYSTEM: 'system', // App updates, maintenance
};

// Priority levels
export const NOTIFICATION_PRIORITY = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
};

class NotificationService {
  constructor() {
    this.notificationListeners = new Map();
    this.isInitialized = false;
  }

  // Initialize notification service
  async initialize(userId) {
    if (this.isInitialized) return;

    try {
      // Check if we're in Expo Go (which doesn't support push notifications)
      const isExpoGo = Constants.appOwnership === 'expo';
      
      if (isExpoGo) {
        console.log('📱 Running in Expo Go - Push notifications not available');
        console.log('💡 Use a development build for full notification support');
        // Still initialize for local notifications and in-app features
        this.setupNotificationListeners();
        this.isInitialized = true;
        return;
      }

      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permissions not granted');
        return;
      }

      // Get push token
      const pushToken = await this.getPushToken();
      if (pushToken && userId) {
        await this.updateUserPushToken(userId, pushToken);
      }

      // Set up notification listeners
      this.setupNotificationListeners();
      
      this.isInitialized = true;
      console.log('✅ Notification service initialized');
    } catch (error) {
      console.error('❌ Error initializing notification service:', error);
      // Still mark as initialized to prevent repeated attempts
      this.isInitialized = true;
    }
  }

  // Get push notification token
  async getPushToken() {
    try {
      // Check if we're in Expo Go
      const isExpoGo = Constants.appOwnership === 'expo';
      if (isExpoGo) {
        console.log('📱 Push tokens not available in Expo Go');
        return null;
      }

      // Get project ID from app config
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        console.warn('⚠️  No projectId found in app config. Push notifications may not work.');
        console.log('💡 Add projectId to app.json under extra.eas.projectId');
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: projectId
      });
      
      console.log('📱 Push token obtained:', tokenData.data);
      return tokenData.data;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  // Update user's push token in Firestore
  async updateUserPushToken(userId, pushToken) {
    try {
      // Create user profile document if it doesn't exist
      const userRef = doc(db, 'userProfiles', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        // Update existing document
        await updateDoc(userRef, {
          pushToken,
          pushTokenUpdatedAt: serverTimestamp(),
        });
      } else {
        // Create new document with basic info
        await addDoc(collection(db, 'userProfiles'), {
          userId,
          pushToken,
          pushTokenUpdatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        });
      }
      
      console.log('✅ Push token updated for user:', userId);
    } catch (error) {
      console.error('Error updating push token:', error);
    }
  }

  // Set up notification event listeners
  setupNotificationListeners() {
    // Handle notification received while app is running
    this.notificationListeners.set(
      'received',
      Notifications.addNotificationReceivedListener(this.handleNotificationReceived)
    );

    // Handle notification tap
    this.notificationListeners.set(
      'response',
      Notifications.addNotificationResponseReceivedListener(this.handleNotificationResponse)
    );
  }

  // Handle notification received while app is active
  handleNotificationReceived = (notification) => {
    console.log('📱 Notification received:', notification);
    
    // Update badge count
    this.updateBadgeCount();
    
    // You can trigger in-app notifications here
    // For example, show a toast or update UI
  };

  // Handle notification tap/interaction
  handleNotificationResponse = (response) => {
    console.log('👆 Notification tapped:', response);
    
    const { notification } = response;
    const data = notification.request.content.data;
    
    // Navigate based on notification type
    this.handleNotificationNavigation(data);
  };

  // Handle navigation based on notification data
  handleNotificationNavigation(data) {
    // This will be called from the main app component
    // Pass navigation instance to handle routing
    if (this.navigationRef) {
      switch (data.type) {
        case NOTIFICATION_TYPES.CHAT_MESSAGE:
          this.navigationRef.navigate('Chats', {
            screen: 'ChatDetail',
            params: {
              conversationId: data.conversationId,
              otherParticipant: data.otherParticipant,
            },
          });
          break;
        case NOTIFICATION_TYPES.STORE_PROMOTION:
          this.navigationRef.navigate('StoreDetails', {
            storeId: data.storeId,
          });
          break;
        case NOTIFICATION_TYPES.ORDER_UPDATE:
          this.navigationRef.navigate('Orders', {
            orderId: data.orderId,
          });
          break;
        default:
          // Default navigation or do nothing
          break;
      }
    }
  }

  // Set navigation reference for handling notification taps
  setNavigationRef(navigationRef) {
    this.navigationRef = navigationRef;
  }

  // Create notification in Firestore
  async createNotification({
    recipientId,
    senderId,
    type,
    category,
    priority = NOTIFICATION_PRIORITY.NORMAL,
    title,
    body,
    data = {},
    scheduleAt = null,
  }) {
    try {
      const notificationData = {
        recipientId,
        senderId,
        type,
        category,
        priority,
        title,
        body,
        data,
        isRead: false,
        createdAt: serverTimestamp(),
        scheduleAt: scheduleAt ? new Date(scheduleAt) : null,
      };

      const docRef = await addDoc(collection(db, 'notifications'), notificationData);
      
      // Send push notification immediately if not scheduled
      if (!scheduleAt) {
        await this.sendPushNotification(recipientId, {
          title,
          body,
          data: { ...data, notificationId: docRef.id, type },
        });
      }

      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Send push notification
  async sendPushNotification(userId, { title, body, data }) {
    try {
      // Skip push notifications in Expo Go
      const isExpoGo = Constants.appOwnership === 'expo';
      if (isExpoGo) {
        console.log('📱 Skipping push notification in Expo Go');
        return { status: 'skipped', reason: 'expo_go' };
      }

      // Get user's push token from Firestore
      const userQuery = query(
        collection(db, 'userProfiles'), 
        where('userId', '==', userId)
      );
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        console.warn('User profile not found for push notification:', userId);
        return { status: 'error', reason: 'user_not_found' };
      }

      const userData = userSnapshot.docs[0].data();
      const pushToken = userData.pushToken;

      if (!pushToken) {
        console.warn('No push token for user:', userId);
        return { status: 'error', reason: 'no_token' };
      }

      // Send push notification via Expo Push API
      const message = {
        to: pushToken,
        sound: 'default',
        title,
        body,
        data,
        priority: 'high',
        channelId: 'default',
      };

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();
      console.log('📤 Push notification sent:', result);
      return { status: 'sent', result };
    } catch (error) {
      console.error('Error sending push notification:', error);
      return { status: 'error', error: error.message };
    }
  }

  // Chat-specific notification
  async sendChatNotification({
    recipientId,
    senderId,
    senderName,
    senderProfileImage,
    conversationId,
    message,
    isStore = false,
  }) {
    return this.createNotification({
      recipientId,
      senderId,
      type: NOTIFICATION_TYPES.CHAT_MESSAGE,
      category: NOTIFICATION_CATEGORIES.COMMUNICATION,
      priority: NOTIFICATION_PRIORITY.HIGH,
      title: `${senderName}`,
      body: message.length > 100 ? `${message.substring(0, 97)}...` : message,
      data: {
        conversationId,
        otherParticipant: {
          uid: senderId,
          name: senderName,
          profileImage: senderProfileImage,
          isStore,
        },
      },
    });
  }

  // Store promotion notification
  async sendPromotionNotification({
    recipientIds,
    storeId,
    storeName,
    title,
    description,
    imageUrl,
    promoCode,
  }) {
    const promises = recipientIds.map(recipientId =>
      this.createNotification({
        recipientId,
        senderId: storeId,
        type: NOTIFICATION_TYPES.STORE_PROMOTION,
        category: NOTIFICATION_CATEGORIES.MARKETING,
        priority: NOTIFICATION_PRIORITY.NORMAL,
        title: `🎉 ${title}`,
        body: `${storeName}: ${description}`,
        data: {
          storeId,
          storeName,
          promoCode,
          imageUrl,
        },
      })
    );

    return Promise.all(promises);
  }

  // Get user notifications with real-time updates
  subscribeToUserNotifications(userId, callback) {
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = [];
      snapshot.forEach((doc) => {
        notifications.push({ id: doc.id, ...doc.data() });
      });
      callback(notifications);
    });
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        isRead: true,
        readAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('recipientId', '==', userId),
        where('isRead', '==', false)
      );

      const snapshot = await getDocs(q);
      const batch = writeBatch(db);

      snapshot.forEach((doc) => {
        batch.update(doc.ref, {
          isRead: true,
          readAt: serverTimestamp(),
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  // Get unread notification count
  async getUnreadCount(userId) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('recipientId', '==', userId),
        where('isRead', '==', false)
      );

      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Update app badge count
  async updateBadgeCount(userId = null) {
    try {
      let count = 0;
      if (userId) {
        count = await this.getUnreadCount(userId);
      }
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error updating badge count:', error);
    }
  }

  // Schedule notification for later
  async scheduleNotification({
    recipientId,
    senderId,
    type,
    category,
    title,
    body,
    data,
    scheduleAt,
  }) {
    return this.createNotification({
      recipientId,
      senderId,
      type,
      category,
      title,
      body,
      data,
      scheduleAt,
    });
  }

  // Clean up listeners
  cleanup() {
    this.notificationListeners.forEach((listener) => {
      listener.remove();
    });
    this.notificationListeners.clear();
    this.isInitialized = false;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;
