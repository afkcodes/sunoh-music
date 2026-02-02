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
  images: SaavnImage[] | string; // Sometimes string (playlist), sometimes array (song/album)
  type: 'song' | 'album' | 'playlist' | 'radio_station' | 'channel' | 'artist';
  token: string;
  playCount?: string;
  releaseDate?: string;
  songCount?: string;
  language?: string;
  artists?: SaavnArtist[];
  // For playlists/charts
  editorFirstName?: string;
  followers?: string;
}

export interface SaavnSection {
  heading: string;
  data: SaavnItem[];
  source?: string;
}

export interface SaavnResponse {
  code: number;
  message: string;
  data: SaavnSection[];
}
