module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  clearMocks: true,
  collectCoverageFrom: [
    'src/features/garden-agent/**/*.ts',
    'src/features/garden-records/**/*.ts',
    '!src/features/garden-records/hooks/**',
    'src/features/storage/databaseTypes.ts',
    'src/services/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/seed/**',
    '!src/features/garden-records/repositories/webFallback.ts',
    '!src/features/storage/nativeSqlite*.ts',
  ],
  coverageThreshold: {
    global: {
      lines: 80,
      statements: 80,
      functions: 80,
      branches: 65,
    },
  },
  moduleNameMapper: {
    '^react-native$': '<rootDir>/src/test/mocks/reactNative.ts',
    '^expo-file-system/legacy$': '<rootDir>/src/test/mocks/expoFileSystemLegacy.ts',
  },
};
