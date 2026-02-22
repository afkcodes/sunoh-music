import { AlbumResponse } from '../../types/album';
import { SaavnResponse } from '../../types/saavn';
import {
  MUSIC_ALBUM,
  MUSIC_ARTIST,
  MUSIC_HOME,
  MUSIC_LANGUAGES,
  MUSIC_OCCASIONS,
  MUSIC_OCCASIONS_DETAIL,
  MUSIC_PLAYLIST,
  MUSIC_RADIO_PLAY,
  MUSIC_RADIO_SESSION,
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

  fetchArtistDetails: async (artistId: string): Promise<any> => {
    try {
      const url = MUSIC_ARTIST(artistId);

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
    provider: MusicProvider = 'saavn',
    type: 'songs' | 'albums' | 'artists' | 'playlists' | 'all' = 'songs'
  ): Promise<any> => {
    try {
      // Backend expects 'q' not 'query' for the search parameter
      // type=songs returns full song data including artists; unified search truncates it
      const url = `${MUSIC_SEARCH}?q=${encodeURIComponent(query)}&lang=${encodeURIComponent(
        languages
      )}&provider=${encodeURIComponent(provider)}&type=${type}`;

      console.log(`🔍 saavnApi.search: URL = ${url}`);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      const data = await response.json();
      
      // For 'all' type (unified search), return original structure
      // SearchScreen expects data to be an array of sections
      if (type === 'all') {
        console.log(`📦 saavnApi.search: Unified search, returning ${Array.isArray(data.data) ? data.data.length : 0} sections`);
        return data;
      }
      
      // For songs type, normalize to {data: {list: songs[]}} format
      // This is used by auto-queue for Gaana→Saavn pivot
      let songsList: any[] = [];
      if (data.data?.list) {
        // Already in expected format (from type=songs endpoint)
        songsList = data.data.list;
      } else if (Array.isArray(data.data)) {
        // Fallback: extract from sections
        const songsSection = data.data.find((section: any) => 
          section.heading?.toLowerCase() === 'songs' || section.heading?.toLowerCase() === 'topquery'
        );
        if (songsSection?.data) {
          songsList = songsSection.data;
        }
      }
      
      console.log(`📦 saavnApi.search: Response status=${data.status}, songs found=${songsList.length}`);
      
      // Return normalized format for consumers
      return {
        ...data,
        data: {
          ...data.data,
          list: songsList
        }
      };
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

  fetchLanguages: async (): Promise<any> => {
    try {
      const response = await fetch(MUSIC_LANGUAGES);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch languages:', error);
      throw error;
    }
  },

  initRadioSession: async (
    id: string,
    type: string = 'song',
    provider: MusicProvider = 'saavn',
    name?: string,
    lang?: string
  ): Promise<any> => {
    try {
      let url = `${MUSIC_RADIO_SESSION}?id=${encodeURIComponent(id)}&type=${encodeURIComponent(
        type
      )}&provider=${encodeURIComponent(provider)}`;

      if (name) {
        url += `&name=${encodeURIComponent(name)}`;
      }

      if (lang) {
        url += `&lang=${encodeURIComponent(lang)}`;
      }

      console.log('📡 initRadioSession:', url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to init radio session:', error);
      throw error;
    }
  },

  fetchRadioSongs: async (
    sessionId: string,
    count: number = 20,
    next: number = 1,
    lang?: string
  ): Promise<any> => {
    try {
      let url = `${MUSIC_RADIO_PLAY(sessionId)}?count=${count}&next=${next}`;
      if (lang) {
        url += `&lang=${encodeURIComponent(lang)}`;
      }
      console.log('📡 fetchRadioSongs:', url);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch radio songs:', error);
      throw error;
    }
  },
};
