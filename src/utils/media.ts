import { dataConfigs } from '../config/dataConfigs';
import { SaavnImage, SaavnItem } from '../types/saavn';
import { capitalizeFirstLetter } from './common';
import { dataExtractor, NestedObject } from './dataExtractor';
import { decodeHtmlEntities } from './htmlDecode';

export interface MediaItemProps {
  id: string;
  token: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  type: SaavnItem['type'];
  provider: 'gaana' | 'saavn' | 'spotify' | 'unified';
  isCircle: boolean;
}

/**
 * Standardized data extraction for media items (songs, albums, playlists, etc.)
 */
export function getMediaItemProps(
  item: any,
  sectionProvider?: string
): MediaItemProps {
  const itemType = (item.type || 'album') as SaavnItem['type'];
  const isConfigType = (key: string): key is keyof typeof dataConfigs => key in dataConfigs;
  const config = isConfigType(itemType) ? dataConfigs[itemType] : dataConfigs.album;

  const title = decodeHtmlEntities(dataExtractor<string>(item as unknown as NestedObject, config.title) || '');
  
  const subtitleRaw = dataExtractor<string>(item as unknown as NestedObject, config.subtitle) || '';
  const subtitle = decodeHtmlEntities(capitalizeFirstLetter(subtitleRaw));

  // Standardized Image Extraction
  const imageUrl = dataExtractor<string>(
    item as unknown as NestedObject, 
    config.image,
    '.',
    (images: any[]) => {
      // Look for high quality first
      const highQuality = images.find((img: SaavnImage) => img.quality === '500x500');
      if (highQuality) return highQuality.link;
      // Fallback to last item in array
      return images[images.length - 1]?.link || '';
    }
  ) || '';

  const isCircle = ['radio_station', 'artist'].includes(itemType);
  const providerCandidate = item.source || item.provider || sectionProvider || 'saavn';
  const provider = (providerCandidate === 'unified' ? 'saavn' : providerCandidate) as MediaItemProps['provider'];

  const id = dataExtractor<string>(item as unknown as NestedObject, config.id) || item.id || '';
  const token = dataExtractor<string>(item as unknown as NestedObject, config.token) || id;

  return {
    id,
    token,
    title,
    subtitle,
    imageUrl,
    type: itemType,
    provider,
    isCircle,
  };
}
