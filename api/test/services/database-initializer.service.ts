import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

export class DatabaseInitializerService {
  private connectionConfig = {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT) || 5432,
    user: process.env.POSTGRES_USER || 'develop',
    password: process.env.POSTGRES_PASSWORD || '123456',
  };

  /**
   * Creates the test database if it doesn't exist
   */
  async createTestDatabase(): Promise<void> {
    console.log('🔄 Setting up test database...');

    // Connect to postgres database (not the test_db) to manage the test database
    const pgClient = new Client({
      ...this.connectionConfig,
      database: 'postgres', // Default postgres database for administrative tasks
    });

    try {
      await pgClient.connect();
      console.log('✅ Connected to PostgreSQL server');

      // Check if test_db exists
      const dbCheckResult = await pgClient.query(
        "SELECT 1 FROM pg_database WHERE datname = 'test_db'",
      );

      if (dbCheckResult.rows.length === 0) {
        // Database doesn't exist, create it
        console.log('🔄 Creating new test_db database...');
        await pgClient.query('CREATE DATABASE test_db');
        console.log('✅ Fresh test_db database created');
      } else {
        console.log('✅ test_db database already exists');
      }

      // Set up extensions in the test database
      await this.setupDatabaseExtensions();
    } catch (error) {
      console.error('❌ Database setup failed:', error);
      throw error;
    } finally {
      await pgClient.end();
    }
  }

  /**
   * Sets up necessary PostgreSQL extensions for the test database
   */
  private async setupDatabaseExtensions(): Promise<void> {
    const testDbClient = new Client({
      ...this.connectionConfig,
      database: 'test_db',
    });

    try {
      await testDbClient.connect();

      // Create essential extensions
      await testDbClient.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

      // Additional extensions can be added here as needed
      // await testDbClient.query('CREATE EXTENSION IF NOT EXISTS "pg_trgm"');

      console.log('✅ Database extensions configured');
    } catch (error) {
      console.error('❌ Failed to set up extensions:', error);
      throw error;
    } finally {
      await testDbClient.end();
    }
  }

  /**
   * Completely resets the test database (drop all tables and recreate schema)
   */
  async resetTestDatabase(): Promise<void> {
    const testDbClient = new Client({
      ...this.connectionConfig,
      database: 'test_db',
    });

    try {
      await testDbClient.connect();

      // Drop all tables (safer than dropping the database)
      await testDbClient.query(`
        DO $$ DECLARE
          r RECORD;
        BEGIN
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
            EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
          END LOOP;
        END $$;
      `);

      console.log('✅ All tables dropped successfully');
    } catch (error) {
      console.error('❌ Failed to reset database:', error);
      throw error;
    } finally {
      await testDbClient.end();
    }
  }

  /**
   * Execute schema migrations or seed scripts if needed
   */
  async runMigrations(seedData: boolean = false): Promise<void> {
    // Implement if you need specific migration logic
    // For now, TypeORM's synchronize: true will handle schema creation

    if (seedData) {
      // You could run seed scripts here
      console.log('🌱 Seeding test database...');
    }
  }
}
