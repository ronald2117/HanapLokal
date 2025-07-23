import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useLanguage } from '../contexts/LanguageContext';
import { Colors, Typography, Spacing, BorderRadius } from '../styles/theme';
import { LinearGradient } from 'expo-linear-gradient';

// Chat Screens
import ChatsScreen from '../screens/ChatsScreen';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import StartNewChatScreen from '../screens/StartNewChatScreen';

const Stack = createNativeStackNavigator();

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

export default function ChatStack() {
  const { t } = useLanguage();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="ChatsMain" 
        component={ChatsScreen}
        options={{ headerShown: false }} // ChatsScreen handles its own header
      />
      <Stack.Screen 
        name="ChatDetail" 
        component={ChatDetailScreen}
        options={{ headerShown: false }} // ChatDetailScreen handles its own header
      />
      <Stack.Screen 
        name="StartNewChat" 
        component={StartNewChatScreen}
        options={{ headerShown: false }} // StartNewChatScreen handles its own header
      />
    </Stack.Navigator>
  );
}
