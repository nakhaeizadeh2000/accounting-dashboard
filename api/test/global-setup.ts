import { TestContainers } from './containers/test-containers';
import { DatabaseInitializerService } from './services/database-initializer.service';

/**
 * Global setup function for Jest
 * This runs once before all tests start
 */
module.exports = async function globalSetup() {
  console.log('🚀 Global test setup starting...');

  try {
    // Ensure test database exists
    const dbInitializer = new DatabaseInitializerService();
    await dbInitializer.createTestDatabase();

    // Initialize Redis connection settings
    await TestContainers.initialize();
    console.log('✅ Global test setup completed successfully');
  } catch (error) {
    console.error('❌ Global test setup failed:', error);
    // Exit with error code to fail the test run
    process.exit(1);
  }
};
