import './test-environment'; // Load environment variables
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { setupTestDatabase } from './test-environment';
import { AppModule } from '../src/app.module';

let testingModule: TestingModule;
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
 * This function prepares the test database
 * It doesn't create a NestJS app instance since we're testing against a running server
 */
export const setupTestApp = async () => {
  if (!isInitialized) {
    console.log('Setting up test environment...');

    // Reset database to clean state
    await setupTestDatabase();
    console.log('Test database reset complete');

    // We still need a testing module for dependency overrides and database connection
    testingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CACHE_MANAGER)
      .useValue(getCacheManager())
      // Add any other overrides you need
      .compile();

    console.log('Test module compiled');

    // Initialize and sync database
    try {
      const dataSource = testingModule.get<DataSource>(DataSource);

      if (!dataSource.isInitialized) {
        console.log('Initializing database connection...');
        await dataSource.initialize();
      }

      console.log('Dropping and recreating database schema...');
      await dataSource.synchronize(true);
      console.log('Database schema synchronized successfully');
      isInitialized = true;
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  // Return null or something else if needed
  return null;
};

export const teardownTestApp = async () => {
  if (testingModule) {
    console.log('Closing test environment...');

    try {
      // Close database connections
      const dataSource = testingModule.get<DataSource>(DataSource);
      if (dataSource && dataSource.isInitialized) {
        await dataSource.destroy();
      }

      // Close any other services that need explicit cleanup
      // For example, if there's a Redis connection:
      try {
        const redisService = testingModule.get('REDIS_CLIENT');
        if (redisService && typeof redisService.quit === 'function') {
          await redisService.quit();
        }
      } catch (error) {
        // Redis service might not be available, ignore
      }

      await testingModule.close();
      testingModule = null;
      isInitialized = false;
      console.log('Test environment closed');
    } catch (error) {
      console.error('Error during teardown:', error);
    }
  }
};

export const getTestingModule = () => testingModule;
