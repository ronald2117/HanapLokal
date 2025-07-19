# Firebase Setup Guide for LokalFinds

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `lokalfinds` (or your preferred name)
4. Follow the setup wizard

## 2. Enable Authentication

1. In your Firebase project, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** authentication
3. Enable **Anonymous** authentication (for guest users)

## 3. Set up Firestore Database

1. Go to **Firestore Database** > **Create database**
2. Choose **Start in test mode** (for development)
3. Select a location closest to your users

## 4. Get Your Configuration

1. Go to **Project Settings** (gear icon)
2. In the "Your apps" section, click **Web** (`</>` icon)
3. Register your app with nickname: `lokalfinds-app`
4. Copy the configuration object

## 5. Configure Your App

1. Open the `.env` file in the project root
2. Replace the placeholder values with your Firebase config:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your-actual-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

3. The `src/services/firebaseConfig.js` file is already configured to use these environment variables

## 6. Firestore Rules (Development)

For development, you can use these permissive rules in **Firestore** > **Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 7. Test Your Setup

1. Run `npm start` or `expo start`
2. Try signing up with an email and password
3. Try the "Continue as Guest" option
4. Create a store and add products

## Collection Structure

The app will automatically create these Firestore collections:

### stores
```javascript
{
  name: string,
  address: string,
  hours: string,
  contact: string,
  description: string,
  ownerId: string, // Firebase auth user ID
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### products
```javascript
{
  name: string,
  price: number,
  description: string,
  inStock: boolean,
  storeId: string, // Reference to store document
  imageUrl: string, // Placeholder URL
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Security Notes

- The `.env` file is already in `.gitignore` to prevent committing sensitive data
- In production, implement proper Firestore security rules
- Consider using Firebase Admin SDK for backend operations
