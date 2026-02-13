import { useQuery } from '@tanstack/react-query';
import { MUSIC_SONG } from '../services/api/endpoints';

export const useSongData = (songId: string, provider: 'saavn' | 'gaana' = 'saavn') => {
  return useQuery({
    queryKey: ['song', songId, provider],
    queryFn: async () => {
      const url = `${MUSIC_SONG(songId)}?provider=${provider}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch song');
      return response.json();
    },
    enabled: !!songId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};
