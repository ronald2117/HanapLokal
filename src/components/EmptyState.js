import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../styles/theme';
import ModernButton from './ModernButton';

const EmptyState = ({ 
  icon, 
  emoji,
  title, 
  message, 
  actionTitle, 
  onAction,
  style 
}) => {
  return (
    <View style={[styles.container, style]}>
      {emoji ? (
        <Text style={styles.emoji}>{emoji}</Text>
      ) : (
        <Ionicons 
          name={icon || 'information-circle-outline'} 
          size={64} 
          color={Colors.text.light} 
        />
      )}
      
      <Text style={styles.title}>{title}</Text>
      
      {message && (
        <Text style={styles.message}>{message}</Text>
      )}
      
      {actionTitle && onAction && (
        <ModernButton
          title={actionTitle}
          onPress={onAction}
          variant="primary"
          size="medium"
          style={styles.actionButton}
        />
      )}
    </View>
  );
};

// Props validation
EmptyState.propTypes = {
  icon: PropTypes.string,
  emoji: PropTypes.string,
  title: PropTypes.string.isRequired,
  message: PropTypes.string,
  actionTitle: PropTypes.string,
  onAction: PropTypes.func,
  style: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array
  ])
};

// Default props
EmptyState.defaultProps = {
  icon: 'information-circle-outline',
  emoji: null,
  message: null,
  actionTitle: null,
  onAction: null,
  style: null
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['4xl'],
    paddingHorizontal: Spacing.xl,
  },
  
  emoji: {
    fontSize: 64,
    marginBottom: Spacing.xl,
  },
  
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  
  message: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.light,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
    marginBottom: Spacing.xl,
  },
  
  actionButton: {
    marginTop: Spacing.lg,
  },
});

export default EmptyState;
