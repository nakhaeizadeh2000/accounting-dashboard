import { ProcessExitHandler } from './process-exit-handler';

/**
 * Standalone script to clean up all test schemas
 * Can be run manually or as part of the test process
 */
async function cleanupAllSchemas() {
  console.log('🧹 Running final cleanup of all test schemas...');

  try {
    await ProcessExitHandler.cleanupTestSchemas();
    console.log('✅ Final cleanup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Final cleanup failed:', error);
    process.exit(1);
  }
}

// Run the cleanup if this file is executed directly
if (require.main === module) {
  cleanupAllSchemas();
}

export { cleanupAllSchemas };
