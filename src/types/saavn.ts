export interface SaavnImage {
  quality: string; // "50x50", "150x150", "500x500"
  link: string;
}

export interface SaavnArtist {
  id: string;
  name: string;
  image: string | SaavnImage[];
  type: string;
  token: string;
}

export interface SaavnItem {
  id: string;
  title: string;
  subTitle: string;
  image: SaavnImage[] | string; // Sometimes string (playlist), sometimes array (song/album)
  type: 'song' | 'album' | 'playlist' | 'radio_station' | 'channel' | 'artist' | 'occasion' | 'radio';
  token: string;
  playCount?: string;
  releaseDate?: string;
  songCount?: string;
  language?: string;
  artists?: SaavnArtist[];
  // For playlists/charts
  editorFirstName?: string;
  followers?: string;
  provider?: 'gaana' | 'saavn' | 'spotify';
}

export interface SaavnSection {
  heading: string;
  data: SaavnItem[];
  source?: string;
  provider?: 'gaana' | 'saavn' | 'spotify';
}

export interface BaseSaavnResponse {
  status: string;
  message: string;
  source: string;
  error: any;
}

export interface SaavnResponse extends BaseSaavnResponse {
  data: SaavnSection[];
}

export interface Occasion {
  id: string;
  title: string;
  type: string;
  image?: SaavnImage[] | string;
  url: string; // This is used as slug
  source?: string;
  // Fallbacks for compatibility
  name?: string;
  slug?: string;
  artwork?: string;
  data?: SaavnItem[];
}
