import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import Constants from 'expo-constants';
import { notificationService, NOTIFICATION_TYPES } from '../services/notificationService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { currentUser, isGuestUser } = useAuth();

  useEffect(() => {
    if (!currentUser || isGuestUser()) {
      setLoading(false);
      return;
    }

    // Show development notice for Expo Go users
    const isExpoGo = Constants.appOwnership === 'expo';
    if (isExpoGo) {
      console.log('📱 Notification system running in development mode (Expo Go)');
      console.log('💡 Push notifications will work in production builds');
    }

    // Initialize notification service
    notificationService.initialize(currentUser.uid);

    // Subscribe to user notifications
    const unsubscribe = notificationService.subscribeToUserNotifications(
      currentUser.uid,
      (userNotifications) => {
        setNotifications(userNotifications);
        
        // Calculate unread count
        const unread = userNotifications.filter(notif => !notif.isRead).length;
        setUnreadCount(unread);
        
        // Update badge count
        notificationService.updateBadgeCount(currentUser.uid);
        
        setLoading(false);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!currentUser) return;
    
    try {
      await notificationService.markAllAsRead(currentUser.uid);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Send chat notification
  const sendChatNotification = async ({
    recipientId,
    senderName,
    senderProfileImage,
    conversationId,
    message,
    isStore = false,
  }) => {
    if (!currentUser) return;

    try {
      return await notificationService.sendChatNotification({
        recipientId,
        senderId: currentUser.uid,
        senderName,
        senderProfileImage,
        conversationId,
        message,
        isStore,
      });
    } catch (error) {
      console.error('Error sending chat notification:', error);
    }
  };

  // Send promotion notification
  const sendPromotionNotification = async ({
    recipientIds,
    storeId,
    storeName,
    title,
    description,
    imageUrl,
    promoCode,
  }) => {
    try {
      return await notificationService.sendPromotionNotification({
        recipientIds,
        storeId,
        storeName,
        title,
        description,
        imageUrl,
        promoCode,
      });
    } catch (error) {
      console.error('Error sending promotion notification:', error);
    }
  };

  // Get notifications by category
  const getNotificationsByCategory = (category) => {
    return notifications.filter(notif => notif.category === category);
  };

  // Get unread notifications
  const getUnreadNotifications = () => {
    return notifications.filter(notif => !notif.isRead);
  };

  // Set navigation reference for handling notification taps
  const setNavigationRef = (navigationRef) => {
    notificationService.setNavigationRef(navigationRef);
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    sendChatNotification,
    sendPromotionNotification,
    getNotificationsByCategory,
    getUnreadNotifications,
    setNavigationRef,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
