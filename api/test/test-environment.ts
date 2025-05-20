import { config } from 'dotenv';
import { join } from 'path';
import { Client } from 'pg';

// Load environment variables from .env file
console.log('🔧 Setting up test environment...');
config({ path: join(process.cwd(), '.env') });

// CRITICAL: Force test environment settings to prevent accidental production DB use
process.env.NODE_ENV = 'test';
process.env.POSTGRES_DB = 'test_db';

// Log environment configuration for verification
console.log('📊 Test environment configuration:');
console.log(`  NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`  POSTGRES_DB: ${process.env.POSTGRES_DB}`);
console.log(`  POSTGRES_HOST: ${process.env.POSTGRES_HOST || 'localhost'}`);
console.log(`  POSTGRES_PORT: ${process.env.POSTGRES_PORT || '5432'}`);
console.log(
  `  POSTGRES_USER: ${process.env.POSTGRES_USER || '(default user)'}`,
);

// Verify we aren't using production database
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
  process.exit(1); // Emergency exit to prevent damage
}

/**
 * Sets up a clean test database for running tests.
 * This function will:
 * 1. Drop the test_db if it exists
 * 2. Create a fresh test_db
 * 3. Set up necessary extensions
 */
export async function setupTestDatabase() {
  console.log('🔄 Setting up test database...');

  // Connect to postgres database (not the test_db) to manage the test database
  const pgClient = new Client({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT) || 5432,
    user: process.env.POSTGRES_USER || 'develop',
    password: process.env.POSTGRES_PASSWORD || '123456',
    database: 'postgres', // Default postgres database for administrative tasks
  });

  try {
    await pgClient.connect();
    console.log('✅ Connected to PostgreSQL server');

    // Terminate all connections to test_db to allow dropping
    try {
      console.log('🔄 Terminating existing connections to test_db...');
      await pgClient.query(`
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = 'test_db'
        AND pid <> pg_backend_pid();
      `);
      console.log('✅ Existing connections terminated');
    } catch (error) {
      console.warn('⚠️ Could not terminate connections:', error.message);
    }

    // Drop test_db if it exists
    try {
      console.log('🔄 Dropping existing test_db database...');
      await pgClient.query('DROP DATABASE IF EXISTS test_db');
      console.log('✅ Existing test_db database dropped');
    } catch (error) {
      console.warn('⚠️ Could not drop test_db:', error.message);
    }

    // Create fresh test_db
    try {
      console.log('🔄 Creating new test_db database...');
      await pgClient.query('CREATE DATABASE test_db');
      console.log('✅ Fresh test_db database created');
    } catch (error) {
      console.error('❌ Failed to create test_db:', error.message);
      throw new Error(`Could not create test database: ${error.message}`);
    }

    // Connect to the new test_db to setup extensions
    console.log('🔄 Connecting to test_db to set up extensions...');
    const testDbClient = new Client({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT) || 5432,
      user: process.env.POSTGRES_USER || 'develop',
      password: process.env.POSTGRES_PASSWORD || '123456',
      database: 'test_db', // Now connect to our new test database
    });

    try {
      await testDbClient.connect();
      console.log('✅ Connected to test_db');

      // Setup necessary extensions
      console.log('🔄 Setting up extensions in test_db...');
      await testDbClient.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
      console.log('✅ Extensions setup complete');
    } catch (error) {
      console.error('❌ Failed to set up test_db extensions:', error.message);
      throw error;
    } finally {
      // Always close the test_db connection
      await testDbClient.end();
      console.log('🔌 Closed connection to test_db');
    }

    console.log('🎉 Test database setup successfully completed');
  } catch (error) {
    console.error('❌ Test database setup failed:', error);
    throw error;
  } finally {
    // Always close the postgres connection
    await pgClient.end();
    console.log('🔌 Closed connection to PostgreSQL server');
  }
}

/**
 * Function to validate database connection is using test_db
 * This can be called before tests to ensure we're not using production
 */
export async function validateTestDatabaseConnection(dataSource: any) {
  if (!dataSource) {
    console.error('❌ No data source provided for validation');
    return false;
  }

  const dbName = dataSource.options?.database;

  if (dbName !== 'test_db') {
    console.error('❌ CRITICAL ERROR: Tests are not using test_db!');
    console.error(`Current database: ${dbName}`);
    console.error(
      'Tests must use test_db to prevent corrupting production data',
    );
    return false;
  }

  console.log(`✅ Verified using test database: ${dbName}`);
  return true;
}

// If this file is executed directly, set up the test database
if (require.main === module) {
  setupTestDatabase()
    .then(() => {
      console.log('✅ Test database setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test database setup failed:', error);
      process.exit(1);
    });
}
