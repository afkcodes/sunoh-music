import { useQuery } from '@tanstack/react-query';
import { saavnApi } from '../services/api/saavnApi';

export const useTrendingSearch = () => {
  return useQuery({
    queryKey: ['trendingSearch'],
    queryFn: () => saavnApi.fetchTrendingSearch(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
