import { NavigationHandler } from 'navigation-react';
import { NavigationStack, Scene } from 'navigation-react-native';
import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, useTheme } from '../theme/ThemeContext';
import { rootNavigator } from './navigation/navigators';
import { Routes } from './navigation/routes';
import { Tabs } from './navigation/Tabs';

function AppContent() {
  const { isDark, colors } = useTheme();

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bgPage}
      />
      <NavigationHandler stateNavigator={rootNavigator}>
        <NavigationStack>
          <Scene stateKey={Routes.Tabs}>
            <Tabs />
          </Scene>
          {/* Global Modal / Player Scenes can go here to cover Tabs */}
        </NavigationStack>
      </NavigationHandler>
    </>
  );
}

export function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
