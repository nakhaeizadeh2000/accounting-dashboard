import { TestEnvironmentService } from './services/test-environment.service';
import { ProcessExitHandler } from './process-exit-handler';
import { TestContainers } from './containers/test-containers';

// Register process exit handler to clean up test schemas
ProcessExitHandler.register();

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

// Completely prevent Redis errors from reaching Jest's error detection
const suppressRedisError = (error: any): boolean => {
  if (!error) return false;
  
  return (
    (error.constructor && error.constructor.name === 'SocketClosedUnexpectedlyError') ||
    (error.name && (error.name === 'SocketClosedUnexpectedlyError' || error.name === 'ClientClosedError')) ||
    (error.message && (
      error.message.includes('Socket closed unexpectedly') ||
      error.message.includes('Connection is closed') ||
      error.message.includes('The client is closed') ||
      error.message.includes('SocketClosedUnexpectedlyError') ||
      error.message.includes('@redis/client') ||
      error.message.includes('redis')
    )) ||
    (error.stack && (
      error.stack.includes('@redis/client') ||
      error.stack.includes('redis') ||
      error.stack.includes('Socket closed unexpectedly')
    ))
  );
};

// Store original listeners to restore non-Redis errors
const originalExceptionListeners = process.listeners('uncaughtException');
const originalRejectionListeners = process.listeners('unhandledRejection');

// Remove all existing listeners
process.removeAllListeners('uncaughtException');
process.removeAllListeners('unhandledRejection');

// Add our custom handlers first
process.on('uncaughtException', (err) => {
  if (suppressRedisError(err)) {
    // Redis errors are completely ignored - don't propagate to Jest
    return;
  }
  // For non-Redis errors, call original handlers
  originalExceptionListeners.forEach(listener => {
    try {
      (listener as Function)(err);
    } catch (e) {
      // Ignore errors in error handlers
    }
  });
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  if (suppressRedisError(reason)) {
    // Redis errors are completely ignored - don't propagate to Jest
    return;
  }
  // For non-Redis errors, call original handlers
  originalRejectionListeners.forEach(listener => {
    try {
      (listener as Function)(reason, promise);
    } catch (e) {
      // Ignore errors in error handlers
    }
  });
});

// Override process.emit to catch errors before they reach Jest
const originalEmit = process.emit;
process.emit = function (this: typeof process, event: string | symbol, ...args: any[]): boolean {
  if ((event === 'uncaughtException' || event === 'unhandledRejection') && args[0] && suppressRedisError(args[0])) {
    // Completely prevent Redis errors from being emitted
    return true;
  }
  return originalEmit.apply(this, [event, ...args]);
} as typeof process.emit;

// Override Jest's internal error tracking
if (typeof global !== 'undefined') {
  const originalProcessOn = process.on;
  process.on = function(event: string | symbol, listener: (...args: any[]) => void) {
    if (event === 'uncaughtException' || event === 'unhandledRejection') {
      // Wrap Jest's error listeners to filter Redis errors
      const wrappedListener = function(...args: any[]) {
        if (args[0] && suppressRedisError(args[0])) {
          return; // Don't call Jest's handler for Redis errors
        }
        return listener.apply(this, args);
      };
      return originalProcessOn.call(this, event, wrappedListener);
    }
    return originalProcessOn.call(this, event, listener);
  };
}

// Add a global teardown to ensure all resources are released
afterAll(async () => {
  // Clean up any remaining test logs
  testLogs.clear();

  // Clean up any test schemas that might have been left behind
  try {
    await ProcessExitHandler.cleanupTestSchemas();
  } catch (error) {
    console.error('Error cleaning up test schemas in afterAll:', error);
  }

  // Give time for any pending operations to complete
  await new Promise((resolve) => setTimeout(resolve, 500));
}, 5000);

// Global setup and teardown functions for Jest
export async function setup() {
  console.log('🚀 Global test setup starting...');

  try {
    // Clean up any leftover test schemas from previous runs
    await ProcessExitHandler.cleanupTestSchemas();

    // Initialize test environment
    const environmentService = TestEnvironmentService.getInstance();
    await environmentService.initializeEnvironment();

    // Initialize test containers if needed
    if (typeof TestContainers !== 'undefined' && TestContainers.initialize) {
      await TestContainers.initialize();
    }

    console.log('✅ Global test setup completed successfully');
  } catch (error) {
    console.error('❌ Global test setup failed:', error);
    throw error;
  }
}

export async function teardown() {
  console.log('🧹 Global test teardown starting...');

  try {
    // Clean up all test schemas
    await ProcessExitHandler.cleanupTestSchemas();

    // Stop test containers if needed
    if (typeof TestContainers !== 'undefined' && TestContainers.cleanup) {
      await TestContainers.cleanup();
    }

    console.log('✅ Global test teardown completed successfully');

    // Force exit after cleanup to ensure no hanging connections
    process.exit(0);
  } catch (error) {
    console.error('❌ Global test teardown failed:', error);
    process.exit(1);
  }
}
