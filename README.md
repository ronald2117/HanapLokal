# LokalFinds

A React Native mobile application that connects local stores with nearby customers, making it easier for customers to discover local businesses and for small businesses to gain an online presence.

## Features

### Customer Experience
- **Store Discovery**: Find local stores based on location
- **Search Functionality**: Search for specific stores or products
- **Store Profiles**: View detailed store information including hours, contact, and description
- **Product Browsing**: Browse products with pricing and availability
- **Product Details**: View detailed product information
- **Favorites**: Mark and manage favorite stores

### Seller Experience
- **Store Creation**: Easy store profile setup
- **Store Management**: Edit store information and details
- **Product Management**: Add, update, and manage product inventory
- **Inventory Status**: Track product availability (in stock/out of stock)

### Authentication
- Email/password registration and login
- Anonymous guest access for quick browsing
- Secure Firebase authentication

## Technology Stack

- **Frontend**: React Native Expo (JavaScript)
- **Backend**: Google Firebase
  - Firestore for real-time database
  - Authentication for user management
- **Navigation**: React Navigation v6
- **State Management**: React Context API
- **Location Services**: Expo Location
- **Local Storage**: AsyncStorage

## Getting Started

### Prerequisites
- Node.js (14 or higher)
- npm or yarn
- Expo CLI
- Firebase project with Firestore and Authentication enabled

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd lokalfinds
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Firebase:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Firestore Database and Authentication
   - Copy your Firebase configuration
   - Update `src/services/firebaseConfig.js` with your Firebase credentials

4. Start the development server:
   ```bash
   npm start
   ```

### Running the App

- **Web**: Press `w` in the terminal or visit the web URL
- **iOS**: Press `i` for iOS simulator (macOS only) or scan QR code with Expo Go app
- **Android**: Press `a` for Android emulator or scan QR code with Expo Go app

## Firebase Setup

1. Create a new Firebase project
2. Enable the following services:
   - **Authentication**: Enable Email/Password and Anonymous sign-in methods
   - **Firestore Database**: Create database in test mode initially

3. Update the Firebase configuration in `src/services/firebaseConfig.js`:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id"
   };
   ```

## App Structure

```
src/
├── components/           # Reusable UI components
│   ├── StoreCard.js     # Store display card
│   └── ProductCard.js   # Product display card
├── contexts/            # React Context providers
│   ├── AuthContext.js   # Authentication state management
│   └── LocationContext.js # Location services
├── screens/             # Application screens
│   ├── auth/           # Authentication screens
│   ├── main/           # Main app screens
│   └── management/     # Store/product management
└── services/           # External services
    └── firebaseConfig.js # Firebase configuration
```

## Data Models

### Store
```javascript
{
  id: string,
  name: string,
  address: string,
  hours: string,
  contact: string,
  description: string,
  ownerId: string,
  createdAt: timestamp
}
```

### Product
```javascript
{
  id: string,
  name: string,
  price: number,
  description: string,
  inStock: boolean,
  storeId: string,
  imageUrl: string,
  createdAt: timestamp
}
```

## MVP Limitations

This is a Minimum Viable Product (MVP) with the following intentional limitations:

- **Image Uploads**: Products use placeholder image URLs
- **Payment Processing**: No transaction or payment functionality
- **Advanced Geolocation**: Basic location detection without precise distance calculations
- **Order Management**: No order fulfillment system
- **Real-time Chat**: No communication features between buyers and sellers

## Future Enhancements

- Image upload and management
- Payment processing integration
- Advanced location-based filtering
- Real-time messaging between customers and store owners
- Order management and tracking
- Push notifications
- Reviews and ratings system
- Analytics dashboard for store owners

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.
