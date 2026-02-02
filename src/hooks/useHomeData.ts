import { useQuery } from '@tanstack/react-query';
import { saavnApi } from '../services/api/saavnApi';
import { SaavnResponse } from '../types/saavn';

export const useHomeData = () => {
  return useQuery<SaavnResponse, Error>({
    queryKey: ['homeData'],
    queryFn: saavnApi.fetchHomeData,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};
