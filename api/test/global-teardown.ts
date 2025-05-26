import { TestContainers } from './containers/test-containers';

/**
 * Global teardown function for Jest
 * This runs once after all tests complete
 */
module.exports = async function globalTeardown() {
  console.log('🧹 Global test teardown starting...');

  // Clean up resources
  try {
    await TestContainers.cleanup();
    console.log('✅ Global test teardown completed successfully');
  } catch (error) {
    console.error('❌ Global test teardown failed:', error);
  }
};
