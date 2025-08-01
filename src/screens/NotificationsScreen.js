import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/theme';
import { NOTIFICATION_CATEGORIES, NOTIFICATION_TYPES } from '../services/notificationService';

export default function NotificationsScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead,
    getNotificationsByCategory 
  } = useNotifications();
  const { isGuestUser } = useAuth();

  const categories = [
    { id: 'all', name: 'All', icon: 'notifications' },
    { id: NOTIFICATION_CATEGORIES.COMMUNICATION, name: 'Messages', icon: 'chatbubbles' },
    { id: NOTIFICATION_CATEGORIES.MARKETING, name: 'Promotions', icon: 'megaphone' },
    { id: NOTIFICATION_CATEGORIES.TRANSACTIONAL, name: 'Orders', icon: 'receipt' },
    { id: NOTIFICATION_CATEGORIES.SOCIAL, name: 'Social', icon: 'people' },
  ];

  const filteredNotifications = selectedCategory === 'all' 
    ? notifications 
    : getNotificationsByCategory(selectedCategory);

  const onRefresh = () => {
    setRefreshing(true);
    // Refresh will happen automatically through the context
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now - date) / (1000 * 60);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    const icons = {
      [NOTIFICATION_TYPES.CHAT_MESSAGE]: 'chatbubble',
      [NOTIFICATION_TYPES.STORE_PROMOTION]: 'megaphone',
      [NOTIFICATION_TYPES.ORDER_UPDATE]: 'receipt',
      [NOTIFICATION_TYPES.PRODUCT_AVAILABILITY]: 'cube',
      [NOTIFICATION_TYPES.REVIEW_REQUEST]: 'star',
      [NOTIFICATION_TYPES.SYSTEM_ANNOUNCEMENT]: 'information-circle',
      [NOTIFICATION_TYPES.STORE_FOLLOW]: 'person-add',
      [NOTIFICATION_TYPES.FAVORITE_STORE_UPDATE]: 'heart',
    };
    return icons[type] || 'notifications';
  };

  const getNotificationColor = (type) => {
    const colors = {
      [NOTIFICATION_TYPES.CHAT_MESSAGE]: Colors.primary,
      [NOTIFICATION_TYPES.STORE_PROMOTION]: Colors.accent,
      [NOTIFICATION_TYPES.ORDER_UPDATE]: Colors.success,
      [NOTIFICATION_TYPES.PRODUCT_AVAILABILITY]: Colors.warning,
      [NOTIFICATION_TYPES.REVIEW_REQUEST]: Colors.info,
      [NOTIFICATION_TYPES.SYSTEM_ANNOUNCEMENT]: Colors.primary,
      [NOTIFICATION_TYPES.STORE_FOLLOW]: Colors.accent,
      [NOTIFICATION_TYPES.FAVORITE_STORE_UPDATE]: Colors.error,
    };
    return colors[type] || Colors.primary;
  };

  const handleNotificationPress = async (notification) => {
    // Mark as read
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case NOTIFICATION_TYPES.CHAT_MESSAGE:
        navigation.navigate('Chats', {
          screen: 'ChatDetail',
          params: {
            conversationId: notification.data.conversationId,
            otherParticipant: notification.data.otherParticipant,
          },
        });
        break;
      case NOTIFICATION_TYPES.STORE_PROMOTION:
        navigation.navigate('StoreDetails', {
          storeId: notification.data.storeId,
        });
        break;
      case NOTIFICATION_TYPES.ORDER_UPDATE:
        // Navigate to orders screen when implemented
        break;
      default:
        break;
    }
  };

  const renderCategoryTab = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryTab,
        selectedCategory === item.id && styles.activeCategoryTab
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Ionicons
        name={item.icon}
        size={20}
        color={selectedCategory === item.id ? Colors.text.white : Colors.text.secondary}
      />
      <Text
        style={[
          styles.categoryTabText,
          selectedCategory === item.id && styles.activeCategoryTabText
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.isRead && styles.unreadNotification
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationIcon}>
        <View style={[
          styles.iconContainer,
          { backgroundColor: getNotificationColor(item.type) }
        ]}>
          <Ionicons
            name={getNotificationIcon(item.type)}
            size={20}
            color={Colors.text.white}
          />
        </View>
        {!item.isRead && <View style={styles.unreadDot} />}
      </View>

      <View style={styles.notificationContent}>
        <Text style={[
          styles.notificationTitle,
          !item.isRead && styles.unreadTitle
        ]}>
          {item.title}
        </Text>
        <Text style={styles.notificationBody} numberOfLines={2}>
          {item.body}
        </Text>
        <Text style={styles.notificationTime}>
          {formatTime(item.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (isGuestUser()) {
    return (
      <View style={styles.container}>
        <View style={styles.guestContainer}>
          <Ionicons name="notifications" size={80} color={Colors.primary} />
          <Text style={styles.guestTitle}>Stay Updated</Text>
          <Text style={styles.guestSubtitle}>
            Get notified about new messages, promotions, and updates from your favorite stores.
          </Text>
          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => navigation.navigate('Auth', { screen: 'Signup' })}
          >
            <Text style={styles.signupButtonText}>Sign Up for Notifications</Text>
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
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity
                style={styles.markAllButton}
                onPress={markAllAsRead}
              >
                <Text style={styles.markAllText}>Mark all read</Text>
              </TouchableOpacity>
            )}
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{unreadCount}</Text>
            </View>
          </View>
        </View>

        {/* Category Tabs */}
        {/* <FlatList
          data={categories}
          renderItem={renderCategoryTab}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTabs}
        /> */}
      </LinearGradient>

      {/* Notifications List */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading notifications...</Text>
          </View>
        ) : filteredNotifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="notifications-outline"
              size={64}
              color={Colors.text.light}
            />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySubtitle}>
              {selectedCategory === 'all'
                ? "You're all caught up!"
                : `No ${categories.find(c => c.id === selectedCategory)?.name.toLowerCase()} notifications`
              }
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredNotifications}
            renderItem={renderNotificationItem}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.primary]}
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
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: 40,
    paddingBottom: Spacing.md,
  },
  
  headerTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.white,
  },
  
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  markAllButton: {
    marginRight: Spacing.md,
  },
  
  markAllText: {
    color: Colors.text.white,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  
  unreadBadge: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  unreadCount: {
    color: Colors.text.white,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  
  categoryTabs: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  
  activeCategoryTab: {
    backgroundColor: Colors.text.white,
  },
  
  categoryTabText: {
    color: Colors.text.white,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginLeft: Spacing.xs,
  },
  
  activeCategoryTabText: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
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
  },
  
  listContent: {
    paddingBottom: Spacing.xl,
  },
  
  notificationItem: {
    flexDirection: 'row',
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    ...Shadows.base,
  },
  
  unreadNotification: {
    backgroundColor: Colors.primaryLight,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  
  notificationIcon: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.accent,
    borderWidth: 2,
    borderColor: Colors.background.card,
  },
  
  notificationContent: {
    flex: 1,
  },
  
  notificationTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  
  unreadTitle: {
    fontWeight: Typography.fontWeight.semibold,
  },
  
  notificationBody: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
    marginBottom: Spacing.xs,
  },
  
  notificationTime: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.light,
  },
  
  // Guest User Styles
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  
  guestTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  
  guestSubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
    marginBottom: Spacing.xl,
  },
  
  signupButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.base,
  },
  
  signupButtonText: {
    color: Colors.text.white,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
});
