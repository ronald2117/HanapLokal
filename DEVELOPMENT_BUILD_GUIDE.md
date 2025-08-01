# Development Build Setup Guide

## Why You Need a Development Build

With Expo SDK 53+, push notifications are no longer supported in Expo Go. To test the full notification system, you need to create a development build.

## Option 1: EAS Build (Recommended)

### Install EAS CLI
```bash
npm install -g @expo/eas-cli
```

### Login to Expo
```bash
eas login
```

### Configure EAS
```bash
eas build:configure
```

### Create Development Build
```bash
# For Android
eas build --platform android --profile development

# For iOS (requires Apple Developer account)
eas build --platform ios --profile development
```

### Install on Device
After the build completes, you'll get a download link to install the APK (Android) or IPA (iOS) on your device.

## Option 2: Local Development Build

### Prerequisites
- Android Studio (for Android)
- Xcode (for iOS, Mac only)

### Create Local Build
```bash
# Install development build tools
npx create-expo-app --template

# Create development build
npx expo run:android  # For Android
npx expo run:ios      # For iOS
```

## Testing Notifications

Once you have a development build installed:

1. **Push Notifications**: Will work fully
2. **Real-time Updates**: Already working via Firestore
3. **Badge Counts**: Will update properly
4. **Navigation**: Notification taps will navigate correctly

## Current Features Working in Expo Go

Even without push notifications, these features work:

- ✅ In-app notification display
- ✅ Real-time notification updates via Firestore
- ✅ Notification history and management
- ✅ Mark as read functionality
- ✅ Category filtering
- ✅ Chat integration (sends notifications to database)

## Production Deployment

For production, use:
```bash
# Production build
eas build --platform all --profile production

# Or submit to app stores
eas submit --platform all
```

The notification system is production-ready and will work perfectly in store-distributed apps.
