import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';

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
   * Creates a new schema for isolated tests
   * @param schemaName The name of the schema to create
   */
  async createSchema(schemaName: string): Promise<void> {
    const testDbClient = new Client({
      ...this.connectionConfig,
      database: 'test_db',
    });

    try {
      await testDbClient.connect();

      // Create schema if it doesn't exist
      await testDbClient.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);

      // Create extensions in the schema
      await testDbClient.query(
        `CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA ${schemaName}`,
      );

      console.log(`✅ Created isolated schema: ${schemaName}`);
    } catch (error) {
      console.error(`❌ Failed to create schema ${schemaName}:`, error);
      throw error;
    } finally {
      await testDbClient.end();
    }
  }

  /**
   * Drops a schema and all its objects
   * @param schemaName The name of the schema to drop
   */
  async dropSchema(schemaName: string): Promise<void> {
    const testDbClient = new Client({
      ...this.connectionConfig,
      database: 'test_db',
    });

    try {
      await testDbClient.connect();

      // Drop schema with CASCADE to remove all objects in it
      await testDbClient.query(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE`);

      console.log(`✅ Dropped schema: ${schemaName}`);
    } catch (error) {
      console.error(`❌ Failed to drop schema ${schemaName}:`, error);
      throw error;
    } finally {
      await testDbClient.end();
    }
  }

  /**
   * Truncates all tables in a schema
   * @param schemaName The name of the schema to truncate tables in
   */
  async truncateSchema(schemaName: string): Promise<void> {
    const testDbClient = new Client({
      ...this.connectionConfig,
      database: 'test_db',
    });

    try {
      await testDbClient.connect();

      // Get all tables in the schema
      const tablesResult = await testDbClient.query(
        `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = $1
        AND table_type = 'BASE TABLE'
      `,
        [schemaName],
      );

      if (tablesResult.rows.length === 0) {
        console.log(`No tables found in schema ${schemaName}`);
        return;
      }

      // Start a transaction
      await testDbClient.query('BEGIN');

      // Disable triggers temporarily
      await testDbClient.query('SET session_replication_role = replica');

      // Truncate all tables in the schema
      for (const row of tablesResult.rows) {
        const tableName = row.table_name;
        await testDbClient.query(
          `TRUNCATE TABLE ${schemaName}.${tableName} CASCADE`,
        );
      }

      // Re-enable triggers
      await testDbClient.query('SET session_replication_role = DEFAULT');

      // Commit the transaction
      await testDbClient.query('COMMIT');

      console.log(`✅ Truncated all tables in schema: ${schemaName}`);
    } catch (error) {
      // Rollback on error
      try {
        await testDbClient.query('ROLLBACK');
        await testDbClient.query('SET session_replication_role = DEFAULT');
      } catch (rollbackError) {
        console.error('Error during rollback:', rollbackError);
      }

      console.error(`❌ Failed to truncate schema ${schemaName}:`, error);
      throw error;
    } finally {
      await testDbClient.end();
    }
  }

  /**
   * Sets up necessary PostgreSQL extensions for the test database
   */
  private async setupDatabaseExtensions(): Promise<void> {
    // Connect directly to test_db
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
   * Truncates all tables in a schema
   * @param dataSource The TypeORM DataSource to use
   */
  async truncateAllTables(dataSource: DataSource): Promise<void> {
    try {
      // Get all entity metadata
      const entities = dataSource.entityMetadatas;

      // Get table names dynamically
      const tableNames = entities
        .map((entity) => `"${entity.tableName}"`)
        .join(', ');

      if (tableNames.length === 0) {
        console.log('No tables to truncate');
        return;
      }

      // Disable foreign key checks, truncate tables, then re-enable
      await dataSource.query('SET CONSTRAINTS ALL DEFERRED');
      await dataSource.query(
        `TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE`,
      );
      await dataSource.query('SET CONSTRAINTS ALL IMMEDIATE');

      console.log('✅ All tables truncated successfully');
    } catch (error) {
      console.error('❌ Failed to truncate tables:', error);
      throw error;
    }
  }
}
