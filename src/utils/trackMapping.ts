import { AudioProTrack } from 'react-native-audio-pro';
import { Song } from '../types/album';
import { decodeHtmlEntities } from './htmlDecode';

export const mapSongToTrack = (song: Song): AudioProTrack => {
  // Find highest quality url
  // Usually the last one is highest, or check quality field
  // mediaUrls is array of { quality: string, link: string }
  // e.g. [{ quality: "96kbps", link: "..." }, { quality: "320kbps", link: "..." }]
  
  // Sort by quality if needed, but usually APIs return them ordered or we pick specific one.
  // For now let's just pick the last one or one with 320kbps if available.
  
  let url = '';
  if (song.mediaUrls && song.mediaUrls.length > 0) {
      // Simple logic: taking the last one assumes best quality
      url = song.mediaUrls[song.mediaUrls.length - 1]?.link || ''; 
  } else {
      console.warn('No media URLs found for song:', song.title);
  }

  // Get artwork: highest quality
  let artwork = '';
  if (song.image && song.image.length > 0) {
      artwork = song.image[song.image.length - 1]?.link || '';
  }

  const albumName = typeof song.album === 'object' 
    ? (song.album as any).name 
    : song.album;

  return {
    id: song.id,
    url: url,
    title: decodeHtmlEntities(song.title || ''),
    artist: decodeHtmlEntities(song.artists?.map(a => a.name).join(', ') || 'Unknown Artist'),
    artwork: artwork,
    album: decodeHtmlEntities(albumName || ''),
    duration: parseInt(song.duration || '0', 10) * 1000,
    // Custom props if needed
  };
};
