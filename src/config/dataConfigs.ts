const dataConfigs = {
  album: {
    id: 'id',
    title: ['title', 'name'],
    artists: 'artists',
    image: ['image.2.link', 'image.0.link', 'artwork', 'atw', 'atwj'],
    subtitle: ['editorFirstName', 'subTitle', 'type', 'subtitle', 'artists', 'language'],
    year: 'releaseYear',
    editor: 'editorFirstName',
    duration: 'duration',
    token: ['token', 'id'],
  },
  playlist: {
    id: 'id',
    title: ['title', 'name'],
    subtitle: ['subTitle', 'subtitle', 'editorFirstName', 'followers', 'language'],
    image: ['image.2.link', 'image.0.link', 'artwork', 'atw', 'atwj'],
    description: 'description',
    year: 'year',
    trackCount: 'listCount',
    token: ['token', 'id'],
  },
  albumHero: {
    id: 'id',
    token: ['token', 'id'],
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
    image: 'image.1.link',
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
