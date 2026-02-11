import { AudioPro, AudioProEventType, type AudioProTrack } from 'react-native-audio-pro';

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

  // Cache for tracking last refresh timestamps to avoid redundant API calls
  private lastRefreshMap: Map<string, number> = new Map();
  // 30 minutes throttle window
  private readonly REFRESH_THROTTLE_MS = 30 * 60 * 1000;

  private constructor() {}

  static getInstance(): URLRefreshLogic {
    if (!URLRefreshLogic.instance) {
      URLRefreshLogic.instance = new URLRefreshLogic();
    }
    return URLRefreshLogic.instance;
  }

  /**
   * Refresh the stream URL for a track at a given index
   * @param index The track index in the queue
   * @param track The track object
   * @param force If true, bypasses throttle and source checks (used for error recovery)
   */
  public async refreshTrackUrl(index: number, track: AudioProTrack, force: boolean = false) {
    if (!track || !track.id) return;

    const source = (track as any).source || 'saavn';
    const now = Date.now();
    const lastRefresh = this.lastRefreshMap.get(track.id) || 0;

    // throttling: skip if refreshed recently, unless forced by an error
    if (!force && (now - lastRefresh < this.REFRESH_THROTTLE_MS)) {
      if (__DEV__) {
        console.log(`[URLRefresh] Skipping refresh for ${track.title} (refreshed ${Math.round((now - lastRefresh) / 60000)}m ago)`);
      }
      return;
    }

    // conditional: only proactive-refresh for Gaana tracks
    if (!force && source !== 'gaana') {
      return;
    }
    
    if (__DEV__) {
      console.log(`[URLRefresh] Fetching new URL for track ${index}: ${track.title} (source: ${source}, forced: ${force})`);
    }

    try {
      const apiUrl = `https://api.sunoh.online/music/song/${track.id}/stream?provider=${source}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const json = await response.json();

      if (json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
        const links = json.data;
        let newUrl = links[0].link;

        const high = links.find((l: any) => l.quality === 'high' || l.quality === '320kbps');
        const medium = links.find((l: any) => l.quality === 'medium' || l.quality === '160kbps');

        if (high) newUrl = high.link;
        else if (medium) newUrl = medium.link;

        if (newUrl) {
          // Update last refresh timestamp even if URL is same (API call happened)
          this.lastRefreshMap.set(track.id, Date.now());

          if (newUrl !== track.url) {
            if (__DEV__) {
              console.log(`[URLRefresh] Updating track ${index} with new URL`);
            }

            AudioPro.updateTrack(index, {
              ...track,
              url: newUrl,
            });
          }
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
      return;
    }

    this.subscription = AudioPro.addEventListener((event) => {
      if (event.type === AudioProEventType.TRACK_CHANGED) {
        // Sliding Window: Pre-refresh next and previous tracks
        const { index } = event.payload || {};
        if (typeof index === 'number') {
          AudioPro.getMediaItems().then((queue) => {
            const nextIndex = index + 1;
            const prevIndex = index - 1;

            if (nextIndex < queue.length) {
              const nextTrack = queue[nextIndex];
              // default (force=false) applies the Gaana-only + throttling logic
              if (nextTrack) this.refreshTrackUrl(nextIndex, nextTrack);
            }

            if (prevIndex >= 0) {
              const prevTrack = queue[prevIndex];
              if (prevTrack) this.refreshTrackUrl(prevIndex, prevTrack);
            }
          });
        }
      } else if (event.type === AudioProEventType.PLAYBACK_ERROR) {
        // Error Recovery: Refresh current track and retry (FORCE refresh)
        const { index } = event.payload || {};
        const errorMessage = event.payload?.error || 'Unknown error';
        
        if (typeof index === 'number') {
          if (__DEV__) {
            console.log(`[URLRefresh] Playback error at index ${index}: ${errorMessage}. Attempting force refresh & retry.`);
          }
          
          AudioPro.getMediaItems().then(async (queue) => {
            const track = queue[index];
            if (track) {
              // Pass force=true to bypass source/throttle checks on error
              await this.refreshTrackUrl(index, track, true);
              setTimeout(() => {
                AudioPro.seekToMediaItem(index); // Retry playback
                setTimeout(() => AudioPro.play(), 100);
              }, 200);
            }
          });
        }
      }
    });

    if (__DEV__) {
      console.log('[URLRefresh] Initialized (Optimized Sliding Window + Error Recovery)');
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
