<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# LokalFinds - Local Store Discovery App

## Project Overview
LokalFinds is a React Native Expo application that connects local stores with nearby customers. The app focuses on discovery and basic store/product management.

## Technology Stack
- **Frontend**: React Native Expo (JavaScript)
- **Backend**: Google Firebase (Firestore, Authentication)
- **Navigation**: React Navigation v6
- **State Management**: React Context API
- **Local Storage**: AsyncStorage for favorites

## Key Features
- User authentication (email/password and anonymous)
- Store discovery with search functionality
- Store and product management for sellers
- Favorites system
- Location-based services
- Product browsing and details

## Code Guidelines
- Use functional components with hooks
- Follow React Navigation v6 patterns
- Use Firebase v9+ modular SDK
- Implement proper error handling with try-catch blocks
- Use StyleSheet for component styling
- Follow consistent naming conventions (camelCase for variables, PascalCase for components)

## Firebase Collections Structure
- **stores**: Store information (name, address, hours, contact, description, ownerId)
- **products**: Product information (name, price, description, inStock, storeId, imageUrl)

## Important Notes
- This is an MVP - image upload functionality uses placeholder URLs
- No payment processing or order fulfillment
- Anonymous authentication is used for quick demo purposes
- Location services require user permission
