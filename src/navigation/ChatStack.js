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
