import { useQuery } from '@tanstack/react-query';
import { saavnApi } from '../services/api/saavnApi';

export interface ArtistImage {
  quality: string;
  link: string;
}

export interface ArtistSection {
  heading: string;
  data: any[];
}

export interface ArtistData {
  id: string;
  name: string;
  image: ArtistImage[];
  bio?: string;
  followers?: string;
  subtitle?: string;
  type: string;
  sections: ArtistSection[];
}

export interface ArtistResponse {
  status: string;
  data: ArtistData;
}

export const useArtistData = (artistId: string) => {
  return useQuery<ArtistResponse, Error>({
    queryKey: ['artist', artistId],
    queryFn: () => saavnApi.fetchArtistDetails(artistId),
    enabled: !!artistId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};
