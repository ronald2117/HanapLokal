import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Custom hook to get safe area insets with tab bar consideration
export const useTabBarSafeArea = () => {
  const insets = useSafeAreaInsets();
  
  // Typical tab bar height is around 80-90px including safe area
  const TAB_BAR_HEIGHT = 80;
  
  return {
    ...insets,
    bottom: Math.max(insets.bottom, TAB_BAR_HEIGHT),
  };
};

export default useSafeAreaInsets;
