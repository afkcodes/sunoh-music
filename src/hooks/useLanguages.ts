import { useQuery } from '@tanstack/react-query';
import { saavnApi } from '../services/api/saavnApi';

export const useLanguages = () => {
  return useQuery({
    queryKey: ['languages'],
    queryFn: () => saavnApi.fetchLanguages(),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours (languages don't change often)
  });
};
