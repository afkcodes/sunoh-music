import { StateNavigator } from 'navigation';
import { appAnalytics } from '../../services/analytics/AnalyticsService';
import { Routes } from './routes';

/**
 * Root Navigator
 * Handles top-level navigation (e.g., helper modals, auth flow if separate) 
 * or just holds the main Tabs scene.
 */
export const rootNavigator = new StateNavigator([
  { key: Routes.Tabs },
  { key: Routes.Player }, // Fullscreen player can be global
]);

/**
 * Home Tab Navigator
 */
export const homeNavigator = new StateNavigator([
  { key: Routes.Home },
  { key: Routes.Album, trackCrumbTrail: true },
  { key: Routes.Artist, trackCrumbTrail: true },
  { key: Routes.Song, trackCrumbTrail: true },
  { key: Routes.SectionDetail, trackCrumbTrail: true },
  { key: Routes.Details, trackCrumbTrail: true },
  { key: Routes.Playlist, trackCrumbTrail: true },
  { key: Routes.Settings, trackCrumbTrail: true },
  { key: Routes.DebugLogs, trackCrumbTrail: true },
]);

/**
 * Library Tab Navigator
 */
export const libraryNavigator = new StateNavigator([
  { key: Routes.Library },
  { key: Routes.Playlist, trackCrumbTrail: true },
  { key: Routes.Album, trackCrumbTrail: true },
  { key: Routes.Artist, trackCrumbTrail: true },
  { key: Routes.Song, trackCrumbTrail: true },
  { key: Routes.LikedSongs, trackCrumbTrail: true },
]);

/**
 * Search Tab Navigator
 */
export const searchNavigator = new StateNavigator([
  { key: Routes.Search },
  { key: Routes.Playlist, trackCrumbTrail: true },
  { key: Routes.Album, trackCrumbTrail: true },
  { key: Routes.Artist, trackCrumbTrail: true },
  { key: Routes.Song, trackCrumbTrail: true },
  { key: Routes.SectionDetail, trackCrumbTrail: true },
  { key: Routes.Details, trackCrumbTrail: true },
]);

const trackScreen = (_oldState: any, state: any) => {
  if (state && state.key) {
    appAnalytics.logScreenView(state.key);
  }
};

// Remove listeners to prevent "Cannot add the same handler more than once" during Fast Refresh
rootNavigator.offNavigate(trackScreen);
homeNavigator.offNavigate(trackScreen);
libraryNavigator.offNavigate(trackScreen);
searchNavigator.offNavigate(trackScreen);

// Add listeners
rootNavigator.onNavigate(trackScreen);
homeNavigator.onNavigate(trackScreen);
libraryNavigator.onNavigate(trackScreen);
searchNavigator.onNavigate(trackScreen);

