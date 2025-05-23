module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.*\\.(spec|e2e-spec)\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/main.ts',
    '!src/**/*.module.ts',
    '!src/**/*.dto.ts',
    '!src/**/*.entity.ts',
    '!src/**/*.interface.ts',
  ],
  coverageDirectory: './coverage',
  moduleNameMapper: {
    '^src/(.*)': '<rootDir>/src/$1',
    '^ioredis': '<rootDir>/test/mocks/redis-mock.js',
    '^@redis/client': '<rootDir>/test/mocks/redis-mock.js',
  },
  testTimeout: 30000,
  bail: true,
  forceExit: true,
  setupFiles: ['./test/services/test-environment.service.ts'],
  setupFilesAfterEnv: ['./test/jest-setup.ts'],
  reporters: [
    'default',
    [
      'jest-html-reporter',
      {
        pageTitle: 'API Test Report',
        outputPath: './test-report/report.html',
        includeFailureMsg: true,
        includeConsoleLog: true,
        sort: 'status',
        dateFormat: 'yyyy-mm-dd HH:MM:ss',
        executionTimeWarningThreshold: 5,
        executionMode: 'reporter',
      },
    ],
  ],
};
