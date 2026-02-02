const baseURL = 'https://api.sunoh.online';
const proxyImageURL = 'https://api.sunoh.online/proxy?url=';
const endpoints = {
  saavn: {
    home: `${baseURL}/saavn`,
    modules: `${baseURL}/modules`,
    album: `${baseURL}/saavn/album`,
    playlist: `${baseURL}/saavn/playlist`,
    artist: `${baseURL}/saavn/artist`,
    mix: `${baseURL}/saavn/mix`,
    createStation: `${baseURL}/saavn/create_station`,
    getStationSongs: `${baseURL}/saavn/get_station_songs`,
    search: `${baseURL}/saavn/search`,
    recommendation: `${baseURL}/saavn/recommended_songs`,
    song: `${baseURL}/saavn/song`,
  },
  gaana: {
    track: `${baseURL}/gaana/track`,
    radio: {
      popular: `${baseURL}/gaana/radios/popular`,
      detail: `${baseURL}/gaana/radio`,
    },
  },
  lyrics: `${baseURL}/lyrics`,
};

export { baseURL, endpoints, proxyImageURL };
