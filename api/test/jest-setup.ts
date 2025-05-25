// Force test environment
process.env.NODE_ENV = 'test';
process.env.POSTGRES_DB = 'test_db';
process.setMaxListeners(20); // Increase max listeners to avoid warnings

// Create test-specific console logger interceptors
const testLogs: Map<
  string,
  Array<{ type: string; message: string }>
> = new Map();

// Remember original console methods
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

// Get a unique identifier for the current test
const getTestIdentifier = () => {
  const testState = expect.getState();
  const testName = testState.currentTestName || 'unknown';
  const testFile = testState.testPath?.split('/').pop() || 'unknown';
  return `${testFile}:${testName}`;
};

// Override console methods to capture logs
console.log = function (...args) {
  const testId = getTestIdentifier();

  // Initialize logs array for this test if it doesn't exist
  if (!testLogs.has(testId)) {
    testLogs.set(testId, []);
  }

  // Add log to the test's logs
  testLogs.get(testId).push({ type: 'log', message: args.join(' ') });

  // Add test identifier prefix to logs
  const prefix = `[${testId}] `;
  originalConsoleLog.apply(this, [`${prefix}${args[0]}`, ...args.slice(1)]);
};

console.warn = function (...args) {
  const testId = getTestIdentifier();

  if (!testLogs.has(testId)) {
    testLogs.set(testId, []);
  }

  testLogs.get(testId).push({ type: 'warn', message: args.join(' ') });

  const prefix = `[${testId}] `;
  originalConsoleWarn.apply(this, [`${prefix}${args[0]}`, ...args.slice(1)]);
};

console.error = function (...args) {
  const testId = getTestIdentifier();

  if (!testLogs.has(testId)) {
    testLogs.set(testId, []);
  }

  testLogs.get(testId).push({ type: 'error', message: args.join(' ') });

  const prefix = `[${testId}] `;
  originalConsoleError.apply(this, [`${prefix}${args[0]}`, ...args.slice(1)]);
};

// Database safety check
beforeAll(() => {
  if (process.env.POSTGRES_DB !== 'test_db') {
    throw new Error(
      `CRITICAL ERROR: Tests attempting to run on non-test database: ${process.env.POSTGRES_DB}`,
    );
  }
});

// Display test logs after each test
afterEach(() => {
  const testId = getTestIdentifier();
  const logs = testLogs.get(testId) || [];

  if (logs.length > 0) {
    originalConsoleLog(`\nConsole output for "${testId}":`);

    logs.forEach((log) => {
      const prefix =
        log.type === 'error' ? '❌' : log.type === 'warn' ? '⚠️' : 'ℹ️';
      originalConsoleLog(`${prefix} [${log.type}] ${log.message}`);
    });

    // Clear logs for this test
    testLogs.delete(testId);
  }
});

// Global timeout for all tests
jest.setTimeout(30000);

// Handle unhandled Redis socket errors
const originalEmit = process.emit;
process.emit = function (
  this: typeof process,
  event: string | symbol,
  ...args: any[]
): boolean {
  if (
    (event === 'uncaughtException' || event === 'unhandledRejection') &&
    args[0] && // This is the error object
    ((args[0].message &&
      args[0].message.includes('Socket closed unexpectedly')) ||
      (args[0].context &&
        args[0].context.message?.includes('Socket closed unexpectedly')))
  ) {
    console.log('⚠️ Ignored Redis socket error during test teardown');
    return false;
  }
  return originalEmit.apply(this, [event, ...args]);
} as typeof process.emit;

// Specific handler for Redis socket errors
process.on('uncaughtException', (err) => {
  if (err.message?.includes('Socket closed unexpectedly')) {
    console.log('⚠️ Caught Redis socket error during teardown');
    return;
  }
  // For other errors, log them
  console.error('Uncaught exception:', err);
});

// Add a global teardown to ensure all resources are released
afterAll(async () => {
  // Clean up any remaining test logs
  testLogs.clear();

  // Give time for any pending operations to complete
  await new Promise((resolve) => setTimeout(resolve, 100));
}, 1000);
