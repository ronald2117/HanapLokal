import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Theme
import { Colors, Typography, Spacing, BorderRadius } from './src/styles/theme';

// Contexts
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { LocationProvider } from './src/contexts/LocationContext';
import { LanguageProvider, useLanguage } from './src/contexts/LanguageContext';
import { NotificationProvider } from './src/contexts/NotificationContext';

// Auth Screens
import LoginScreen from './src/screens/LoginScreen_new';
import SignupScreen from './src/screens/SignupScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import TermsOfServiceScreen from './src/screens/TermsOfServiceScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';

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
import NotificationsScreen from './src/screens/NotificationsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Store Management Screens
import CreateStoreScreen from './src/screens/CreateStoreScreen';
import EditStoreScreen from './src/screens/EditStoreScreen';
import AddProductScreen from './src/screens/AddProductScreen';
import EditProductScreen from './src/screens/EditProductScreen';
import StoreSettingsScreen from './src/screens/StoreSettingsScreen';
import AddServiceScreen from './src/screens/AddServiceScreen';
import EditServiceScreen from './src/screens/EditServiceScreen';
import AddPortfolioImageScreen from './src/screens/AddPortfolioImageScreen';
import EditPortfolioImageScreen from './src/screens/EditPortfolioImageScreen';

// Chat Navigation Stack
import ChatStack from './src/navigation/ChatStack';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Modern header options generator
const getModernHeaderOptions = (title, t) => ({
  headerStyle: {
    backgroundColor: 'transparent',
  },
  headerBackground: () => (
    <LinearGradient
      colors={[Colors.primary, Colors.primaryLight]}
      style={{
        flex: 1,
        shadowColor: Colors.text.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
      }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    />
  ),
  headerTintColor: Colors.text.white,
  headerTitleStyle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.white,
  },
  headerBackTitleVisible: false,
  headerShadowVisible: false,
  title: typeof title === 'function' ? title() : title,
});

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
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    </Stack.Navigator>
  );
}

function HomeStack() {
  const { t } = useLanguage();
  
  return (
    <Stack.Navigator
      screenOptions={{
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
        options={getModernHeaderOptions(() => t('storeDetails'), t)}
      />
      <Stack.Screen 
        name="StoreMap" 
        component={StoreMapScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ProductDetails" 
        component={ProductDetailsScreen}
        options={getModernHeaderOptions(() => t('productDetails'), t)}
      />
      <Stack.Screen 
        name="StoreReview" 
        component={StoreReviewScreen}
        options={getModernHeaderOptions(() => t('writeReview'), t)}
      />
      <Stack.Screen 
        name="StoreReviews" 
        component={StoreReviewsScreen}
        options={getModernHeaderOptions(() => t('reviews'), t)}
      />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  const { t } = useLanguage();
  
  return (
    <Stack.Navigator
      screenOptions={{
        ...getModernHeaderOptions('', t),
        headerShown: true,
      }}
    >
      <Stack.Screen 
        name="ProfileMain" 
        component={ProfileScreen}
        options={getModernHeaderOptions(() => t('profile'), t)}
      />
      <Stack.Screen 
        name="MyStoreMain" 
        component={MyStoreScreen}
        options={getModernHeaderOptions(() => t('myBusiness'), t)}
      />
      <Stack.Screen 
        name="Favorites" 
        component={FavoritesScreen}
        options={getModernHeaderOptions(() => t('favorites'), t)}
      />
      <Stack.Screen 
        name="ReviewScreen" 
        component={ReviewScreen}
        options={getModernHeaderOptions(() => t('reviews'), t)}
      />
      <Stack.Screen 
        name="LanguageSettings" 
        component={LanguageSettingsScreen}
        options={getModernHeaderOptions(() => t('languageSettings'), t)}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={getModernHeaderOptions(() => t('settings'), t)}
      />
      {/* Store Management Screens */}
      <Stack.Screen 
        name="CreateStore" 
        component={CreateStoreScreen}
        options={getModernHeaderOptions(() => t('createStore'), t)}
      />
      <Stack.Screen 
        name="EditStore" 
        component={EditStoreScreen}
        options={getModernHeaderOptions(() => t('editStore'), t)}
      />
      <Stack.Screen 
        name="AddProduct" 
        component={AddProductScreen}
        options={getModernHeaderOptions(() => t('addProduct'), t)}
      />
      <Stack.Screen 
        name="EditProduct" 
        component={EditProductScreen}
        options={getModernHeaderOptions(() => t('editProduct'), t)}
      />
      <Stack.Screen 
        name="StoreSettings" 
        component={StoreSettingsScreen}
        options={getModernHeaderOptions(() => t('storeSettings'), t)}
      />
      <Stack.Screen 
        name="AddService" 
        component={AddServiceScreen}
        options={getModernHeaderOptions(() => t('addService'), t)}
      />
      <Stack.Screen 
        name="EditService" 
        component={EditServiceScreen}
        options={getModernHeaderOptions(() => t('editService'), t)}
      />
      <Stack.Screen 
        name="AddPortfolioImage" 
        component={AddPortfolioImageScreen}
        options={getModernHeaderOptions(() => t('addPortfolioImage'), t)}
      />
      <Stack.Screen 
        name="EditPortfolioImage" 
        component={EditPortfolioImageScreen}
        options={getModernHeaderOptions(() => t('editPortfolioImage'), t)}
      />
      {/* Favorites-related screens */}
      <Stack.Screen 
        name="StoreDetails" 
        component={StoreDetailsScreen}
        options={getModernHeaderOptions(() => t('storeDetails'), t)}
      />
      <Stack.Screen 
        name="StoreMap" 
        component={StoreMapScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ProductDetails" 
        component={ProductDetailsScreen}
        options={getModernHeaderOptions(() => t('productDetails'), t)}
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
          } else if (route.name === 'Chats') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Notifications') {
            iconName = focused ? 'notifications' : 'notifications-outline';
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
        name="Chats" 
        component={ChatStack}
        options={{ title: t('chats'), headerShown: false }}
      />
      <Tab.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{ 
          title: t('notifications'),
          ...getModernHeaderOptions(t('notifications'), t)
        }}
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
            <NotificationProvider>
              <AppNavigator />
              <StatusBar style="light" backgroundColor={Colors.primary} />
            </NotificationProvider>
          </LocationProvider>
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
