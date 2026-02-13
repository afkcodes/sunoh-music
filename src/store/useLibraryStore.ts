import { create } from 'zustand';
import { mmkv } from './storage';

export interface LibraryItem {
  id: string;
  type: 'song' | 'album' | 'playlist';
  title: string;
  image?: string;
  subtitle?: string;
  timestamp: number;
  provider?: string;
  duration?: number;
  fullData?: any; // To store the complete object (Song, Album, etc.)
}

interface LibraryState {
  likedSongs: LibraryItem[];
  likedAlbums: LibraryItem[];
  likedPlaylists: LibraryItem[];

  // Actions
  toggleLikeSong: (item: LibraryItem) => void;
  toggleLikeAlbum: (item: LibraryItem) => void;
  toggleLikePlaylist: (item: LibraryItem) => void;
  isLiked: (id: string, type: 'song' | 'album' | 'playlist') => boolean;
}

const STORAGE_KEYS = {
  LIKED_SONGS: 'library_liked_songs',
  LIKED_ALBUMS: 'library_liked_albums',
};

const getPersistedData = (key: string): LibraryItem[] => {
  try {
    const json = mmkv.getString(key);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.warn(`Failed to load library data for ${key}`, e);
    return [];
  }
};

export const useLibraryStore = create<LibraryState>((set, get) => ({
  likedSongs: getPersistedData(STORAGE_KEYS.LIKED_SONGS),
  likedAlbums: getPersistedData(STORAGE_KEYS.LIKED_ALBUMS),
  likedPlaylists: getPersistedData('library_liked_playlists'),

  toggleLikeSong: (item: LibraryItem) => {
    const { likedSongs } = get();
    let newItems;
    if (likedSongs.some(i => i.id === item.id)) {
      newItems = likedSongs.filter(i => i.id !== item.id);
    } else {
      newItems = [{ ...item, timestamp: Date.now() }, ...likedSongs];
    }
    set({ likedSongs: newItems });
    mmkv.set(STORAGE_KEYS.LIKED_SONGS, JSON.stringify(newItems));
  },

  toggleLikeAlbum: (item: LibraryItem) => {
    const { likedAlbums } = get();
    let newItems;
    if (likedAlbums.some(i => i.id === item.id)) {
      newItems = likedAlbums.filter(i => i.id !== item.id);
    } else {
      newItems = [{ ...item, timestamp: Date.now() }, ...likedAlbums];
    }
    set({ likedAlbums: newItems });
    mmkv.set(STORAGE_KEYS.LIKED_ALBUMS, JSON.stringify(newItems));
  },

  toggleLikePlaylist: (item: LibraryItem) => {
    const { likedPlaylists } = get();
    let newItems;
    if (likedPlaylists.some(i => i.id === item.id)) {
      newItems = likedPlaylists.filter(i => i.id !== item.id);
    } else {
      newItems = [{ ...item, timestamp: Date.now() }, ...likedPlaylists];
    }
    set({ likedPlaylists: newItems });
    mmkv.set('library_liked_playlists', JSON.stringify(newItems));
  },

  isLiked: (id: string, type: 'song' | 'album' | 'playlist') => {
    const { likedSongs, likedAlbums, likedPlaylists } = get();
    if (type === 'song') return likedSongs.some(i => i.id === id);
    if (type === 'album') return likedAlbums.some(i => i.id === id);
    if (type === 'playlist') return likedPlaylists?.some(i => i.id === id) ?? false;
    return false;
  },
}));
