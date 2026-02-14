import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationHandler } from 'navigation-react';
import { NavigationStack, Scene } from 'navigation-react-native';
import React, { useRef } from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SheetRef } from '../components/common/Sheet';
import { SongMenuSheet } from '../components/common/SongMenuSheet';
import { MiniPlayer } from '../components/player/MiniPlayer';
import { EqualizerSheet, PlayerSheet, QueueSheet } from '../components/player/PlayerSheet';
import { useAutoQueue } from '../hooks/useAutoQueue';
import { ThemeProvider, useTheme } from '../theme/ThemeContext';
import { rootNavigator } from './navigation/navigators';
import { Routes } from './navigation/routes';
import { Tabs } from './navigation/Tabs';

const queryClient = new QueryClient();

function AppContent() {
  const { isDark } = useTheme();

  // Enable auto-queue globally - fetches recommendations when queue is running low
  useAutoQueue();

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


      </NavigationHandler>
    </>
  );
}

export function App() {
  const playerSheetRef = useRef<SheetRef>(null);
  const queueSheetRef = useRef<SheetRef>(null);
  const equalizerSheetRef = useRef<SheetRef>(null);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AppContent />
            <MiniPlayer onPress={() => playerSheetRef.current?.present()} />
            <PlayerSheet
              ref={playerSheetRef}
              onOpenQueue={() => queueSheetRef.current?.present()}
              onOpenEqualizer={() => equalizerSheetRef.current?.present()}
            />
            <QueueSheet ref={queueSheetRef} />
            <EqualizerSheet ref={equalizerSheetRef} />
            <SongMenuSheet />
            {/* <ScalingDebugPanel /> */}
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
