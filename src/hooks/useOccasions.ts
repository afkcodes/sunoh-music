import { useQuery } from '@tanstack/react-query';
import { MusicProvider, saavnApi } from '../services/api/saavnApi';

export const useOccasions = (provider: MusicProvider = 'gaana') => {
  return useQuery({
    queryKey: ['occasions', provider],
    queryFn: () => saavnApi.fetchOccasions(provider),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
