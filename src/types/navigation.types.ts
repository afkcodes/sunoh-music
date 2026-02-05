/**
 * Navigation type definitions
 *
 * Provides type safety for navigation throughout the app.
 */

// import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
// import type { NavigatorScreenParams } from '@react-navigation/native';
// import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type {
  Album,
  Artist,
  Playlist,
  Podcast,
  PodcastEpisode,
  RadioStation,
  Track,
} from './audio.types';

// Root Stack
export type RootStackParamList = {
  MainTabs: undefined; // NavigatorScreenParams<MainTabParamList>;
  NowPlaying: undefined;
  Queue: undefined;
  Lyrics: { trackId: string };
  SleepTimer: undefined;

  // Detail screens
  AlbumDetail: { album: Album; provider?: string } | { albumId: string; provider?: string };
  ArtistDetail: { artist: Artist; provider?: string } | { artistId: string; provider?: string };
  PlaylistDetail:
    | { playlist: Playlist; provider?: string }
    | { playlistId: string; provider?: string };
  TrackDetail: { track: Track } | { trackId: string };

  // Radio
  RadioPlayer: { station: RadioStation };
  RadioBrowser: { genre?: string; country?: string };

  // Podcast
  PodcastDetail: { podcast: Podcast } | { podcastId: string };
  EpisodeDetail: { episode: PodcastEpisode };

  // Features
  Equalizer: undefined;
  AIPlaylistGenerator: { seedTrack?: Track; seedArtist?: Artist; mood?: string };

  // Settings
  Settings: undefined;
  AudioSettings: undefined;
  DownloadSettings: undefined;
  AppearanceSettings: undefined;

  // Auth (if needed)
  Login: undefined;
  Register: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Library: undefined;
  Profile: undefined;
};

// Home Stack (nested in Home tab)
export type HomeStackParamList = {
  HomeMain: undefined;
  RecentlyPlayed: undefined;
  NewReleases: undefined;
  ForYou: undefined;
  MoodPlaylists: { mood: string };
};

// Search Stack (nested in Search tab)
export type SearchStackParamList = {
  SearchMain: undefined;
  SearchResults: { query: string };
  BrowseCategories: undefined;
  CategoryDetail: { categoryId: string; categoryName: string };
};

// Library Stack (nested in Library tab)
export type LibraryStackParamList = {
  LibraryMain: undefined;
  LikedSongs: undefined;
  Downloads: undefined;
  History: undefined;
  LocalFiles: undefined;
};

// Profile Stack (nested in Profile tab)
export type ProfileStackParamList = {
  ProfileMain: undefined;
  ListeningStats: undefined;
  EditProfile: undefined;
};

// Screen props types
// export type RootStackScreenProps<T extends keyof RootStackParamList> =
//   NativeStackScreenProps<RootStackParamList, T>;

// export type MainTabScreenProps<T extends keyof MainTabParamList> =
//   BottomTabScreenProps<MainTabParamList, T>;

// Utility type for useNavigation hook
// declare global {
//   namespace ReactNavigation {
//     interface RootParamList extends RootStackParamList {}
//   }
// }
