export const baseURL = 'https://api.sunoh.online';
export const proxyImageURL = 'https://api.sunoh.online/proxy?url=';

// Music Endpoints
export const MUSIC_HOME = `${baseURL}/music/home`;
export const MUSIC_SEARCH = `${baseURL}/music/search`;
export const MUSIC_ALBUM = (albumId: string) => `${baseURL}/music/album/${albumId}`;
export const MUSIC_SONG = (songId: string) => `${baseURL}/music/song/${songId}`;
export const MUSIC_SONG_STREAM = (songId: string) => `${baseURL}/music/song/${songId}/stream`;
export const MUSIC_PLAYLIST = (playlistId: string) => `${baseURL}/music/playlist/${playlistId}`;
export const MUSIC_ARTIST = (artistId: string) => `${baseURL}/music/artist/${artistId}`;
export const MUSIC_COLLECTION = (seokey: string) => `${baseURL}/music/collection/${seokey}`;
export const MUSIC_ALBUM_LIST = `${baseURL}/music/album-list`;
export const MUSIC_OCCASIONS = `${baseURL}/music/occasions`;
export const MUSIC_OCCASIONS_DETAIL = (slug: string) => `${baseURL}/music/occasions/${slug}`;

// Lyrics Endpoints
export const LYRICS_GET = (songName: string) => `${baseURL}/lyrics/${songName}`;

// General Endpoints
export const GENERAL_HEALTH = `${baseURL}/`;
export const GENERAL_PROXY = `${baseURL}/proxy`;

// Legacy object for compatibility (though we should move away from it)
export const musicEndpoints = {
  home: MUSIC_HOME,
  search: MUSIC_SEARCH,
  album: MUSIC_ALBUM,
  song: MUSIC_SONG,
  songStream: MUSIC_SONG_STREAM,
  playlist: MUSIC_PLAYLIST,
  artist: MUSIC_ARTIST,
  collection: MUSIC_COLLECTION,
  albumList: MUSIC_ALBUM_LIST,
};

export const endpoints = {
  music: musicEndpoints,
  lyrics: LYRICS_GET,
  general: {
    health: GENERAL_HEALTH,
    proxy: GENERAL_PROXY,
  },
};
