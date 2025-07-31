<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# HanapLokal - Local Business & Service Discovery App
## Project Overview
HanapLokal is a React Native Expo application that connects local stores and service providers with nearby customers. The app focuses on discovery and basic business/product/service management.

## Technology Stack
- **Frontend**: React Native Expo (JavaScript)
- **Backend**: Google Firebase (Firestore, Authentication)
- **Navigation**: React Navigation v6
- **State Management**: React Context API
- **Local Storage**: AsyncStorage for favorites

## Key Features
- User authentication (email/password and anonymous)
- Store and service discovery with search functionality
- Store, product, and service management for business owners
- Favorites system
- Location-based services
- Product and service browsing and details

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
- **services**: Service information (name, price, description, available, providerId, category)

## Important Notes
- This is an MVP - image upload functionality uses placeholder URLs
- No payment processing or order fulfillment
- Anonymous authentication is used for quick demo purposes
- Location services require user permission
