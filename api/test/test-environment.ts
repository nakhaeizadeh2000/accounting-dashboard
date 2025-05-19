import { config } from 'dotenv';
import { join } from 'path';
import { Client } from 'pg';

// Load environment variables
config({ path: join(process.cwd(), '.env') });

// Setup test database
export async function setupTestDatabase() {
  const client = new Client({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT) || 5432,
    user: process.env.POSTGRES_USER || 'develop',
    password: process.env.POSTGRES_PASSWORD || '123456',
    database: 'postgres', // Connect to default postgres database
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL server');

    // Drop test_db if it exists (FORCE CLEAN START)
    try {
      // Terminate all connections to the database
      await client.query(`
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = 'test_db'
        AND pid <> pg_backend_pid();
      `);

      // Drop the database
      await client.query('DROP DATABASE IF EXISTS test_db');
      console.log('Dropped existing test_db database');
    } catch (error) {
      console.log(
        'Could not drop database (it might not exist yet):',
        error.message,
      );
    }

    // Create a fresh test_db
    await client.query('CREATE DATABASE test_db');
    console.log('Created fresh test_db database');

    // Enable UUID extension in the new database
    const testDbClient = new Client({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT) || 5432,
      user: process.env.POSTGRES_USER || 'develop',
      password: process.env.POSTGRES_PASSWORD || '123456',
      database: 'test_db',
    });

    await testDbClient.connect();
    await testDbClient.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    console.log('Enabled uuid-ossp extension');
    await testDbClient.end();
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.POSTGRES_DB = 'test_db';

// Only run setup if called directly
if (require.main === module) {
  setupTestDatabase()
    .then(() => {
      console.log('Test database setup complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test database setup failed:', error);
      process.exit(1);
    });
}
