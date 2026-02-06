import { AlbumResponse } from '../../types/album';
import { SaavnResponse } from '../../types/saavn';
import {
  MUSIC_ALBUM,
  MUSIC_ARTIST,
  MUSIC_HOME,
  MUSIC_OCCASIONS,
  MUSIC_OCCASIONS_DETAIL,
  MUSIC_PLAYLIST,
  MUSIC_SEARCH,
  MUSIC_SONG,
  MUSIC_SONG_STREAM
} from './endpoints';

export type MusicProvider = 'gaana' | 'saavn' | 'spotify' | 'unified';

export const saavnApi = {
  fetchHomeData: async (
    languages: string = 'hindi,english',
    provider?: MusicProvider
  ): Promise<SaavnResponse> => {
    try {
      const params = new URLSearchParams();
      params.append('lang', languages);
      if (provider) {
        params.append('provider', provider);
      }

      const url = `${MUSIC_HOME}?${params.toString()}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch home data:', error);
      throw error;
    }
  },

  fetchAlbumDetails: async (
    albumId: string,
    provider: MusicProvider = 'saavn'
  ): Promise<AlbumResponse> => {
    try {
      const url = `${MUSIC_ALBUM(albumId)}?provider=${encodeURIComponent(provider)}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch album details:', error);
      throw error;
    }
  },

  fetchPlaylistDetails: async (
    playlistId: string,
    provider: MusicProvider = 'saavn'
  ): Promise<AlbumResponse> => {
    try {
      const url = `${MUSIC_PLAYLIST(playlistId)}?provider=${encodeURIComponent(provider)}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch playlist details:', error);
      throw error;
    }
  },

  fetchSongDetails: async (songId: string, provider: MusicProvider = 'saavn'): Promise<any> => {
    try {
      const url = `${MUSIC_SONG(songId)}?provider=${encodeURIComponent(provider)}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch song details:', error);
      throw error;
    }
  },

  fetchArtistDetails: async (artistId: string, provider: MusicProvider = 'saavn'): Promise<any> => {
    try {
      const url = `${MUSIC_ARTIST(artistId)}?provider=${encodeURIComponent(provider)}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch artist details:', error);
      throw error;
    }
  },

  fetchSongStream: async (songId: string): Promise<any> => {
    try {
      const url = `${MUSIC_SONG_STREAM(songId)}?provider=gaana`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch song stream:', error);
      throw error;
    }
  },

  search: async (
    query: string,
    languages: string = 'hindi,english',
    provider: MusicProvider = 'saavn'
  ): Promise<any> => {
    try {
      const url = `${MUSIC_SEARCH}?query=${encodeURIComponent(query)}&lang=${encodeURIComponent(
        languages
      )}&provider=${encodeURIComponent(provider)}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to search:', error);
      throw error;
    }
  },

  fetchOccasions: async (provider: MusicProvider = 'gaana'): Promise<any> => {
    try {
      const url = `${MUSIC_OCCASIONS}?provider=${encodeURIComponent(provider)}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch occasions:', error);
      throw error;
    }
  },

  fetchOccasionDetails: async (
    slug: string,
    provider: MusicProvider = 'gaana'
  ): Promise<any> => {
    try {
      const url = `${MUSIC_OCCASIONS_DETAIL(slug)}?provider=${encodeURIComponent(provider)}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch occasion details:', error);
      throw error;
    }
  },

  fetchTrendingSearch: async (): Promise<any> => {
    try {
      const url = `${MUSIC_SEARCH}?query=`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch trending search:', error);
      throw error;
    }
  },
};
