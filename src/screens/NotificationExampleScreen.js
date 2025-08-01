import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../contexts/NotificationContext';
import { Colors, Typography, Spacing, BorderRadius } from '../styles/theme';

// Example component showing how to send different types of notifications
export default function NotificationExampleScreen() {
  const [promoTitle, setPromoTitle] = useState('');
  const [promoDescription, setPromoDescription] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const { sendPromotionNotification } = useNotifications();

  const sendSamplePromotionNotification = async () => {
    if (!promoTitle || !promoDescription) {
      Alert.alert('Error', 'Please fill in title and description');
      return;
    }

    try {
      // Example: Send to all users who favorited this store
      // In real app, you'd get this from Firestore
      const exampleRecipientIds = ['user1', 'user2', 'user3'];
      
      await sendPromotionNotification({
        recipientIds: exampleRecipientIds,
        storeId: 'example-store-id',
        storeName: 'Example Store',
        title: promoTitle,
        description: promoDescription,
        promoCode: promoCode || undefined,
        imageUrl: 'https://example.com/promo-image.jpg',
      });

      Alert.alert('Success', 'Promotion notification sent!');
      setPromoTitle('');
      setPromoDescription('');
      setPromoCode('');
    } catch (error) {
      Alert.alert('Error', 'Failed to send notification');
      console.error('Error sending promotion:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Notification Examples</Text>
        <Text style={styles.subtitle}>
          This screen demonstrates how to send different types of notifications
        </Text>

        {/* Promotion Notification Example */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Send Promotion Notification</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Promotion Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 50% Off All Items!"
              value={promoTitle}
              onChangeText={setPromoTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Limited time offer! Get 50% off on all items this weekend only."
              value={promoDescription}
              onChangeText={setPromoDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Promo Code (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., SAVE50"
              value={promoCode}
              onChangeText={setPromoCode}
              autoCapitalize="characters"
            />
          </View>

          <TouchableOpacity
            style={styles.sendButton}
            onPress={sendSamplePromotionNotification}
          >
            <Ionicons name="megaphone" size={20} color={Colors.text.white} />
            <Text style={styles.sendButtonText}>Send Promotion</Text>
          </TouchableOpacity>
        </View>

        {/* Other Notification Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other Notification Types</Text>
          
          <View style={styles.exampleItem}>
            <Ionicons name="chatbubble" size={24} color={Colors.primary} />
            <View style={styles.exampleContent}>
              <Text style={styles.exampleTitle}>Chat Messages</Text>
              <Text style={styles.exampleDescription}>
                Automatically sent when someone sends a message
              </Text>
            </View>
          </View>

          <View style={styles.exampleItem}>
            <Ionicons name="receipt" size={24} color={Colors.success} />
            <View style={styles.exampleContent}>
              <Text style={styles.exampleTitle}>Order Updates</Text>
              <Text style={styles.exampleDescription}>
                Order confirmed, shipped, delivered notifications
              </Text>
            </View>
          </View>

          <View style={styles.exampleItem}>
            <Ionicons name="cube" size={24} color={Colors.warning} />
            <View style={styles.exampleContent}>
              <Text style={styles.exampleTitle}>Product Availability</Text>
              <Text style={styles.exampleDescription}>
                Notify when out-of-stock items are back
              </Text>
            </View>
          </View>

          <View style={styles.exampleItem}>
            <Ionicons name="star" size={24} color={Colors.accent} />
            <View style={styles.exampleContent}>
              <Text style={styles.exampleTitle}>Review Requests</Text>
              <Text style={styles.exampleDescription}>
                Ask customers to review their purchases
              </Text>
            </View>
          </View>

          <View style={styles.exampleItem}>
            <Ionicons name="person-add" size={24} color={Colors.info} />
            <View style={styles.exampleContent}>
              <Text style={styles.exampleTitle}>Store Follows</Text>
              <Text style={styles.exampleDescription}>
                When someone follows your store
              </Text>
            </View>
          </View>
        </View>

        {/* Implementation Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Implementation Notes</Text>
          <Text style={styles.noteText}>
            • Notifications are stored in Firestore 'notifications' collection{'\n'}
            • Push notifications are sent via Expo Push API{'\n'}
            • Users can filter notifications by category{'\n'}
            • Unread counts are tracked and shown with badges{'\n'}
            • Notification taps navigate to relevant screens{'\n'}
            • Extensible for future notification types
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  
  content: {
    padding: Spacing.xl,
  },
  
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
  },
  
  section: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  
  inputGroup: {
    marginBottom: Spacing.md,
  },
  
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  
  input: {
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.fontSize.base,
    backgroundColor: Colors.background.primary,
  },
  
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  
  sendButtonText: {
    color: Colors.text.white,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginLeft: Spacing.sm,
  },
  
  exampleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  
  exampleContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  
  exampleTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  
  exampleDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
  },
  
  noteText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
  },
});
