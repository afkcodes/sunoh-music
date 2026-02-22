import { useQuery } from '@tanstack/react-query';
import { MusicProvider, saavnApi } from '../services/api/saavnApi';
import { AlbumResponse } from '../types/album';

export const useAlbumData = (albumId: string, provider: MusicProvider = 'saavn') => {
  return useQuery<AlbumResponse, Error>({
    queryKey: ['album', albumId, provider],
    queryFn: () => saavnApi.fetchAlbumDetails(albumId, provider),
    enabled: !!albumId, // Don't fetch if albumId is missing
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};
