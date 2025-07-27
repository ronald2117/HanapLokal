# 🏪 LocalFind

**Tuklasin at Suportahan ang mga Lokal na Negosyo** 🇵🇭

A modern, Filipino-inspired React Native mobile application that connects local stores and service providers with nearby customers. Built with love for the Filipino community to support local businesses and strengthen neighborhood commerce.

## ✨ Features

### 👥 For Customers (Mga Mamimili)
- **🗺️ Store & Service Discovery**: Hanapin ang mga malapit na tindahan at serbisyo
- **🔍 Smart Search**: Maghanap ng tindahan, produkto o serbisyo gamit ang Tagalog at English
- **📍 Location-based**: Makita ang distansya at direksyon
- **❤️ Favorites (Paborito)**: I-save ang mga paboritong tindahan at serbisyo
- **📱 Modern UI**: Filipino-inspired design na madaling gamitin
- **🛒 Product & Service Browsing**: Tingnan ang mga produkto, serbisyo at presyo

### 🏪 For Store Owners & Service Providers (Mga Negosyante)
- **🆕 Easy Setup**: Madaling gumawa ng tindahan o serbisyo profile
- **📝 Business Management**: I-edit ang impormasyon ng negosyo
- **📦 Product & Service Management**: Magdagdag at mag-update ng mga produkto at serbisyo
- **📸 Image Upload**: Mag-upload ng mga larawan gamit ang camera o gallery
- **📊 Inventory Tracking**: Bantayan kung meron o wala sa stock
- **💰 Pricing in Pesos**: Presyo sa Pilipinong piso (₱)

### 🔐 Authentication & Security
- **📧 Email/Password**: Secure na pag-register at login
- **👤 Guest Access**: Mag-browse bilang bisita
- **🔒 Firebase Security**: Protected na user data
- **🌐 Offline Support**: Makakagamit kahit mahina ang internet

## 🎨 Modern Filipino Design

- **🌅 Sunset Colors**: Inspired by Manila Bay sunset (orange, gold, blue)
- **🏝️ Cultural Elements**: Filipino emojis and cultural references
- **📱 Modern Interface**: Clean, intuitive design
- **🇵🇭 Tagalog Language**: Filipino-first user interface
- **⚡ Smooth Animations**: Engaging user experience
- **📐 Responsive Layout**: Works on all screen sizes

## 🖼️ Screenshots & Design

### Design Philosophy
Our design celebrates Filipino culture while maintaining modern UX standards:

- **Color Palette**: Warm sunset oranges (#FF6B35), ocean blues (#1976D2), and golden yellows (#FFC107)
- **Typography**: Clear, readable fonts with proper hierarchy
- **Cultural Touch**: Filipino greetings, Tagalog interface, local business types
- **Modern Components**: Cards, gradients, smooth shadows, and intuitive navigation

### Key Design Elements
- 🏪 **Store Icons**: Sari-sari store, kainan, repair shops with appropriate emojis
- 💰 **Philippine Peso**: Prices displayed in ₱ with "lang" suffix for friendly pricing
- 🗣️ **Filipino Language**: "Kumusta!", "Meron/Wala", "Paborito", etc.
- 🎯 **Local Context**: Categories like "Sari-Sari", "Kainan", "Repair"

*Screenshots will be added once the app is deployed and tested on physical devices*

## Technology Stack

- **Frontend**: React Native Expo (JavaScript)
- **Backend**: Google Firebase
  - Firestore for real-time database
  - Authentication for user management
- **Image Storage**: Cloudinary for image upload and optimization
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
   cd localfind
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Firebase:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Firestore Database and Authentication
   - Copy your Firebase configuration
   - Update `.env` file with your Firebase credentials

4. Configure Cloudinary:
   - Create a Cloudinary account at https://cloudinary.com
   - Create an unsigned upload preset
   - Update `.env` file with your Cloudinary credentials
   - See `CLOUDINARY_SETUP.md` for detailed instructions

5. Start the development server:
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

- **Payment Processing**: No transaction or payment functionality
- **Advanced Geolocation**: Basic location detection without precise distance calculations
- **Order Management**: No order fulfillment system
- **Real-time Chat**: No communication features between buyers and sellers

## Future Enhancements

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
