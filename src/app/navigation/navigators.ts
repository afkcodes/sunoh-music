import { StateNavigator } from 'navigation';
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
  { key: Routes.SectionDetail, trackCrumbTrail: true },
  { key: Routes.Details, trackCrumbTrail: true },
  { key: Routes.Playlist, trackCrumbTrail: true },
]);

/**
 * Library Tab Navigator
 */
export const libraryNavigator = new StateNavigator([
  { key: Routes.Library },
  { key: Routes.Playlist, trackCrumbTrail: true },
]);

/**
 * Search Tab Navigator
 */
export const searchNavigator = new StateNavigator([
  { key: Routes.Search },
  { key: Routes.Playlist, trackCrumbTrail: true },
  { key: Routes.Album, trackCrumbTrail: true },
  { key: Routes.SectionDetail, trackCrumbTrail: true },
  { key: Routes.Details, trackCrumbTrail: true },
]);
