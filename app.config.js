import 'dotenv/config';

export default {
  expo: {
    name: 'fork-finder-mobile',
    slug: 'fork-finder-mobile',
    version: '1.0.0',
    plugins: [
      [
        '@rnmapbox/maps',
        {
          RNMapboxMapsImpl: 'mapbox',
          accessToken: process.env.MAPBOX_ACCESS_TOKEN,
        },
      ],
    ],
    extra: {
      mapboxToken: process.env.MAPBOX_ACCESS_TOKEN,
    },
    ios: {
      supportsTablet: true,
    },
    android: {},
  },
};
