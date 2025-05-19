module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: './',
  testRegex: '.*\\.(spec|e2e-spec)\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/main.ts',
    '!src/**/*.module.ts',
    '!src/**/*.entity.ts',
    '!src/**/*.dto.ts',
  ],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/', '<rootDir>/test/'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  testTimeout: 30000,
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
        styleOverridePath: null,
        customScriptPath: null,
      },
    ],
  ],
};
