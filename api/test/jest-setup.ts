// Force test environment
process.env.NODE_ENV = 'test';
process.env.POSTGRES_DB = 'test_db';
process.setMaxListeners(20); // Increase max listeners to avoid warnings

// Create global console logger interceptors
const testLogs: Array<{ type: string; message: string }> = [];

// Remember original console methods
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

// Override console methods to capture logs
console.log = function (...args) {
  testLogs.push({ type: 'log', message: args.join(' ') });
  originalConsoleLog.apply(this, args);
};

console.warn = function (...args) {
  testLogs.push({ type: 'warn', message: args.join(' ') });
  originalConsoleWarn.apply(this, args);
};

console.error = function (...args) {
  testLogs.push({ type: 'error', message: args.join(' ') });
  originalConsoleError.apply(this, args);
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
  if (testLogs.length > 0) {
    const testName = expect.getState().currentTestName;
    originalConsoleLog(`\nConsole output for "${testName}":`);

    testLogs.forEach((log) => {
      const prefix =
        log.type === 'error' ? '❌' : log.type === 'warn' ? '⚠️' : 'ℹ️';
      originalConsoleLog(`${prefix} [${log.type}] ${log.message}`);
    });

    // Clear logs for next test
    testLogs.length = 0;
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
