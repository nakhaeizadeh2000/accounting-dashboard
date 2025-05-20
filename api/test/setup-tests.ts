import './test-environment'; // Load environment variables
import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { DataSource } from 'typeorm';
import { setupTestDatabase } from './test-environment';
import { TestApp } from './test-app';

// Global variables to track test environment state
let isInitialized = false;

// Create mock cache manager
export const getCacheManager = () => {
  const cacheManager = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    del: jest.fn().mockResolvedValue(undefined),
    reset: jest.fn().mockResolvedValue(undefined),
    store: {
      keys: jest.fn().mockResolvedValue([]),
    },
  };
  return cacheManager;
};

// Create mock MinIO service
const mockMinioService = {
  getClient: jest.fn().mockReturnValue({
    putObject: jest.fn().mockResolvedValue({}),
    getObject: jest.fn().mockResolvedValue({}),
    listBuckets: jest.fn().mockResolvedValue([]),
  }),
  getPublicEndpoint: jest.fn().mockReturnValue('localhost/minio'),
  checkConnection: jest.fn().mockResolvedValue(true),
  getConfig: jest.fn().mockReturnValue({
    endpoint: 'localhost',
    port: 9000,
    useSSL: false,
    accessKey: 'test',
    region: 'us-east-1',
    publicEndpoint: 'localhost/minio',
  }),
};

/**
 * This function prepares the test environment and initializes the TestApp
 * Returns the NestFastifyApplication instance
 */
export const setupTestApp = async () => {
  if (!isInitialized) {
    console.log('🔧 Setting up test environment...');

    // Force test environment settings
    process.env.NODE_ENV = 'test';
    process.env.POSTGRES_DB = 'test_db';

    console.log('📊 Test environment configuration:');
    console.log(`  NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`  POSTGRES_DB: ${process.env.POSTGRES_DB}`);
    console.log(`  POSTGRES_HOST: ${process.env.POSTGRES_HOST || 'localhost'}`);

    // Setup test database from scratch
    try {
      await setupTestDatabase();
      console.log('✅ Test database reset complete');
    } catch (error) {
      console.error('❌ Failed to setup test database:', error);
      throw error;
    }

    // Initialize TestApp instance
    try {
      const testApp = TestApp.getInstance();
      await testApp.init();
      console.log('✅ Test application initialized successfully');

      // Note: Provider overrides should be done inside TestApp.init(),
      // not here after the module is compiled

      // Verify database connection is to test_db
      const dataSource = testApp.getDataSource();
      const dbName = dataSource.options.database;
      console.log(`🔍 Verifying database connection to: ${dbName}`);

      if (dbName !== 'test_db') {
        throw new Error(
          `CRITICAL ERROR: Test app connected to wrong database: ${dbName}. Tests must use test_db!`,
        );
      }

      isInitialized = true;
      return testApp.getApp();
    } catch (error) {
      console.error('❌ Failed to initialize test application:', error);
      // Try to clean up if initialization failed
      try {
        await TestApp.getInstance().close();
      } catch (cleanupError) {
        console.error(
          'Error during cleanup after failed initialization:',
          cleanupError,
        );
      }
      throw error;
    }
  } else {
    // Already initialized, just return the app
    console.log('ℹ️ Test app already initialized, reusing instance');
    return TestApp.getInstance().getApp();
  }
};

/**
 * Tears down the test application and cleans up resources
 */
export const teardownTestApp = async () => {
  if (isInitialized) {
    console.log('🧹 Cleaning up test environment...');

    try {
      // 1. Try to access and close the Redis client directly
      try {
        const cacheManager = getTestingModule().get(CACHE_MANAGER);
        if (cacheManager && cacheManager.store && cacheManager.store.client) {
          console.log('Closing Redis client...');
          if (typeof cacheManager.store.client.quit === 'function') {
            await cacheManager.store.client.quit();
          }
          // Force disconnect if quit doesn't work
          if (typeof cacheManager.store.client.disconnect === 'function') {
            await cacheManager.store.client.disconnect();
          }
        }
      } catch (redisError) {
        console.log('Failed to close Redis client:', redisError.message);
      }

      // 2. Close the NestJS application
      await TestApp.getInstance().close();

      // 3. Add a force close fallback using Node's process.exit
      // We'll set a timeout to ensure this happens if normal shutdown fails
      const forceExitTimeout = setTimeout(() => {
        console.log('🔥 Forcing process exit due to lingering connections');
        process.exit(0); // This will forcibly terminate any hanging connections
      }, 1000);

      // Allow the timeout to be cleared if normal shutdown works
      forceExitTimeout.unref();

      isInitialized = false;
      console.log('✅ Test environment cleaned up successfully');
    } catch (error) {
      console.error('❌ Error during test environment teardown:', error);
    }
  } else {
    console.log('ℹ️ Test environment was not initialized, nothing to clean up');
  }
};

/**
 * Resets the test database to a clean state for a test
 */
export const resetTestDatabase = async () => {
  if (!isInitialized) {
    throw new Error(
      'Test environment not initialized. Call setupTestApp() first.',
    );
  }

  try {
    await TestApp.getInstance().resetDatabase();
    return true;
  } catch (error) {
    console.error('❌ Failed to reset test database:', error);
    throw error;
  }
};

/**
 * Returns the TestingModule from the TestApp
 */
export const getTestingModule = () => {
  if (!isInitialized) {
    throw new Error(
      'Test environment not initialized. Call setupTestApp() first.',
    );
  }
  return TestApp.getInstance().getTestingModule();
};

/**
 * Returns the DataSource from the TestApp
 */
export const getTestDataSource = () => {
  if (!isInitialized) {
    throw new Error(
      'Test environment not initialized. Call setupTestApp() first.',
    );
  }
  return TestApp.getInstance().getDataSource();
};

/**
 * Returns the base URL for making requests to the test app
 */
export const getTestBaseUrl = () => {
  return TestApp.getInstance().getBaseUrl();
};

/**
 * Returns the mocked cache manager
 */
export const getCachedManager = getCacheManager;

/**
 * Check if the test environment is properly initialized
 */
export const isTestEnvironmentInitialized = () => {
  return isInitialized;
};
