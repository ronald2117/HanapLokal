import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/theme';

const ModernButton = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle 
}) => {
  const getButtonStyle = () => {
    const baseStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: BorderRadius.lg,
      ...Shadows.base,
    };

    // Size variants
    const sizeStyles = {
      small: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        minHeight: 36,
      },
      medium: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        minHeight: 48,
      },
      large: {
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing['2xl'],
        minHeight: 56,
      }
    };

    // Color variants
    const colorStyles = {
      primary: {
        backgroundColor: disabled ? Colors.border.medium : Colors.primary,
      },
      secondary: {
        backgroundColor: disabled ? Colors.border.medium : Colors.secondary,
      },
      accent: {
        backgroundColor: disabled ? Colors.border.medium : Colors.accent,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: disabled ? Colors.border.medium : Colors.primary,
        shadowOpacity: 0, // Remove shadow for outline buttons
        elevation: 0,
      },
      ghost: {
        backgroundColor: 'transparent',
        shadowOpacity: 0,
        elevation: 0,
      }
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...colorStyles[variant],
    };
  };

  const getTextStyle = () => {
    const baseTextStyle = {
      fontWeight: Typography.fontWeight.semibold,
      textAlign: 'center',
    };

    const sizeTextStyles = {
      small: { fontSize: Typography.fontSize.sm },
      medium: { fontSize: Typography.fontSize.base },
      large: { fontSize: Typography.fontSize.lg },
    };

    const colorTextStyles = {
      primary: { color: Colors.text.white },
      secondary: { color: Colors.text.white },
      accent: { color: Colors.text.primary },
      outline: { color: disabled ? Colors.border.medium : Colors.primary },
      ghost: { color: disabled ? Colors.border.medium : Colors.primary },
    };

    return {
      ...baseTextStyle,
      ...sizeTextStyles[size],
      ...colorTextStyles[variant],
    };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'ghost' ? Colors.primary : Colors.text.white} 
        />
      ) : (
        <>
          {icon && (
            <View style={styles.iconContainer}>
              {icon}
            </View>
          )}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    marginRight: Spacing.sm,
  },
});

export default ModernButton;
