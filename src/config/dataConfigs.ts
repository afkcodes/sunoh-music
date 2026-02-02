const dataConfigs = {
  album: {
    id: 'id',
    title: 'title',
    artists: 'artists',
    image: ['images.2.link', 'images', 'image'],
    subtitle: ['editorFirstName', 'subTitle', 'type', 'subtitle', 'artists'],
    year: 'releaseYear',
    editor: 'editorFirstName',
    duration: 'duration',
    token: 'token',
  },
  albumHero: {
    id: 'id',
    token: 'token',
    title: 'title',
    description: 'description',
    year: 'year',
    trackCount: 'listCount',
    copyright: 'copyright',
  },
  audio: {
    id: 'id',
    title: 'title',
    subtitle: 'subtitle',
    image: 'images.1.link',
    duration: 'duration',
    artists: 'artists',
    palette: 'palette',
  },
  radio: {
    id: 'id',
    language: 'language',
    name: 'name',
  },
} as const;

export { dataConfigs };
