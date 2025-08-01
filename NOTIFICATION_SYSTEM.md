# Notification System Documentation

## Overview

HanapLocal features a comprehensive, extensible notification system that supports real-time notifications for chat messages, store promotions, order updates, and more. The system is built with scalability in mind and can easily accommodate future notification types.

## Architecture

### Core Components

1. **NotificationService** (`src/services/notificationService.js`)
   - Singleton service handling all notification operations
   - Manages push notifications via Expo Push API
   - Handles Firestore operations for notification storage
   - Provides extensible notification types and categories

2. **NotificationContext** (`src/contexts/NotificationContext.js`)
   - React context providing notification state and actions
   - Real-time notification updates via Firestore listeners
   - Unread count management and badge updates

3. **NotificationsScreen** (`src/screens/NotificationsScreen.js`)
   - UI for displaying all user notifications
   - Category-based filtering (Messages, Promotions, Orders, etc.)
   - Mark as read functionality and navigation handling

## Notification Types

The system supports the following notification types:

- **CHAT_MESSAGE**: Real-time chat messages
- **STORE_PROMOTION**: Marketing promotions from stores
- **ORDER_UPDATE**: Order status changes (confirmed, shipped, delivered)
- **PRODUCT_AVAILABILITY**: Out-of-stock item restock notifications
- **REVIEW_REQUEST**: Request customers to review purchases
- **SYSTEM_ANNOUNCEMENT**: App-wide announcements
- **STORE_FOLLOW**: When someone follows a store
- **FAVORITE_STORE_UPDATE**: Updates from favorited stores

## Categories

Notifications are organized into categories for better user experience:

- **COMMUNICATION**: Chat messages
- **MARKETING**: Promotions and announcements  
- **TRANSACTIONAL**: Orders and reviews
- **SOCIAL**: Follows and social interactions
- **SYSTEM**: App updates and maintenance

## Implementation

### 1. Setup and Installation

Install required dependencies:
```bash
npm install expo-notifications
```

### 2. Initialize Notification Service

The service is automatically initialized when a user logs in:

```javascript
import { notificationService } from '../services/notificationService';

// Initialize with user ID
await notificationService.initialize(userId);
```

### 3. Sending Chat Notifications

Automatically sent when messages are sent in ChatDetailScreen:

```javascript
import { useNotifications } from '../contexts/NotificationContext';

const { sendChatNotification } = useNotifications();

await sendChatNotification({
  recipientId: otherParticipant.uid,
  senderName: currentUser.displayName,
  senderProfileImage: currentUser.photoURL,
  conversationId: conversationId,
  message: messageText,
  isStore: userProfile?.isStore || false,
});
```

### 4. Sending Promotion Notifications

For store owners to send promotional notifications:

```javascript
import { useNotifications } from '../contexts/NotificationContext';

const { sendPromotionNotification } = useNotifications();

await sendPromotionNotification({
  recipientIds: ['userId1', 'userId2'], // Array of user IDs
  storeId: storeId,
  storeName: storeName,
  title: '🎉 50% Off Sale!',
  description: 'Limited time offer on all items',
  promoCode: 'SAVE50',
  imageUrl: 'https://example.com/promo.jpg',
});
```

### 5. Custom Notification Types

To add new notification types:

1. Add to `NOTIFICATION_TYPES` in `notificationService.js`:
```javascript
export const NOTIFICATION_TYPES = {
  // ... existing types
  NEW_FEATURE_ANNOUNCEMENT: 'new_feature_announcement',
  LOYALTY_REWARD: 'loyalty_reward',
};
```

2. Create a new sending method:
```javascript
async sendLoyaltyRewardNotification({
  recipientId,
  rewardTitle,
  pointsEarned,
  storeId,
}) {
  return this.createNotification({
    recipientId,
    senderId: storeId,
    type: NOTIFICATION_TYPES.LOYALTY_REWARD,
    category: NOTIFICATION_CATEGORIES.MARKETING,
    priority: NOTIFICATION_PRIORITY.NORMAL,
    title: `🎁 ${rewardTitle}`,
    body: `You earned ${pointsEarned} loyalty points!`,
    data: {
      storeId,
      pointsEarned,
      rewardType: rewardTitle,
    },
  });
}
```

3. Add navigation handling in `handleNotificationNavigation()`:
```javascript
case NOTIFICATION_TYPES.LOYALTY_REWARD:
  this.navigationRef.navigate('LoyaltyRewards', {
    storeId: data.storeId,
  });
  break;
```

## Data Structure

### Firestore Schema

**Collection: `notifications`**
```javascript
{
  id: 'notification-id',
  recipientId: 'user-id',
  senderId: 'sender-id',
  type: 'chat_message',
  category: 'communication',
  priority: 'high',
  title: 'John Doe',
  body: 'Hey, is this item still available?',
  data: {
    conversationId: 'conv-id',
    otherParticipant: { ... },
    // ... other type-specific data
  },
  isRead: false,
  createdAt: Timestamp,
  readAt: Timestamp | null,
  scheduleAt: Timestamp | null, // for scheduled notifications
}
```

**User Profile Updates (for push tokens)**
```javascript
{
  userId: 'user-id',
  pushToken: 'ExponentPushToken[......]',
  pushTokenUpdatedAt: Timestamp,
  // ... other user data
}
```

## Features

### Real-time Updates
- Uses Firestore real-time listeners for instant notification updates
- Automatic unread count calculation and badge updates
- Live synchronization across all user devices

### Push Notifications
- Native push notifications via Expo Push API
- Automatic token management and updates
- Handles notification permissions and fallbacks

### Smart Navigation
- Tap notifications to navigate to relevant screens
- Context-aware navigation based on notification type
- Deep linking support for external notification taps

### User Experience
- Category-based filtering for easy browsing
- Mark individual or all notifications as read
- Visual indicators for unread notifications
- Time-based formatting (just now, 5m ago, etc.)

### Extensibility
- Easy to add new notification types and categories
- Configurable priority levels and scheduling
- Pluggable notification delivery methods
- Custom data payload support

## Usage Examples

### Store Owner Sending Bulk Promotions
```javascript
// Get all customers who favorited this store
const customers = await getStoreFavorites(storeId);
const recipientIds = customers.map(c => c.userId);

// Send promotion to all customers
await sendPromotionNotification({
  recipientIds,
  storeId,
  storeName: 'Joe\'s Electronics',
  title: 'Weekend Flash Sale!',
  description: 'Up to 70% off on selected items',
  promoCode: 'WEEKEND70',
});
```

### Order Status Updates
```javascript
await notificationService.createNotification({
  recipientId: customerId,
  senderId: storeId,
  type: NOTIFICATION_TYPES.ORDER_UPDATE,
  category: NOTIFICATION_CATEGORIES.TRANSACTIONAL,
  priority: NOTIFICATION_PRIORITY.HIGH,
  title: 'Order Shipped! 📦',
  body: 'Your order #12345 is on its way',
  data: {
    orderId: '12345',
    trackingNumber: 'TRK123456789',
    estimatedDelivery: '2024-01-15',
  },
});
```

### Scheduled Notifications
```javascript
// Schedule a reminder for tomorrow
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

await notificationService.scheduleNotification({
  recipientId: userId,
  senderId: storeId,
  type: NOTIFICATION_TYPES.REVIEW_REQUEST,
  category: NOTIFICATION_CATEGORIES.TRANSACTIONAL,
  title: 'How was your purchase?',
  body: 'We\'d love to hear your feedback!',
  data: { orderId, productId },
  scheduleAt: tomorrow,
});
```

## Best Practices

1. **Respectful Frequency**: Don't spam users with too many notifications
2. **Relevant Content**: Ensure notifications provide value to users
3. **Clear Actions**: Make it obvious what users should do when they tap
4. **Error Handling**: Gracefully handle notification failures
5. **User Preferences**: Respect user notification settings
6. **Testing**: Test notifications on both platforms (iOS/Android)

## Troubleshooting

### Common Issues

1. **Push tokens not updating**
   - Check if notification permissions are granted
   - Verify Firebase configuration
   - Ensure user profile updates are working

2. **Notifications not appearing**
   - Check Expo Push API response for errors
   - Verify notification payload format
   - Test with different priority levels

3. **Navigation not working**
   - Ensure navigation reference is set correctly
   - Check route parameters and screen names
   - Verify deep linking configuration

### Debug Tools

Use the `NotificationExampleScreen` to test different notification types and debug issues.

## Future Enhancements

- Web push notifications support
- Rich media notifications (images, videos)
- Notification scheduling UI for store owners
- Advanced user preference controls
- Analytics and notification performance tracking
- A/B testing for notification content
- Integration with external marketing platforms
