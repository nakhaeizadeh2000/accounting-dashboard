import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DataSource } from 'typeorm';
import { TestRequest } from '../helpers/request.helper';
import { DatabaseTestHelper } from '../helpers/database.helper';
import { AuthTestHelper } from '../helpers/auth-test.helper';
import { cacheManagerMockInstance } from '../mocks/cache-manager.mock';
import {
  setupTestApp,
  teardownTestApp,
  getTestDataSource,
} from '../setup-tests';

/**
 * TestContext class to manage the lifecycle of test resources
 */
export class TestContext {
  public app: NestFastifyApplication;
  public dataSource: DataSource;
  public request: TestRequest;
  public dbHelper: DatabaseTestHelper;
  public authHelper: AuthTestHelper;
  public isInitialized = false;

  /**
   * Create a new TestContext instance
   */
  constructor() {
    // Initialize helpers
    this.request = new TestRequest();
    this.dbHelper = new DatabaseTestHelper();
  }

  /**
   * Initialize the test context
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('Test context already initialized');
      return;
    }

    console.log('🚀 Initializing test context...');

    try {
      // Initialize the test app using the existing setup function
      this.app = await setupTestApp();

      // Get the data source
      this.dataSource = getTestDataSource();

      // Set up helpers
      this.request.setApp(this.app);
      await this.dbHelper.init();

      // Create auth helper
      this.authHelper = new AuthTestHelper(this.request, this.dbHelper);

      this.isInitialized = true;
      console.log('✅ Test context initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize test context:', error);
      await this.cleanup();
      throw error;
    }
  }

  /**
   * Reset the test context between tests
   */
  public async reset(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Cannot reset uninitialized test context');
    }

    console.log('🔄 Resetting test context...');

    try {
      // Reset database
      await this.dbHelper.resetDatabase();

      // Reset cache mock
      if (
        cacheManagerMockInstance &&
        typeof cacheManagerMockInstance._reset === 'function'
      ) {
        cacheManagerMockInstance._reset();
      }

      // Reset request helper
      this.request.clearCookies();
      this.request.clearHeaders();

      console.log('✅ Test context reset successfully');
    } catch (error) {
      console.error('❌ Failed to reset test context:', error);
      throw error;
    }
  }

  /**
   * Clean up all test resources
   */
  public async cleanup(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    console.log('🧹 Cleaning up test context...');

    try {
      // Reset cache mock
      if (
        cacheManagerMockInstance &&
        typeof cacheManagerMockInstance._reset === 'function'
      ) {
        cacheManagerMockInstance._reset();
      }

      // Use the existing teardown function
      await teardownTestApp();

      this.isInitialized = false;
      console.log('✅ Test context cleaned up successfully');
    } catch (error) {
      console.error('❌ Error during test context cleanup:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Register a new user and log them in
   * @param userData User data for registration
   * @returns The login response
   */
  public async registerAndLogin(userData: any): Promise<any> {
    return this.authHelper.registerAndLogin(userData);
  }

  /**
   * Get the DataSource
   */
  public getDataSource(): DataSource {
    if (!this.isInitialized) {
      throw new Error('Test context not initialized');
    }
    return this.dataSource;
  }
}
