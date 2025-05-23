import { TestEnvironmentService } from './services/test-environment.service';
import { TestAppFactory } from './services/test-app.factory';
import { DatabaseInitializerService } from './services/database-initializer.service';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DataSource } from 'typeorm';
import { TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { createCacheManagerMock } from './mocks/cache-manager.mock';

// Global variables to track test environment state
let isInitialized = false;
let testAppFactory: TestAppFactory;
let environmentService: TestEnvironmentService;

/**
 * Initialize the entire test environment and application
 * @returns The initialized NestFastifyApplication instance
 */
export const setupTestApp = async (): Promise<NestFastifyApplication> => {
  if (isInitialized) {
    console.log('ℹ️ Test environment already initialized, reusing instance');
    return testAppFactory.getApp();
  }

  console.log('🚀 Setting up test environment and application...');

  try {
    // Force test environment settings
    process.env.NODE_ENV = 'test';
    process.env.POSTGRES_DB = 'test_db';

    // Safety check for production database
    if (
      process.env.POSTGRES_DB.includes('prod') ||
      process.env.POSTGRES_DB.includes('production')
    ) {
      throw new Error(
        `CRITICAL ERROR: Attempting to use production database: ${process.env.POSTGRES_DB}`,
      );
    }

    // 1. Initialize test environment (database, etc.)
    environmentService = TestEnvironmentService.getInstance();
    await environmentService.initializeEnvironment();

    // 2. Initialize test application
    testAppFactory = TestAppFactory.getInstance();
    const app = await testAppFactory.init();

    isInitialized = true;
    console.log('✅ Test environment and application initialized successfully');

    return app;
  } catch (error) {
    console.error('❌ Test setup failed:', error);
    // Try to clean up on failure
    await teardownTestApp();
    throw error;
  }
};

/**
 * Clean up all test resources
 * Should be called after all tests in a suite are complete
 */
export const teardownTestApp = async (): Promise<void> => {
  if (!isInitialized) {
    return;
  }

  console.log('🧹 Safe test environment cleanup...');

  try {
    // Close the app with a proper timeout handler
    if (testAppFactory) {
      const closePromise = testAppFactory.close();
      // Use a proper timeout with cleanup
      const timeoutPromise = new Promise((resolve) => {
        const id = setTimeout(() => {
          console.log('App close timed out after 1000ms');
          resolve(null);
        }, 1000);
        // Store the timeout ID
        resolve['timeoutId'] = id;
      });

      const result = await Promise.race([closePromise, timeoutPromise]);

      // Clean up the timeout
      if (timeoutPromise['timeoutId']) {
        clearTimeout(timeoutPromise['timeoutId']);
      }
    }

    isInitialized = false;
    console.log('✅ Test environment cleaned up');
  } catch (error) {
    console.error('❌ Error during test teardown:', error);
    // Mark as not initialized anyway
    isInitialized = false;
  }
};

/**
 * Reset the test database to a clean state
 * Useful for resetting between test suites if needed
 */
export const resetTestDatabase = async (): Promise<void> => {
  if (!isInitialized) {
    throw new Error(
      'Test environment not initialized. Call setupTestApp() first.',
    );
  }

  try {
    const databaseInitializer = new DatabaseInitializerService();
    await databaseInitializer.resetTestDatabase();
    console.log('✅ Test database reset successfully');
    return;
  } catch (error) {
    console.error('❌ Failed to reset test database:', error);
    throw error;
  }
};

/**
 * Get the DataSource from the TestApp
 */
export const getTestDataSource = (): DataSource => {
  if (!isInitialized) {
    throw new Error(
      'Test environment not initialized. Call setupTestApp() first.',
    );
  }
  return testAppFactory.getDataSource();
};

/**
 * Get the TestingModule from the TestApp
 */
export const getTestingModule = (): TestingModule => {
  if (!isInitialized) {
    throw new Error(
      'Test environment not initialized. Call setupTestApp() first.',
    );
  }
  return testAppFactory.getTestingModule();
};

/**
 * Get the base URL for API requests
 */
export const getTestBaseUrl = (): string => {
  if (!isInitialized) {
    throw new Error(
      'Test environment not initialized. Call setupTestApp() first.',
    );
  }
  return testAppFactory.getBaseUrl();
};

/**
 * Get a mock cache manager for testing
 */
export const getCacheManager = (): any => {
  return createCacheManagerMock();
};

/**
 * Check if the test environment is properly initialized
 */
export const isTestEnvironmentInitialized = (): boolean => {
  return isInitialized;
};

/**
 * Validate that we're connected to the test database
 */
export const validateTestDatabaseConnection = (): boolean => {
  if (!isInitialized) {
    return false;
  }

  const dataSource = testAppFactory.getDataSource();
  const dbName = dataSource.options.database;

  if (dbName !== 'test_db') {
    console.error(`❌ ERROR: Connected to wrong database: ${dbName}`);
    return false;
  }

  return true;
};
