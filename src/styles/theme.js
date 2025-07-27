// Modern Filipino-inspired design system for LocalFind
export const Colors = {
  // Primary Colors - Inspired by Philippine sunset and sea
  primary: '#FF6B35', // Vibrant orange-red (like sunset over Manila Bay)
  primaryDark: '#E55100', // Darker orange
  primaryLight: '#FFB74D', // Light orange
  
  // Secondary Colors - Philippine blue and gold
  secondary: '#1976D2', // Deep blue (like Philippine waters)
  secondaryDark: '#0D47A1',
  secondaryLight: '#42A5F5',
  
  // Accent Colors
  accent: '#FFC107', // Golden yellow (sun in Philippine flag)
  accentDark: '#FF8F00',
  accentLight: '#FFECB3',
  
  // Success & Status
  success: '#4CAF50', // Green (nature, growth)
  warning: '#FF9800', // Orange warning
  error: '#F44336', // Red error
  info: '#2196F3', // Blue info
  
  // Neutrals - Modern and clean
  text: {
    primary: '#1A1A1A', // Almost black
    secondary: '#666666', // Medium gray
    light: '#999999', // Light gray
    white: '#FFFFFF',
  },
  
  background: {
    primary: '#FFFFFF', // Clean white
    secondary: '#F8F9FA', // Very light gray
    card: '#FFFFFF', // Card background
    overlay: 'rgba(0, 0, 0, 0.5)', // Modal overlay
  },
  
  border: {
    light: '#E0E0E0', // Light border
    medium: '#BDBDBD', // Medium border
    dark: '#757575', // Dark border
  },
  
  // Filipino cultural colors
  cultural: {
    bayong: '#8D6E63', // Brown like traditional bayong bags
    jeepney: '#FFD54F', // Yellow like jeepneys
    bahayKubo: '#795548', // Brown like bahay kubo
    sampaguita: '#F5F5F5', // White like sampaguita flowers
  }
};

export const Typography = {
  // Font sizes following modern scale
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
  },
  
  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  }
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
};

export const BorderRadius = {
  sm: 6,
  base: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  }
};

// Common component styles
export const CommonStyles = {
  // Modern button styles
  button: {
    primary: {
      backgroundColor: Colors.primary,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.xl,
      borderRadius: BorderRadius.lg,
      ...Shadows.base,
    },
    secondary: {
      backgroundColor: Colors.secondary,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.xl,
      borderRadius: BorderRadius.lg,
      ...Shadows.base,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: Colors.primary,
      paddingVertical: Spacing.md - 2, // Account for border
      paddingHorizontal: Spacing.xl,
      borderRadius: BorderRadius.lg,
    }
  },
  
  // Modern card styles
  card: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.base,
    ...Shadows.base,
  },
  
  // Modern input styles
  input: {
    borderWidth: 1,
    borderColor: Colors.border.light,
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.lg,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
  }
};
