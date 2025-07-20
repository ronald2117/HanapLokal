import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SafeAreaWrapper = ({ children, excludeTabBar = false, style }) => {
  const insets = useSafeAreaInsets();
  
  // Tab bar height consideration
  const TAB_BAR_HEIGHT = 80;
  const bottomPadding = excludeTabBar ? insets.bottom : Math.max(insets.bottom, TAB_BAR_HEIGHT);
  
  return (
    <View 
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: bottomPadding,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
        style
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SafeAreaWrapper;
