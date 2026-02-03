import { SaavnArtist, SaavnImage } from './saavn';

export interface Song {
  id: string;
  title: string;
  subtitle: string;
  images: SaavnImage[];
  language: string;
  year: string;
  type: 'song';
  isExplicit: string;
  playCount: string;
  music: string;
  album: string;
  albumId: string;
  label: string;
  mediaUrls: Array<{
    quality: string;
    link: string;
  }>;
  duration: string;
  copyright: string;
  release_date: string;
  hasLyrics: string;
  artists: SaavnArtist[];
  origin: string;
  token: string;
  source: string;
}

export interface AlbumDetails {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  type: 'album';
  token: string;
  images: SaavnImage[];
  language: string;
  year: string;
  listCount: string;
  listType: string;
  list: Song[];
  isExplicit: string;
  copyright: string;
  songCount: string;
  artists: SaavnArtist[];
}

export interface AlbumResponse {
  code: number;
  message: string;
  data: {
    album: AlbumDetails;
    sections: any[];
  };
}
