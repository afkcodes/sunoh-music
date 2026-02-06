import { useNavigationEvent } from 'navigation-react';
import { useCallback } from 'react';
import { Routes } from '../app/navigation/routes';
import { SaavnItem } from '../types/saavn';
import { getMediaItemProps } from '../utils/media';

export const useMediaNavigation = () => {
  const { stateNavigator } = useNavigationEvent();
  

  const navigateToItem = useCallback((item: SaavnItem, sectionProvider?: string) => {
    const props = getMediaItemProps(item, sectionProvider);
    
    switch (props.type) {
      case 'album':
        stateNavigator.navigate(Routes.Album, { 
          albumId: props.id, 
          provider: props.provider 
        });
        break;
      case 'playlist':
        stateNavigator.navigate(Routes.Playlist, { 
          playlistId: props.id, 
          provider: props.provider 
        });
        break;
      // Add more cases here as needed (artist, radio, etc.)
      default:
        console.warn(`Navigation not implemented for type: ${props.type}`);
        break;
    }
  }, [stateNavigator]);

  return { navigateToItem };
};
