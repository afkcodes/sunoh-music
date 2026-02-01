/**
 * Audio-related type definitions
 */

// Track/Song types
export interface Track {
  id: string;
  title: string;
  artist: Artist;
  album?: Album;
  duration: number; // in seconds
  artworkUrl: string;
  audioUrl: string;
  isLiked: boolean;
  playCount: number;
  addedAt: string; // ISO date string
  genres: string[];
  year?: number;
  trackNumber?: number;
  discNumber?: number;
  isExplicit: boolean;
  isDownloaded: boolean;
  downloadPath?: string;
  quality: AudioQuality;
}

export interface Artist {
  id: string;
  name: string;
  imageUrl?: string;
  bio?: string;
  genres: string[];
  isFollowed: boolean;
  monthlyListeners?: number;
}

export interface Album {
  id: string;
  title: string;
  artist: Artist;
  artworkUrl: string;
  releaseDate: string;
  trackCount: number;
  duration: number; // total duration in seconds
  genres: string[];
  type: AlbumType;
  isInLibrary: boolean;
}

export type AlbumType = 'album' | 'single' | 'ep' | 'compilation';

// Playlist types
export interface Playlist {
  id: string;
  name: string;
  description?: string;
  artworkUrl?: string;
  owner: PlaylistOwner;
  trackCount: number;
  duration: number;
  isPublic: boolean;
  isCollaborative: boolean;
  isAIGenerated: boolean;
  createdAt: string;
  updatedAt: string;
  tracks?: Track[];
}

export interface PlaylistOwner {
  id: string;
  name: string;
  imageUrl?: string;
}

// Radio types
export interface RadioStation {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  streamUrl: string;
  genre: string;
  country: string;
  language: string;
  bitrate: number;
  isFavorite: boolean;
  currentTrack?: RadioNowPlaying;
}

export interface RadioNowPlaying {
  title: string;
  artist: string;
  startedAt: string;
}

// Podcast types
export interface Podcast {
  id: string;
  title: string;
  author: string;
  description: string;
  artworkUrl: string;
  feedUrl: string;
  isSubscribed: boolean;
  episodeCount: number;
  latestEpisodeDate: string;
  categories: string[];
}

export interface PodcastEpisode {
  id: string;
  podcastId: string;
  title: string;
  description: string;
  audioUrl: string;
  duration: number;
  publishedAt: string;
  artworkUrl?: string;
  isPlayed: boolean;
  playbackPosition: number; // in seconds
  isDownloaded: boolean;
  downloadPath?: string;
  showNotes?: string;
  chapters?: PodcastChapter[];
}

export interface PodcastChapter {
  title: string;
  startTime: number;
  endTime: number;
  imageUrl?: string;
  url?: string;
}

// Playback types
export type RepeatMode = 'off' | 'track' | 'queue';
export type AudioQuality = 'low' | 'normal' | 'high' | 'lossless';

export interface PlaybackState {
  isPlaying: boolean;
  isBuffering: boolean;
  position: number; // in seconds
  duration: number; // in seconds
  bufferedPosition: number;
  playbackRate: number;
  volume: number;
  repeatMode: RepeatMode;
  isShuffled: boolean;
}

export interface QueueState {
  tracks: Track[];
  currentIndex: number;
  originalOrder: Track[]; // for unshuffle
}

// Equalizer types
export interface EQBand {
  frequency: number; // Hz
  gain: number; // dB (-12 to +12)
}

export interface EQPreset {
  id: string;
  name: string;
  bands: EQBand[];
  isCustom: boolean;
}

export interface AudioEffects {
  bassBoost: number; // 0-100
  virtualizer: number; // 0-100
  reverb: ReverbPreset;
  loudnessEnhancement: boolean;
}

export type ReverbPreset = 
  | 'none'
  | 'small_room'
  | 'medium_room'
  | 'large_room'
  | 'hall'
  | 'plate';

// Media item union type
export type MediaItem = Track | RadioStation | PodcastEpisode;
export type MediaType = 'track' | 'radio' | 'podcast';

// Helper type guards
export const isTrack = (item: MediaItem): item is Track => {
  return 'audioUrl' in item && 'artist' in item && !('streamUrl' in item);
};

export const isRadioStation = (item: MediaItem): item is RadioStation => {
  return 'streamUrl' in item;
};

export const isPodcastEpisode = (item: MediaItem): item is PodcastEpisode => {
  return 'podcastId' in item;
};
