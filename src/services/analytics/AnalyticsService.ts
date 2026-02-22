import analytics from '@react-native-firebase/analytics';

/**
 * Standardize analytics events across the app.
 */
class AnalyticsService {
  async logScreenView(screenName: string, screenClass?: string) {
    try {
      await analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenClass || screenName,
      });
      console.log(`📊 Analytics: Screen view [${screenName}]`);
    } catch (error) {
      console.log('📊 Analytics Error (Screen View):', error);
    }
  }

  async logSongPlay(songData: {
    id: string;
    title: string;
    artist?: string;
    provider?: string;
  }) {
    try {
      await analytics().logEvent('song_play', {
        item_id: songData.id,
        item_name: songData.title,
        artist_name: songData.artist || 'Unknown',
        provider: songData.provider || 'unknown',
      });
      console.log(`📊 Analytics: Song play [${songData.title}]`);
    } catch (error) {
      console.log('📊 Analytics Error (Song Play):', error);
    }
  }

  async logSearch(query: string) {
    try {
      await analytics().logSearch({ search_term: query });
      console.log(`📊 Analytics: Search [${query}]`);
    } catch (error) {
      console.log('📊 Analytics Error (Search):', error);
    }
  }

  async logCustomEvent(eventName: string, params?: Record<string, any>) {
    try {
      await analytics().logEvent(eventName, params);
      console.log(`📊 Analytics: Custom event [${eventName}]`, params);
    } catch (error) {
      console.log(`📊 Analytics Error (${eventName}):`, error);
    }
  }
}

export const appAnalytics = new AnalyticsService();
