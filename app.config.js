const webBaseUrl = process.env.EXPO_WEB_BASE_URL;

module.exports = {
  expo: {
    name: 'Garden Roof Deck',
    slug: 'garden-roof-deck',
    scheme: 'garden-roof-deck',
    plugins: [
      'expo-sqlite',
      'expo-camera',
      [
        'expo-location',
        {
          locationWhenInUsePermission:
            'Garden Roof Deck uses your location to show local weather and your garden zone.',
        },
      ],
    ],
    ios: {
      infoPlist: {
        NSCameraUsageDescription:
          'Garden Roof Deck uses the camera to add plant and garden photos to your local journal.',
        NSPhotoLibraryUsageDescription:
          'Garden Roof Deck will use the photo library to add garden images to the gallery when media import is implemented.',
        NSLocationWhenInUseUsageDescription:
          'Garden Roof Deck uses your location to show local weather and your garden zone.',
      },
    },
    android: {
      permissions: ['CAMERA', 'READ_MEDIA_IMAGES', 'ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION'],
    },
    extra: {
      basePath: '/apps/garden-roof-deck/',
      apiBasePath: '/api/garden-roof-deck/',
    },
    web: {
      bundler: 'metro',
      output: 'static',
    },
    ...(webBaseUrl
      ? {
          experiments: {
            baseUrl: webBaseUrl,
          },
        }
      : {}),
  },
};
