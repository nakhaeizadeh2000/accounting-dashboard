/**
 * Centralized export file for all test fixtures
 * This allows importing all fixtures from a single location
 */

// User fixtures
export * from './users.fixture';

// Permission and role fixtures
export * from './permissions.fixture';

// Content fixtures
export * from './articles.fixture';

/**
 * Additional test data that doesn't warrant its own file
 */

// Test file data
export const testFiles = {
  textFile: {
    name: 'test.txt',
    content: 'This is a test file',
    mimeType: 'text/plain',
  },
  imageFile: {
    name: 'test.jpg',
    mimeType: 'image/jpeg',
  },
  pdfFile: {
    name: 'test.pdf',
    mimeType: 'application/pdf',
  },
};

// Test settings
export const testSettings = {
  // How long to wait for async operations in tests
  defaultTimeout: 5000,
  // Default pagination settings
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
  },
};
