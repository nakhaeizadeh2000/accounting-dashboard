// Import the reporter
const { reporter } = require('jest-allure/dist/setup');

// Setup Allure
beforeAll(() => {
  reporter.setupAllure();
});

// Add console output collection for better reporting
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

console.log = function () {
  jest.getState().testPath &&
    (global._consoleLogs || (global._consoleLogs = [])).push([
      'log',
      Array.from(arguments),
    ]);
  originalConsoleLog.apply(this, arguments);
};

console.warn = function () {
  jest.getState().testPath &&
    (global._consoleLogs || (global._consoleLogs = [])).push([
      'warn',
      Array.from(arguments),
    ]);
  originalConsoleWarn.apply(this, arguments);
};

console.error = function () {
  jest.getState().testPath &&
    (global._consoleLogs || (global._consoleLogs = [])).push([
      'error',
      Array.from(arguments),
    ]);
  originalConsoleError.apply(this, arguments);
};

// Add hooks for Allure to capture console output
afterEach(() => {
  const logs = global._consoleLogs || [];
  global._consoleLogs = [];

  if (logs.length > 0) {
    const testName = expect.getState().currentTestName;
    const consoleLogs = logs
      .map((log) => `[${log[0]}] ${log[1].join(' ')}`)
      .join('\n');

    // Add to Allure as attachment
    const { allure } = require('jest-allure/runtime');
    allure.attachment('console.log', consoleLogs, 'text/plain');

    console.info(`Console output from ${testName}:\n${consoleLogs}\n`);
  }
});
