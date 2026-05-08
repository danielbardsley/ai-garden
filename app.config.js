const webBaseUrl = process.env.EXPO_WEB_BASE_URL;

module.exports = {
  expo: {
    name: 'Garden Roof Deck',
    slug: 'garden-roof-deck',
    scheme: 'garden-roof-deck',
    plugins: ['expo-sqlite'],
    ios: {
      infoPlist: {
        NSCameraUsageDescription:
          'Garden Roof Deck will use the camera to add plant and garden photos when photo capture is implemented.',
        NSPhotoLibraryUsageDescription:
          'Garden Roof Deck will use the photo library to add garden images to the gallery when media import is implemented.',
      },
    },
    android: {
      permissions: ['CAMERA', 'READ_MEDIA_IMAGES'],
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
