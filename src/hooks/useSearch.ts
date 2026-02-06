import { useQuery } from '@tanstack/react-query';
import { MusicProvider, saavnApi } from '../services/api/saavnApi';

export const useSearch = (query: string, provider: MusicProvider = 'saavn', languages: string = 'hindi,english') => {
  return useQuery({
    queryKey: ['search', query, provider, languages],
    queryFn: () => saavnApi.search(query, languages, provider),
    enabled: !!query && query.length > 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
