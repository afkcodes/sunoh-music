import { NavigationHandler } from 'navigation-react';
import { NavigationStack, Scene, TabBar, TabBarItem } from 'navigation-react-native';
import React from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { homeNavigator, libraryNavigator, searchNavigator } from './navigators';
import { Routes } from './routes';

// Screens
import { AlbumScreen } from '../../screens/AlbumScreen';
import HomeScreen from '../../screens/HomeScreen';
import LibraryScreen from '../../screens/LibraryScreen';
import { PlaylistScreen } from '../../screens/PlaylistScreen';
import SearchScreen from '../../screens/SearchScreen';
import { SectionDetailScreen } from '../../screens/SectionDetailScreen';

// Assets
const HomeIcon = require('../../assets/images/home.png');
const SearchIcon = require('../../assets/images/search.png');
const LibraryIcon = require('../../assets/images/library.png');

export const Tabs = () => {
  const { colors } = useTheme();
  // We can use the theme to style the TabBar, though native limitations apply.
  // navigation-react-native picks up system colors usually, or props can be added.

  return (
    <TabBar
      primary={true}
      bottomTabs={true}
      barTintColor={colors.bgSurface as string}
      selectedTintColor={colors.primaryBase as string}
      activeIndicatorColor={`${colors.primaryBase}20`}
      unselectedTintColor={colors.textSecondary as string}
      labelVisibilityMode='labeled'
    >
      <TabBarItem
        title="Home"
        image={HomeIcon}
        fontFamily='Gilroy-Bold'
        fontSize={16}

      >
        <NavigationHandler stateNavigator={homeNavigator} >
          <NavigationStack
            crumbStyle={[
              { type: 'alpha', start: 0.7, duration: 300 },
              { type: 'scale', startX: 1.05, startY: 1.05, duration: 300 },
            ]}
            unmountStyle={[
              { type: 'alpha', start: 0, duration: 300 },
              { type: 'scale', startX: 0.95, startY: 0.95, duration: 300 },
            ]}>
            <Scene stateKey={Routes.Home}>
              <HomeScreen />
            </Scene>
            <Scene stateKey={Routes.Album}>
              <AlbumScreen />
            </Scene>
            <Scene stateKey={Routes.SectionDetail}>
              <SectionDetailScreen />
            </Scene>
            <Scene stateKey={Routes.Playlist}>
              <PlaylistScreen />
            </Scene>
            <Scene stateKey={Routes.Details}>
              {/* Placeholder for Details if needed later */}
              <LibraryScreen />
            </Scene>
          </NavigationStack>
        </NavigationHandler>
      </TabBarItem>

      <TabBarItem
        title="Search"
        image={SearchIcon}
        fontFamily='Gilroy-Bold'
        fontSize={16}
      >
        <NavigationHandler stateNavigator={searchNavigator}>
          <NavigationStack
            crumbStyle={[
              { type: 'alpha', start: 0.7, duration: 300 },
              { type: 'scale', startX: 1.05, startY: 1.05, duration: 300 },
            ]}
            unmountStyle={[
              { type: 'alpha', start: 0, duration: 300 },
              { type: 'scale', startX: 0.95, startY: 0.95, duration: 300 },
            ]}>
            <Scene stateKey={Routes.Search}>
              <SearchScreen />
            </Scene>
            <Scene stateKey={Routes.Playlist}>
              <PlaylistScreen />
            </Scene>
          </NavigationStack>
        </NavigationHandler>
      </TabBarItem>

      <TabBarItem
        title="Library"
        image={LibraryIcon}
        fontFamily='Gilroy-Bold'
        fontSize={16}
      >
        <NavigationHandler stateNavigator={libraryNavigator}>
          <NavigationStack
            crumbStyle={[
              { type: 'alpha', start: 0.7, duration: 300 },
              { type: 'scale', startX: 1.05, startY: 1.05, duration: 300 },
            ]}
            unmountStyle={[
              { type: 'alpha', start: 0, duration: 300 },
              { type: 'scale', startX: 0.95, startY: 0.95, duration: 300 },
            ]}
          >
            <Scene stateKey={Routes.Library}>
              <LibraryScreen />
            </Scene>
            <Scene stateKey={Routes.Playlist}>
              <PlaylistScreen />
            </Scene>
          </NavigationStack>
        </NavigationHandler>
      </TabBarItem>

    </TabBar>
  );
};
