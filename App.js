import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { useThemeColors } from './src/hooks/useTheme';

function ThemedStatusBar() {
  const colors = useThemeColors();
  return <StatusBar style={colors.statusBar} />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemedStatusBar />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
