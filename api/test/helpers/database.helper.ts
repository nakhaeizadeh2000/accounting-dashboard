import { Repository, DataSource } from 'typeorm';
import { User } from '../../src/modules/users/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import * as fixtures from '../fixtures';

/**
 * Helper for database operations in tests with schema isolation
 */
export class DatabaseTestHelper {
  private dataSource: DataSource;
  private userRepository: Repository<User>;
  private initialized = false;
  private schemaName: string;

  /**
   * Initialize the database helper with a specific schema
   * @param dataSource The TypeORM DataSource
   * @param schemaName The schema name to use
   */
  async init(dataSource: DataSource, schemaName: string): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.dataSource = dataSource;
    this.schemaName = schemaName;

    if (!this.dataSource || !this.dataSource.isInitialized) {
      throw new Error('DataSource not initialized in test environment');
    }

    // Set search path for this connection
    await this.dataSource.query(
      `SET search_path TO "${this.schemaName}",public`,
    );

    // Initialize repositories
    this.userRepository = this.dataSource.getRepository(User);

    // Create tables if they don't exist
    await this.ensureTablesExist();

    this.initialized = true;

    // Seed initial test data
    await this.seedTestData();
  }

  /**
   * Ensure all tables exist in the schema
   */
  private async ensureTablesExist(): Promise<void> {
    try {
      // Check if users table exists
      const tableExists = await this.dataSource.query(
        `
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = $1
        AND table_name = 'users'
      `,
        [this.schemaName],
      );

      if (tableExists.length === 0) {
        console.log(`Creating tables in schema ${this.schemaName}`);

        // Create tables based on entities
        await this.dataSource.synchronize();

        console.log('✅ Tables created successfully');
      } else {
        console.log('✅ Tables already exist');
      }
    } catch (error) {
      console.error('❌ Failed to create tables:', error);
      throw error;
    }
  }

  /**
   * Reset the database between tests
   */
  async resetDatabase(): Promise<void> {
    if (!this.initialized) {
      throw new Error('DatabaseTestHelper not initialized. Call init() first.');
    }

    try {
      console.log(`🧹 Resetting database state for schema: ${this.schemaName}`);

      // Ensure we're using the correct schema
      await this.dataSource.query(
        `SET search_path TO "${this.schemaName}",public`,
      );

      // Get all tables in the schema
      const tables = await this.dataSource.query(
        `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = $1
        AND table_type = 'BASE TABLE'
      `,
        [this.schemaName],
      );

      if (tables.length > 0) {
        // Disable triggers temporarily
        await this.dataSource.query('SET session_replication_role = replica');

        // Truncate each table
        for (const table of tables) {
          await this.dataSource.query(
            `TRUNCATE TABLE "${this.schemaName}"."${table.table_name}" CASCADE`,
          );
        }

        // Re-enable triggers
        await this.dataSource.query('SET session_replication_role = DEFAULT');
      }

      // Re-seed with fresh test data
      await this.seedTestData();

      console.log('✅ Database reset completed');
    } catch (error) {
      console.error('❌ Database reset failed:', error);
      throw error;
    }
  }

  /**
   * Seed test data
   */
  async seedTestData(): Promise<void> {
    try {
      // Create test users - just what's needed for the test
      const adminUser = fixtures.users[0];
      const regularUser = fixtures.users[1];

      // Ensure we're using the correct schema
      await this.dataSource.query(
        `SET search_path TO "${this.schemaName}",public`,
      );

      // Save users
      await this.userRepository.save([
        this.userRepository.create(adminUser),
        this.userRepository.create(regularUser),
      ]);

      console.log('✅ Test data seeded');
    } catch (error) {
      console.error('❌ Seeding test data failed:', error);
      throw error;
    }
  }

  /**
   * Create a user with custom properties
   * @param userData Partial user data to override defaults
   * @returns The created user
   */
  async createUser(userData: Partial<User>): Promise<User> {
    if (!this.initialized) {
      throw new Error('DatabaseTestHelper not initialized. Call init() first.');
    }

    const defaultData = {
      email: `test@example.com`,
      password: bcrypt.hashSync('Password123!', 10),
      firstName: 'Test',
      lastName: 'User',
      isAdmin: false,
    };

    // Ensure we're using the correct schema
    await this.dataSource.query(
      `SET search_path TO "${this.schemaName}",public`,
    );

    const user = this.userRepository.create({ ...defaultData, ...userData });
    return this.userRepository.save(user);
  }

  /**
   * Create multiple users with sequential emails
   * @param count Number of users to create
   * @param baseProps Base properties to apply to all users
   * @returns Array of created users
   */
  async createUsers(
    count: number,
    baseProps: Partial<User> = {},
  ): Promise<User[]> {
    if (!this.initialized) {
      throw new Error('DatabaseTestHelper not initialized. Call init() first.');
    }

    // Ensure we're using the correct schema
    await this.dataSource.query(
      `SET search_path TO "${this.schemaName}",public`,
    );

    const users = [];
    for (let i = 0; i < count; i++) {
      const userData = {
        email: `test.user${i}@example.com`,
        password: bcrypt.hashSync('Password123!', 10),
        firstName: `Test${i}`,
        lastName: 'User',
        isAdmin: false,
        ...baseProps,
      };

      const user = this.userRepository.create(userData);
      users.push(user);
    }

    return this.userRepository.save(users);
  }

  /**
   * Find a user by email
   * @param email The email to search for
   * @returns The found user or null
   */
  async findUserByEmail(email: string): Promise<User | null> {
    if (!this.initialized) {
      throw new Error('DatabaseTestHelper not initialized. Call init() first.');
    }

    // Ensure we're using the correct schema
    await this.dataSource.query(
      `SET search_path TO "${this.schemaName}",public`,
    );

    return this.userRepository.findOne({ where: { email } });
  }

  /**
   * Get the user repository
   * @returns The User repository
   */
  getUserRepository(): Repository<User> {
    if (!this.initialized) {
      throw new Error('DatabaseTestHelper not initialized. Call init() first.');
    }
    return this.userRepository;
  }

  /**
   * Get the schema name
   * @returns The schema name
   */
  getSchemaName(): string {
    return this.schemaName;
  }

  /**
   * Execute a raw SQL query with the correct schema
   * @param query The SQL query to execute
   * @param parameters Query parameters
   * @returns Query result
   */
  async executeQuery(query: string, parameters: any[] = []): Promise<any> {
    if (!this.initialized) {
      throw new Error('DatabaseTestHelper not initialized. Call init() first.');
    }

    // Ensure we're using the correct schema
    await this.dataSource.query(
      `SET search_path TO "${this.schemaName}",public`,
    );

    return this.dataSource.query(query, parameters);
  }

  /**
   * Get the DataSource
   * @returns The TypeORM DataSource
   */
  getDataSource(): DataSource {
    if (!this.initialized) {
      throw new Error('DatabaseTestHelper not initialized. Call init() first.');
    }
    return this.dataSource;
  }
}
