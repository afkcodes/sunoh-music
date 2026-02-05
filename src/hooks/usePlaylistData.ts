import { useQuery } from '@tanstack/react-query';
import { MusicProvider, saavnApi } from '../services/api/saavnApi';
import { AlbumResponse } from '../types/album';

export const usePlaylistData = (playlistId: string, provider: MusicProvider = 'saavn') => {
  console.log(provider)
  return useQuery<AlbumResponse, Error>({
    queryKey: ['playlist', playlistId, provider],
    queryFn: () => saavnApi.fetchPlaylistDetails(playlistId, provider),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};
