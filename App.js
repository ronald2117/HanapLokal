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

// Auth Screens
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';

// Main Screens
import HomeScreen from './src/screens/HomeScreen';
import StoreDetailsScreen from './src/screens/StoreDetailsScreen';
import StoreMapScreen from './src/screens/StoreMapScreen';
import ProductDetailsScreen from './src/screens/ProductDetailsScreen';
import MyStoreScreen from './src/screens/MyStoreScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import ProfileScreen from './src/screens/ProfileScreen';

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
    </Stack.Navigator>
  );
}

function HomeStack() {
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
        options={{ title: 'Detalye ng Tindahan' }}
      />
      <Stack.Screen 
        name="StoreMap" 
        component={StoreMapScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ProductDetails" 
        component={ProductDetailsScreen}
        options={{ title: 'Detalye ng Produkto' }}
      />
    </Stack.Navigator>
  );
}

function MyStoreStack() {
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
        options={{ title: 'Aking Tindahan' }}
      />
      <Stack.Screen 
        name="CreateStore" 
        component={CreateStoreScreen}
        options={{ title: 'Gumawa ng Tindahan' }}
      />
      <Stack.Screen 
        name="EditStore" 
        component={EditStoreScreen}
        options={{ title: 'I-edit ang Tindahan' }}
      />
      <Stack.Screen 
        name="AddProduct" 
        component={AddProductScreen}
        options={{ title: 'Magdagdag ng Produkto' }}
      />
      <Stack.Screen 
        name="EditProduct" 
        component={EditProductScreen}
        options={{ title: 'I-edit ang Produkto' }}
      />
      <Stack.Screen 
        name="StoreSettings" 
        component={StoreSettingsScreen}
        options={{ title: 'Mga Setting ng Tindahan' }}
      />
    </Stack.Navigator>
  );
}

function FavoritesStack() {
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
        options={{ title: 'Mga Paborito' }}
      />
      <Stack.Screen 
        name="StoreDetails" 
        component={StoreDetailsScreen}
        options={{ title: 'Detalye ng Tindahan' }}
      />
      <Stack.Screen 
        name="StoreMap" 
        component={StoreMapScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ProductDetails" 
        component={ProductDetailsScreen}
        options={{ title: 'Detalye ng Produkto' }}
      />
    </Stack.Navigator>
  );
}

function ProfileStack() {
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
        options={{ title: 'Profile' }}
      />
    </Stack.Navigator>
  );
}

function MainTabs() {
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
        options={{ title: 'Simula' }}
      />
      <Tab.Screen 
        name="MyStore" 
        component={MyStoreStack}
        options={{ title: 'Aking Tindahan' }}
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesStack}
        options={{ title: 'Paborito' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { currentUser } = useAuth();

  return (
    <NavigationContainer key={currentUser ? 'authenticated' : 'unauthenticated'}>
      {currentUser ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <LocationProvider>
          <AppNavigator />
          <StatusBar style="light" backgroundColor={Colors.primary} />
        </LocationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
