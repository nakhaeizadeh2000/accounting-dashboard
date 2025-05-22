import { DatabaseInitializerService } from './database-initializer.service';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import * as path from 'path';

export class TestEnvironmentService {
  private static instance: TestEnvironmentService;
  private databaseInitializer: DatabaseInitializerService;
  private isInitialized = false;

  private constructor() {
    // Load environment variables
    config({ path: path.join(process.cwd(), '.env') });

    // Force test environment settings
    process.env.NODE_ENV = 'test';
    process.env.POSTGRES_DB = 'test_db';

    this.validateEnvironment();
    this.databaseInitializer = new DatabaseInitializerService();
  }

  public static getInstance(): TestEnvironmentService {
    if (!TestEnvironmentService.instance) {
      TestEnvironmentService.instance = new TestEnvironmentService();
    }
    return TestEnvironmentService.instance;
  }

  /**
   * Validates the test environment settings
   */
  private validateEnvironment(): void {
    console.log('📊 Test environment configuration:');
    console.log(`  NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`  POSTGRES_DB: ${process.env.POSTGRES_DB}`);
    console.log(`  POSTGRES_HOST: ${process.env.POSTGRES_HOST || 'localhost'}`);

    // Prevent accidental production database usage
    if (
      process.env.POSTGRES_DB.includes('prod') ||
      process.env.POSTGRES_DB.includes('production')
    ) {
      console.error(
        '❌ CRITICAL ERROR: Attempting to run tests on what appears to be a production database!',
      );
      console.error(
        `Database name "${process.env.POSTGRES_DB}" contains "prod" or "production"`,
      );
      process.exit(1);
    }
  }

  /**
   * Initialize the test environment
   */
  async initializeEnvironment(): Promise<void> {
    if (this.isInitialized) {
      console.log('Test environment already initialized');
      return;
    }

    console.log('🚀 Initializing test environment...');

    try {
      // Ensure test database exists and has correct extensions
      await this.databaseInitializer.createTestDatabase();

      this.isInitialized = true;
      console.log('✅ Test environment initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize test environment:', error);
      throw error;
    }
  }

  /**
   * Reset the test environment between test runs
   */
  async resetEnvironment(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Cannot reset environment before initialization');
    }

    try {
      // Reset database to clean state
      await this.databaseInitializer.resetTestDatabase();
      console.log('✅ Test environment reset successfully');
    } catch (error) {
      console.error('❌ Failed to reset test environment:', error);
      throw error;
    }
  }

  /**
   * Clean up resources after tests complete
   */
  async teardownEnvironment(): Promise<void> {
    if (!this.isInitialized) {
      console.log('Test environment was not initialized, nothing to clean up');
      return;
    }

    console.log('🧹 Cleaning up test environment...');

    // Additional cleanup could be added here

    this.isInitialized = false;
    console.log('✅ Test environment cleaned up successfully');
  }
}
