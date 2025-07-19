import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Contexts
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { LocationProvider } from './src/contexts/LocationContext';

// Auth Screens
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';

// Main Screens
import HomeScreen from './src/screens/HomeScreen';
import StoreDetailsScreen from './src/screens/StoreDetailsScreen';
import ProductDetailsScreen from './src/screens/ProductDetailsScreen';
import MyStoreScreen from './src/screens/MyStoreScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Store Management Screens
import CreateStoreScreen from './src/screens/CreateStoreScreen';
import EditStoreScreen from './src/screens/EditStoreScreen';
import AddProductScreen from './src/screens/AddProductScreen';
import EditProductScreen from './src/screens/EditProductScreen';

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
    <Stack.Navigator>
      <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen}
        options={{ title: 'LokalFinds' }}
      />
      <Stack.Screen 
        name="StoreDetails" 
        component={StoreDetailsScreen}
        options={{ title: 'Store Details' }}
      />
      <Stack.Screen 
        name="ProductDetails" 
        component={ProductDetailsScreen}
        options={{ title: 'Product Details' }}
      />
    </Stack.Navigator>
  );
}

function MyStoreStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MyStoreMain" 
        component={MyStoreScreen}
        options={{ title: 'My Store' }}
      />
      <Stack.Screen 
        name="CreateStore" 
        component={CreateStoreScreen}
        options={{ title: 'Create Store' }}
      />
      <Stack.Screen 
        name="EditStore" 
        component={EditStoreScreen}
        options={{ title: 'Edit Store' }}
      />
      <Stack.Screen 
        name="AddProduct" 
        component={AddProductScreen}
        options={{ title: 'Add Product' }}
      />
      <Stack.Screen 
        name="EditProduct" 
        component={EditProductScreen}
        options={{ title: 'Edit Product' }}
      />
    </Stack.Navigator>
  );
}

function FavoritesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="FavoritesMain" 
        component={FavoritesScreen}
        options={{ title: 'Favorites' }}
      />
      <Stack.Screen 
        name="StoreDetails" 
        component={StoreDetailsScreen}
        options={{ title: 'Store Details' }}
      />
      <Stack.Screen 
        name="ProductDetails" 
        component={ProductDetailsScreen}
        options={{ title: 'Product Details' }}
      />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator>
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
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="MyStore" component={MyStoreStack} />
      <Tab.Screen name="Favorites" component={FavoritesStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { currentUser } = useAuth();

  return (
    <NavigationContainer>
      {currentUser ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </LocationProvider>
    </AuthProvider>
  );
}
