import { getTestDataSource } from '../setup-tests';
import { Repository, DataSource } from 'typeorm';
import { User } from '../../src/modules/users/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import * as fixtures from '../fixtures';

/**
 * Simplified DatabaseTestHelper without transaction management
 */
export class DatabaseTestHelper {
  private dataSource: DataSource;
  private userRepository: Repository<User>;
  private initialized = false;

  /**
   * Initialize the database helper
   */
  async init() {
    if (this.initialized) {
      return;
    }

    this.dataSource = getTestDataSource();
    if (!this.dataSource || !this.dataSource.isInitialized) {
      throw new Error('DataSource not initialized in test environment');
    }

    // Initialize repositories directly
    this.userRepository = this.dataSource.getRepository(User);
    this.initialized = true;
  }

  /**
   * Reset the database between tests
   */
  async resetDatabase() {
    try {
      console.log('🧹 Resetting database state...');

      // Use TRUNCATE for fast table clearing
      await this.dataSource.query(
        'TRUNCATE TABLE "users" RESTART IDENTITY CASCADE',
      );
      // Add other tables that need clearing

      // Re-seed with fresh test data
      await this.seedTestData();

      console.log('✅ Database reset completed');
      return true;
    } catch (error) {
      console.error('❌ Database reset failed:', error);
      throw error;
    }
  }

  /**
   * Seed test data
   */
  async seedTestData() {
    try {
      // Create test users - just what's needed for the test
      const adminUser = fixtures.users[0];
      const regularUser = fixtures.users[1];

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
  // Keep only the essential methods needed by your tests
  async createUser(userData: Partial<User>): Promise<User> {
    const defaultData = {
      email: `test@example.com`,
      password: bcrypt.hashSync('Password123!', 10),
      firstName: 'Test',
      lastName: 'User',
      isAdmin: false,
    };

    const user = this.userRepository.create({ ...defaultData, ...userData });
    return this.userRepository.save(user);
  }

  getUserRepository(): Repository<User> {
    return this.userRepository;
  }
}
