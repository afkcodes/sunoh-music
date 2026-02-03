import { useQuery } from '@tanstack/react-query';
import { saavnApi } from '../services/api/saavnApi';

export const useAlbumData = (albumId: string) => {
  return useQuery({
    queryKey: ['album', albumId],
    queryFn: () => saavnApi.fetchAlbumDetails(albumId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};
