// Ensure test environment is used
process.env.NODE_ENV = 'test';
process.env.POSTGRES_DB = 'test_db';

// Log environment to verify
console.log('Test Environment Setup:', {
  NODE_ENV: process.env.NODE_ENV,
  POSTGRES_DB: process.env.POSTGRES_DB,
  POSTGRES_HOST: process.env.POSTGRES_HOST,
});

// Add database validation to prevent using production DB
beforeAll(() => {
  if (process.env.POSTGRES_DB !== 'test_db') {
    console.error(
      'CRITICAL ERROR: Test attempting to run on non-test database!',
    );
    console.error(`Database: ${process.env.POSTGRES_DB}`);
    throw new Error('Tests must use test_db database');
  }
  console.log(`Verified test database: ${process.env.POSTGRES_DB}`);
}, 10000);

// Store test logs
interface LogEntry {
  type: 'log' | 'warn' | 'error';
  args: any[];
  timestamp: Date;
}

// Use a simple array to collect logs instead of relying on jest.getState()
const testLogs: LogEntry[] = [];

// Override console methods to capture logs
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

console.log = function (...args: any[]) {
  testLogs.push({
    type: 'log',
    args: [...args],
    timestamp: new Date(),
  });
  originalConsoleLog.apply(this, args);
};

console.warn = function (...args: any[]) {
  testLogs.push({
    type: 'warn',
    args: [...args],
    timestamp: new Date(),
  });
  originalConsoleWarn.apply(this, args);
};

console.error = function (...args: any[]) {
  testLogs.push({
    type: 'error',
    args: [...args],
    timestamp: new Date(),
  });
  originalConsoleError.apply(this, args);
};

// Add hook to capture console output
afterEach(() => {
  if (testLogs.length > 0) {
    const testName = expect.getState().currentTestName;
    const consoleLogs = testLogs
      .map((log) => `[${log.type}] ${log.args.join(' ')}`)
      .join('\n');

    console.info(`Console output from ${testName}:\n${consoleLogs}\n`);

    // Clear logs after reporting
    testLogs.length = 0;
  }
});
