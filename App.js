import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Theme
import { Colors } from './src/styles/theme';

// Contexts
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { LocationProvider } from './src/contexts/LocationContext';
import { LanguageProvider, useLanguage } from './src/contexts/LanguageContext';

// Auth Screens
import LoginScreen from './src/screens/LoginScreen_new';
import SignupScreen from './src/screens/SignupScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';

// Main Screens
import HomeScreen from './src/screens/HomeScreen';
import StoreDetailsScreen from './src/screens/StoreDetailsScreen';
import StoreMapScreen from './src/screens/StoreMapScreen';
import ProductDetailsScreen from './src/screens/ProductDetailsScreen';
import MyStoreScreen from './src/screens/MyStoreScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ReviewScreen from './src/screens/ReviewScreen';
import LanguageSettingsScreen from './src/screens/LanguageSettingsScreen';
import StoreReviewScreen from './src/screens/StoreReviewScreen';
import StoreReviewsScreen from './src/screens/StoreReviewsScreen';

// Store Management Screens
import CreateStoreScreen from './src/screens/CreateStoreScreen';
import EditStoreScreen from './src/screens/EditStoreScreen';
import AddProductScreen from './src/screens/AddProductScreen';
import EditProductScreen from './src/screens/EditProductScreen';
import StoreSettingsScreen from './src/screens/StoreSettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

function HomeStack() {
  const { t } = useLanguage();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.text.white,
      }}
    >
      <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen}
        options={{ headerShown: false }} // We handle header in the component
      />
      <Stack.Screen 
        name="StoreDetails" 
        component={StoreDetailsScreen}
        options={{ title: t('storeDetails') }}
      />
      <Stack.Screen 
        name="StoreMap" 
        component={StoreMapScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ProductDetails" 
        component={ProductDetailsScreen}
        options={{ title: t('productDetails') }}
      />
      <Stack.Screen 
        name="StoreReview" 
        component={StoreReviewScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="StoreReviews" 
        component={StoreReviewsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function MyStoreStack() {
  const { t } = useLanguage();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.text.white,
      }}
    >
      <Stack.Screen 
        name="MyStoreMain" 
        component={MyStoreScreen}
        options={{ title: t('myStore') }}
      />
      <Stack.Screen 
        name="CreateStore" 
        component={CreateStoreScreen}
        options={{ title: t('createStore') }}
      />
      <Stack.Screen 
        name="EditStore" 
        component={EditStoreScreen}
        options={{ title: t('editStore') }}
      />
      <Stack.Screen 
        name="AddProduct" 
        component={AddProductScreen}
        options={{ title: t('addProduct') }}
      />
      <Stack.Screen 
        name="EditProduct" 
        component={EditProductScreen}
        options={{ title: t('editProduct') }}
      />
      <Stack.Screen 
        name="StoreSettings" 
        component={StoreSettingsScreen}
        options={{ title: t('storeSettings') }}
      />
    </Stack.Navigator>
  );
}

function FavoritesStack() {
  const { t } = useLanguage();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.text.white,
      }}
    >
      <Stack.Screen 
        name="FavoritesMain" 
        component={FavoritesScreen}
        options={{ title: t('favorites') }}
      />
      <Stack.Screen 
        name="StoreDetails" 
        component={StoreDetailsScreen}
        options={{ title: t('storeDetails') }}
      />
      <Stack.Screen 
        name="StoreMap" 
        component={StoreMapScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ProductDetails" 
        component={ProductDetailsScreen}
        options={{ title: t('productDetails') }}
      />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  const { t } = useLanguage();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.text.white,
      }}
    >
      <Stack.Screen 
        name="ProfileMain" 
        component={ProfileScreen}
        options={{ title: t('profile') }}
      />
      <Stack.Screen 
        name="ReviewScreen" 
        component={ReviewScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="LanguageSettings" 
        component={LanguageSettingsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { t } = useLanguage();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'MyStore') {
            iconName = focused ? 'storefront' : 'storefront-outline';
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.text.secondary,
        tabBarStyle: {
          backgroundColor: Colors.background.card,
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: Colors.text.primary,
          shadowOffset: { width: 0, height: -5 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 2,
        },
        headerShown: false,
        tabBarHideOnKeyboard: true, // Hide tab bar when keyboard is open
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{ title: t('home') }}
      />
      <Tab.Screen 
        name="MyStore" 
        component={MyStoreStack}
        options={{ title: t('myStore') }}
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesStack}
        options={{ title: t('favorites') }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{ title: t('profile') }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { currentUser } = useAuth();
  const { language } = useLanguage(); // Add language dependency for re-render

  return (
    <NavigationContainer key={`${currentUser ? 'authenticated' : 'unauthenticated'}-${language}`}>
      {currentUser ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AuthProvider>
          <LocationProvider>
            <AppNavigator />
            <StatusBar style="light" backgroundColor={Colors.primary} />
          </LocationProvider>
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
