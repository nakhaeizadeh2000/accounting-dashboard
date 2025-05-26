import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

/**
 * Cleanup handler for process exit
 * This ensures all test schemas are cleaned up even if tests crash
 */
export class ProcessExitHandler {
  private static isRegistered = false;

  /**
   * Register handlers for process exit
   */
  static register(): void {
    if (this.isRegistered) {
      return;
    }

    // Handle normal exit
    process.on('exit', () => {
      console.log('Process exiting, cleaning up test schemas...');
      // We can't use async functions in 'exit' handler, so we just log
    });

    // Handle CTRL+C
    process.on('SIGINT', () => {
      console.log('\n🧹 Cleaning up test schemas before exit...');
      this.cleanupTestSchemas()
        .then(() => process.exit(0))
        .catch((err) => {
          console.error('❌ Error during cleanup:', err);
          process.exit(1);
        });
    });

    // Handle SIGTERM (kill command)
    process.on('SIGTERM', () => {
      console.log('\n🧹 Cleaning up test schemas before termination...');
      this.cleanupTestSchemas()
        .then(() => process.exit(0))
        .catch((err) => {
          console.error('❌ Error during cleanup:', err);
          process.exit(1);
        });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('❌ Uncaught exception:', err);
      console.log('🧹 Cleaning up test schemas...');
      this.cleanupTestSchemas()
        .then(() => process.exit(1))
        .catch(() => process.exit(1));
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled promise rejection:', reason);
      console.log('🧹 Cleaning up test schemas...');
      this.cleanupTestSchemas()
        .then(() => process.exit(1))
        .catch(() => process.exit(1));
    });

    this.isRegistered = true;
    console.log('✅ Process exit handlers registered for test cleanup');
  }

  /**
   * Clean up all test schemas
   */
  static async cleanupTestSchemas(): Promise<void> {
    const connectionConfig = {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT) || 5432,
      user: process.env.POSTGRES_USER || 'develop',
      password: process.env.POSTGRES_PASSWORD || '123456',
      database:
        process.env.NODE_ENV === 'test' ? 'test_db' : process.env.POSTGRES_DB,
    };

    const client = new Client(connectionConfig);

    try {
      await client.connect();
      console.log('Connected to database for cleanup');

      // Find all test schemas
      const result = await client.query(`
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name LIKE 'test_%'
      `);

      if (result.rows.length > 0) {
        console.log(`Found ${result.rows.length} test schemas to clean up`);

        // Drop each test schema
        for (const row of result.rows) {
          const schemaName = row.schema_name;
          console.log(`Dropping schema: ${schemaName}`);

          try {
            // First terminate all connections to this schema
            await client.query(`
              SELECT pg_terminate_backend(pid)
              FROM pg_stat_activity
              WHERE datname = current_database()
              AND pid <> pg_backend_pid()
              AND (
                query LIKE '%${schemaName}.%'
                OR query LIKE '%SET search_path TO ${schemaName}%'
              )
            `);

            // Then drop the schema
            await client.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
            console.log(`✅ Schema ${schemaName} dropped successfully`);
          } catch (schemaError) {
            console.error(`Error dropping schema ${schemaName}:`, schemaError);
          }
        }

        console.log('✅ All test schemas cleaned up');
      } else {
        console.log('No test schemas found to clean up');
      }
    } catch (error) {
      console.error('❌ Failed to clean up test schemas:', error);
      throw error;
    } finally {
      try {
        await client.end();
        console.log('Database connection closed');
      } catch (err) {
        // Ignore errors during disconnect
        console.error('Error closing database connection:', err);
      }
    }
  }

  /**
   * Clean up a specific test schema
   * @param schemaName The name of the schema to clean up
   */
  static async cleanupSchema(schemaName: string): Promise<void> {
    if (!schemaName.startsWith('test_')) {
      throw new Error(
        `Invalid test schema name: ${schemaName}. Must start with 'test_'`,
      );
    }

    const connectionConfig = {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT) || 5432,
      user: process.env.POSTGRES_USER || 'develop',
      password: process.env.POSTGRES_PASSWORD || '123456',
      database:
        process.env.NODE_ENV === 'test' ? 'test_db' : process.env.POSTGRES_DB,
    };

    const client = new Client(connectionConfig);

    try {
      await client.connect();

      // Check if schema exists
      const checkResult = await client.query(
        `
        SELECT 1
        FROM information_schema.schemata
        WHERE schema_name = $1
      `,
        [schemaName],
      );

      if (checkResult.rows.length > 0) {
        console.log(`Dropping schema: ${schemaName}`);
        await client.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
        console.log(`✅ Schema ${schemaName} dropped successfully`);
      } else {
        console.log(`Schema ${schemaName} does not exist, nothing to clean up`);
      }
    } catch (error) {
      console.error(`❌ Failed to clean up schema ${schemaName}:`, error);
      throw error;
    } finally {
      try {
        await client.end();
      } catch (err) {
        // Ignore errors during disconnect
      }
    }
  }

  /**
   * List all test schemas in the database
   * @returns Array of schema names
   */
  static async listTestSchemas(): Promise<string[]> {
    const connectionConfig = {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT) || 5432,
      user: process.env.POSTGRES_USER || 'develop',
      password: process.env.POSTGRES_PASSWORD || '123456',
      database:
        process.env.NODE_ENV === 'test' ? 'test_db' : process.env.POSTGRES_DB,
    };

    const client = new Client(connectionConfig);

    try {
      await client.connect();

      // Find all test schemas
      const result = await client.query(`
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name LIKE 'test_%'
      `);

      return result.rows.map((row) => row.schema_name);
    } catch (error) {
      console.error('❌ Failed to list test schemas:', error);
      throw error;
    } finally {
      try {
        await client.end();
      } catch (err) {
        // Ignore errors during disconnect
      }
    }
  }
}

// If this file is run directly, clean up all test schemas
if (require.main === module) {
  ProcessExitHandler.cleanupTestSchemas()
    .then(() => {
      console.log('Cleanup completed successfully');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Cleanup failed:', err);
      process.exit(1);
    });
}
