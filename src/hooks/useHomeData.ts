import { useQuery } from '@tanstack/react-query';
import { MusicProvider, saavnApi } from '../services/api/saavnApi';
import { SaavnResponse } from '../types/saavn';

interface UseHomeDataProps {
  languages?: string;
  provider?: MusicProvider;
}

import { useUserSettings } from '../store/useUserSettings';

export const useHomeData = (props?: UseHomeDataProps) => {
  const { languages: storedLangs } = useUserSettings();
  const languages = props?.languages || storedLangs.join(',');
  const provider = props?.provider;

  return useQuery<SaavnResponse, Error>({
    queryKey: ['homeData', languages, provider],
    queryFn: () => saavnApi.fetchHomeData(languages, provider),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};
