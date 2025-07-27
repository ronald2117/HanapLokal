import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../styles/theme';

const Toast = ({ 
  message, 
  type = 'success', 
  visible = false, 
  onHide,
  duration = 3000 
}) => {
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    if (visible) {
      // Slide in
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (onHide) onHide();
    });
  };

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: Colors.success,
          icon: 'checkmark-circle',
          emoji: '✅'
        };
      case 'error':
        return {
          backgroundColor: Colors.error,
          icon: 'close-circle',
          emoji: '❌'
        };
      case 'warning':
        return {
          backgroundColor: Colors.warning,
          icon: 'warning',
          emoji: '⚠️'
        };
      case 'info':
        return {
          backgroundColor: Colors.info,
          icon: 'information-circle',
          emoji: 'ℹ️'
        };
      default:
        return {
          backgroundColor: Colors.primary,
          icon: 'information-circle',
          emoji: 'ℹ️'
        };
    }
  };

  if (!visible) return null;

  const config = getToastConfig();

  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          backgroundColor: config.backgroundColor,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.emoji}>{config.emoji}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
};

// Toast messages in Filipino
export const filipinoToasts = {
  success: {
    login: 'Matagumpay na nakapasok! 🎉',
    signup: 'Welcome sa LocalFind! 👋',
    storeCreated: 'Nagawa na ang tindahan! 🏪',
    productAdded: 'Naidagdag na ang produkto! 📦',
    favoriteAdded: 'Naidagdag sa paborito! ❤️',
    favoriteRemoved: 'Natanggal sa paborito',
  },
  error: {
    networkError: 'Walang internet connection 📶',
    loginFailed: 'Hindi makapasok. Subukan ulit.',
    signupFailed: 'Hindi makagawa ng account.',
    storeFailed: 'Hindi nagawa ang tindahan.',
    productFailed: 'Hindi naidagdag ang produkto.',
  },
  info: {
    loading: 'Sandali lang... ⏳',
    saving: 'Sine-save... 💾',
    uploading: 'Ina-upload... 📤',
  }
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: Spacing.base,
    right: Spacing.base,
    zIndex: 9999,
    borderRadius: BorderRadius.lg,
    shadowColor: Colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  
  emoji: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  
  message: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.white,
  },
});

export default Toast;
