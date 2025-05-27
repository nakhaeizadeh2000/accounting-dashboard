import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DataSource } from 'typeorm';
import { TestingModule } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseTestHelper } from '../helpers/database.helper';
import { TestRequest } from '../helpers/request.helper';
import { AuthTestHelper } from '../helpers/auth-test.helper';
import {
  createIsolatedTestApp,
  releasePort,
  getTestBaseUrl,
} from '../setup-tests';
import { DatabaseInitializerService } from '../services/database-initializer.service';
import { AddressInfo } from 'net';
import { RedisCleanupHelper } from '../helpers/redis-cleanup.helper';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

/**
 * TestContext provides an isolated context for each test suite
 * This encapsulates all test resources and ensures proper cleanup
 */
export class TestContext {
  private app: NestFastifyApplication;
  private dataSource: DataSource;
  private testingModule: TestingModule;
  private schemaName: string;
  private isInitialized = false;
  private port: number;
  private redisDbNumber: number;

  // Test helpers
  public dbHelper: DatabaseTestHelper;
  public request: TestRequest;
  public authHelper: AuthTestHelper;

  constructor() {
    // Generate a unique schema name for this test context
    this.schemaName = `test_${uuidv4().replace(/-/g, '_').substring(0, 10)}`;

    // Initialize helpers
    this.request = new TestRequest();
    this.dbHelper = new DatabaseTestHelper();
  }

  /**
   * Initialize the test context with all required resources
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('Test context already initialized, reusing instance');
      return;
    }

    console.log(`🚀 Initializing test context with schema: ${this.schemaName}`);

    try {
      // Create app and resources with isolated schema
      const { app, dataSource, testingModule, redisDbNumber } = await createIsolatedTestApp(
        this.schemaName,
      );

      this.app = app;
      this.dataSource = dataSource;
      this.testingModule = testingModule;
      this.redisDbNumber = redisDbNumber;

      // Get the port from the app
      const address = this.app.getHttpServer().address();

      // Handle both string and AddressInfo types
      if (typeof address === 'string') {
        // Parse the port from the string address (e.g., "localhost:4001")
        const match = address.match(/:(\d+)$/);
        if (match && match[1]) {
          this.port = parseInt(match[1], 10);
        } else {
          throw new Error(`Could not determine port from address: ${address}`);
        }
      } else if (address) {
        // It's an AddressInfo object
        this.port = address.port;
      } else {
        throw new Error('Could not get server address');
      }

      // Initialize helpers
      this.request.setApp(this.app);

      // Initialize database helper with the dataSource and schema
      await this.dbHelper.init(this.dataSource, this.schemaName);

      // Initialize auth helper
      this.authHelper = new AuthTestHelper(this.request, this.dbHelper);

      // Make Redis client resilient
      try {
        const cacheManager = this.testingModule.get(CACHE_MANAGER);
        if (cacheManager && cacheManager.store && cacheManager.store.client) {
          RedisCleanupHelper.makeResilient(cacheManager.store.client);
        }
      } catch (redisError) {
        console.log(
          'Non-critical Redis setup error (ignored):',
          redisError.message,
        );
      }

      this.isInitialized = true;
      console.log(
        `✅ Test context initialized with schema: ${this.schemaName} on port ${this.port}`,
      );
    } catch (error) {
      console.error('❌ Failed to initialize test context:', error);
      await this.cleanup();
      throw error;
    }
  }

  /**
   * Reset the database state between tests
   */
  async reset(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('TestContext not initialized. Call initialize() first.');
    }

    console.log(`🔄 Resetting database state for schema: ${this.schemaName}`);

    try {
      // Reset database state
      await this.dbHelper.resetDatabase();

      // Reset request cookies and headers
      this.request.clearCookies();
      this.request.clearHeaders();

      console.log('✅ Test context reset completed');
    } catch (error) {
      console.error('❌ Failed to reset test context:', error);
      throw error;
    }
  }

  /**
   * Flush only the current Redis database for this test context
   */
  async flushRedis(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('TestContext not initialized. Call initialize() first.');
    }

    try {
      const cacheManager = this.testingModule.get(CACHE_MANAGER);
      if (cacheManager && cacheManager.store && cacheManager.store.client) {
        await RedisCleanupHelper.flushCurrentDatabase(cacheManager.store.client, this.redisDbNumber);
      }
    } catch (error) {
      console.log('⚠️ Redis flush error (ignored):', error.message);
    }
  }

  /**
   * Test Redis connection and create test data for verification
   */
  async testRedis(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('TestContext not initialized. Call initialize() first.');
    }

    try {
      const cacheManager = this.testingModule.get(CACHE_MANAGER);
      console.log('🔍 Cache manager type:', cacheManager?.constructor?.name);
      console.log('🔍 Cache manager store:', cacheManager?.store?.constructor?.name);
      console.log('🔍 Cache manager client exists:', !!cacheManager?.store?.client);
      
      if (cacheManager && cacheManager.store && cacheManager.store.client) {
        await RedisCleanupHelper.testRedisConnection(cacheManager.store.client, this.redisDbNumber);
      } else {
        console.log('❌ No Redis client found in cache manager');
      }
    } catch (error) {
      console.log('⚠️ Redis test error (ignored):', error.message);
    }
  }

  /**
   * Flush all Redis databases (0-15) - use with caution in parallel tests
   */
  async flushAllRedis(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('TestContext not initialized. Call initialize() first.');
    }

    try {
      const cacheManager = this.testingModule.get(CACHE_MANAGER);
      if (cacheManager && cacheManager.store && cacheManager.store.client) {
        await RedisCleanupHelper.flushAllDatabases(cacheManager.store.client);
      }
    } catch (error) {
      console.log('⚠️ Redis flush error (ignored):', error.message);
    }
  }

  /**
   * Clean up all resources used by this test context
   */
  async cleanup(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    console.log(`🧹 Cleaning up test context with schema: ${this.schemaName}`);

    try {
      // First, try to safely disconnect Redis
      if (this.testingModule) {
        try {
          const cacheManager = this.testingModule.get(CACHE_MANAGER);
          if (cacheManager && cacheManager.store && cacheManager.store.client) {
            // Just log that we're cleaning up Redis, but don't actually try to disconnect
            // This prevents the "client is closed" error
            console.log(
              'Skipping Redis client disconnect to prevent socket errors',
            );
          }
        } catch (redisError) {
          console.log(
            'Non-critical Redis cleanup error (ignored):',
            redisError.message,
          );
        }
      }

      // Wait a moment to allow Redis connections to close naturally
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Close app if it exists
      if (this.app) {
        try {
          await this.app.close();
        } catch (appError) {
          console.error(
            'Error closing app (continuing cleanup):',
            appError.message,
          );
        }
      }

      // Release the port
      if (this.port) {
        releasePort(this.port);
      }

      // Drop schema if dataSource exists
      if (this.dataSource && this.dataSource.isInitialized) {
        try {
          // Use DatabaseInitializerService to properly drop the schema
          const dbInitializer = new DatabaseInitializerService();
          await dbInitializer.dropSchema(this.schemaName);
          console.log(`✅ Schema ${this.schemaName} dropped successfully`);
        } catch (schemaError) {
          console.error(
            `❌ Failed to drop schema ${this.schemaName}:`,
            schemaError,
          );
        }

        // Close the DataSource
        try {
          await this.dataSource.destroy();
        } catch (dsError) {
          console.error(
            'Error closing DataSource (continuing cleanup):',
            dsError.message,
          );
        }
      }

      this.isInitialized = false;
      console.log('✅ Test context cleaned up successfully');
    } catch (error) {
      console.error('❌ Error during test context cleanup:', error);
      // Mark as not initialized even if cleanup fails
      this.isInitialized = false;
    }
  }

  /**
   * Get the schema name for this test context
   */
  getSchemaName(): string {
    return this.schemaName;
  }

  /**
   * Get the port for this test context
   */
  getPort(): number {
    if (!this.isInitialized) {
      throw new Error('TestContext not initialized. Call initialize() first.');
    }
    return this.port;
  }

  /**
   * Get the base URL for API requests
   */
  getBaseUrl(): string {
    if (!this.isInitialized) {
      throw new Error('TestContext not initialized. Call initialize() first.');
    }
    return getTestBaseUrl(this.port);
  }

  /**
   * Get the NestFastifyApplication instance
   */
  getApp(): NestFastifyApplication {
    if (!this.isInitialized) {
      throw new Error('TestContext not initialized. Call initialize() first.');
    }
    return this.app;
  }

  /**
   * Get the DataSource instance
   */
  getDataSource(): DataSource {
    if (!this.isInitialized) {
      throw new Error('TestContext not initialized. Call initialize() first.');
    }
    return this.dataSource;
  }

  /**
   * Get the TestingModule instance
   */
  getTestingModule(): TestingModule {
    if (!this.isInitialized) {
      throw new Error('TestContext not initialized. Call initialize() first.');
    }
    return this.testingModule;
  }

  /**
   * Register and login a user in one step
   * @param userData User data for registration
   * @returns Login response
   */
  async registerAndLogin(userData: any): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('TestContext not initialized. Call initialize() first.');
    }
    return this.authHelper.registerAndLogin(userData);
  }
}
