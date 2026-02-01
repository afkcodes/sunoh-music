/**
 * Central type exports
 */

// Audio types
export type {
    Album,
    AlbumType, Artist, AudioEffects, AudioQuality, EQBand,
    EQPreset, MediaItem,
    MediaType, PlaybackState, Playlist,
    PlaylistOwner, Podcast, PodcastChapter, PodcastEpisode, QueueState, RadioNowPlaying, RadioStation, RepeatMode, ReverbPreset, Track
} from './audio.types';

export { isPodcastEpisode, isRadioStation, isTrack } from './audio.types';

// Navigation types
export type {
    HomeStackParamList, LibraryStackParamList, MainTabParamList, ProfileStackParamList, RootStackParamList, SearchStackParamList
} from './navigation.types';

// Common utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncFunction<T = void> = () => Promise<T>;
export type VoidFunction = () => void;

// API response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Search types
export interface SearchResults {
  tracks: Track[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
  podcasts: Podcast[];
  radioStations: RadioStation[];
}

export type SearchFilter = 
  | 'all'
  | 'tracks'
  | 'albums'
  | 'artists'
  | 'playlists'
  | 'podcasts'
  | 'radio';

// Import audio types for SearchResults
import type { Album, Artist, Playlist, Podcast, RadioStation, Track } from './audio.types';

