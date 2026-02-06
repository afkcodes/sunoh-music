import { useQuery } from '@tanstack/react-query';
import { MusicProvider, saavnApi } from '../services/api/saavnApi';

export const useOccasionDetails = (slug: string, provider: MusicProvider = 'gaana', enabled: boolean = true) => {
  return useQuery({
    queryKey: ['occasionDetails', slug, provider],
    queryFn: () => saavnApi.fetchOccasionDetails(slug, provider),
    enabled: enabled && !!slug,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};
