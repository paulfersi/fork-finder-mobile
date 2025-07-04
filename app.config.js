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
      googlePlacesApiKey: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY,
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_KEY,
    },
    ios: {
      supportsTablet: true,
    },
    android: {},
  },
};

