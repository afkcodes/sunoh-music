import { useQuery } from '@tanstack/react-query';
import { MusicProvider, saavnApi } from '../services/api/saavnApi';

import { useUserSettings } from '../store/useUserSettings';

export const useSearch = (query: string, provider: MusicProvider = 'saavn', languages?: string) => {
  const { languages: storedLangs } = useUserSettings();
  const activeLangs = languages || storedLangs.join(',');
  
  return useQuery({
    queryKey: ['search', query, provider, activeLangs],
    queryFn: () => saavnApi.search(query, activeLangs, provider),
    enabled: !!query && query.length > 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
