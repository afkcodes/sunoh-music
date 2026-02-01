import { NavigationHandler } from 'navigation-react';
import { NavigationStack, Scene, TabBar, TabBarItem } from 'navigation-react-native';
import React from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { homeNavigator, libraryNavigator, searchNavigator } from './navigators';
import { Routes } from './routes';

// Screens
import HomeScreen from '../../screens/HomeScreen';
import LibraryScreen from '../../screens/LibraryScreen';
import SearchScreen from '../../screens/SearchScreen';

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
        <NavigationHandler stateNavigator={homeNavigator}>
          <NavigationStack>
            <Scene stateKey={Routes.Home}>
              <HomeScreen />
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
          <NavigationStack>
            <Scene stateKey={Routes.Search}>
              <SearchScreen />
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
          <NavigationStack>
            <Scene stateKey={Routes.Library}>
              <LibraryScreen />
            </Scene>
             <Scene stateKey={Routes.Playlist}>
              <LibraryScreen />
            </Scene>
          </NavigationStack>
        </NavigationHandler>
      </TabBarItem>
      
    </TabBar>
  );
};
