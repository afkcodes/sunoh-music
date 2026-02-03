import { AlbumResponse } from '../../types/album';
import { SaavnResponse } from '../../types/saavn';

const API_BASE_URL = 'https://api.sunoh.online/saavn';

export const saavnApi = {
  fetchHomeData: async (): Promise<SaavnResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/`);
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

  fetchAlbumDetails: async (albumId: string): Promise<AlbumResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/album/${albumId}`);
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
};
