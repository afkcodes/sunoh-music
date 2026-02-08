import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationHandler } from 'navigation-react';
import { NavigationStack, Scene } from 'navigation-react-native';
import React, { useRef } from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SheetRef } from '../components/common/Sheet';
import { MiniPlayer } from '../components/player/MiniPlayer';
import { PlayerSheet } from '../components/player/PlayerSheet';
import { ThemeProvider, useTheme } from '../theme/ThemeContext';
import { rootNavigator } from './navigation/navigators';
import { Routes } from './navigation/routes';
import { Tabs } from './navigation/Tabs';

const queryClient = new QueryClient();

function AppContent() {
  const { isDark } = useTheme();
  const playerSheetRef = useRef<SheetRef>(null);

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent={true}
      />
      <NavigationHandler stateNavigator={rootNavigator}>
        <NavigationStack>
          <Scene stateKey={Routes.Tabs}>
            <Tabs />
          </Scene>
          {/* Global Modal / Player Scenes can go here to cover Tabs */}
        </NavigationStack>
        <MiniPlayer onPress={() => playerSheetRef.current?.present()} />
        <PlayerSheet ref={playerSheetRef} />
      </NavigationHandler>
    </>
  );
}

export function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
