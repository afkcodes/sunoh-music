import { AudioPro, type AudioProTrack } from 'react-native-audio-pro';

/**
 * Headless URL refresh logic for handling expired streaming URLs.
 * 
 * Strategy:
 * - Sliding Window: On track change, pre-refresh next and previous tracks
 * - Error Recovery: On playback error, refresh current track and retry
 * 
 * Required for providers like Gaana where streaming URLs expire after a period.
 */

export class URLRefreshLogic {
  private static instance: URLRefreshLogic;
  private subscription: any;

  private constructor() {}

  static getInstance(): URLRefreshLogic {
    if (!URLRefreshLogic.instance) {
      URLRefreshLogic.instance = new URLRefreshLogic();
    }
    return URLRefreshLogic.instance;
  }

  /**
   * Refresh the stream URL for a track at a given index
   */
  private async refreshTrackUrl(index: number, track: AudioProTrack) {
    if (!track || !track.id) return;

    // Extract source from track (added in mapSongToTrack)
    const source = (track as any).source || 'saavn';
    
    if (__DEV__) {
      console.log(`[URLRefresh] Fetching new URL for track ${index}: ${track.title} (source: ${source})`);
    }

    try {
      // Use the API endpoint directly with provider parameter
      const apiUrl = `https://api.sunoh.online/music/song/${track.id}/stream?provider=${source}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const json = await response.json();

      if (json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
        const links = json.data;
        let newUrl = links[0].link;

        // Prefer high quality, fallback to medium
        const high = links.find((l: any) => l.quality === 'high' || l.quality === '320kbps');
        const medium = links.find((l: any) => l.quality === 'medium' || l.quality === '160kbps');

        if (high) newUrl = high.link;
        else if (medium) newUrl = medium.link;

        // Only update if URL changed
        if (newUrl && newUrl !== track.url) {
          if (__DEV__) {
            console.log(`[URLRefresh] Updating track ${index} with new URL`);
          }

          AudioPro.updateTrack(index, {
            ...track,
            url: newUrl,
          });
        }
      }
    } catch (error) {
      console.error(`[URLRefresh] Error fetching stream for ${track.id}:`, error);
    }
  }

  /**
   * Initialize the URL refresh logic
   */
  initialize() {
    if (this.subscription) {
      // Already initialized
      return;
    }

    this.subscription = AudioPro.addEventListener((event) => {
      if (event.type === 'PLAYBACK_ERROR') {
        // Error Recovery: Refresh current track and retry
        const { index } = event.payload || {};
        if (typeof index === 'number') {
          console.log(`[URLRefresh] Playback error at index ${index}. Attempting refresh & retry.`);
          
          AudioPro.getQueue().then(async (queue) => {
            const track = queue[index];
            if (track) {
              await this.refreshTrackUrl(index, track);
              // Brief delay to ensure native update propagates
              setTimeout(() => {
                AudioPro.skipTo(index);
              }, 150);
            }
          });
        }
      }
    });

    if (__DEV__) {
      console.log('[URLRefresh] Initialized (error-only mode)');
    }
  }

  /**
   * Clean up the URL refresh logic
   */
  destroy() {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
  }
}

export const urlRefreshLogic = URLRefreshLogic.getInstance();
