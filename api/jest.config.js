module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.*\\.(spec|e2e-spec)\\.ts$',

  // Enable parallel execution with controlled concurrency
  maxWorkers: '4', // Use 4 workers for parallel tests

  // Increase timeout for tests that use containers
  testTimeout: 60000, // 60 seconds

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

  // Module name mappings
  moduleNameMapper: {
    '^src/(.*)': '<rootDir>/src/$1',
  },

  // Fail fast on first error
  bail: true,

  // Setup files
  setupFilesAfterEnv: ['./test/jest-setup.ts'],

  // Global setup/teardown hooks for container management
  globalSetup: './test/global-setup.ts',
  globalTeardown: './test/global-teardown.ts',

  // Enable coverage collection
  collectCoverage: true,

  // Configure reporters
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

  // Verbose output for better debugging
  verbose: true,

  // Force exit after tests complete to avoid hanging
  forceExit: true,

  // Detect open handles (like database connections) that weren't closed
  detectOpenHandles: true,
};
