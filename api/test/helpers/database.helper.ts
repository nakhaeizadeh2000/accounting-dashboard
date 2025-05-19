import { getTestingModule } from '../setup-tests';
import { DataSource, Repository, QueryRunner } from 'typeorm';
import { User } from '../../src/modules/users/entities/user.entity';
import * as bcrypt from 'bcryptjs';

export class DatabaseTestHelper {
  private dataSource: DataSource;
  private queryRunner: QueryRunner;

  // Repositories
  private userRepository: Repository<User>;

  // Keep track of original repositories
  private originalUserRepository: Repository<User>;

  async init() {
    const testingModule = getTestingModule();
    if (!testingModule) {
      throw new Error(
        'Testing module not initialized. Call setupTestApp first.',
      );
    }

    this.dataSource = testingModule.get<DataSource>(DataSource);
    if (!this.dataSource || !this.dataSource.isInitialized) {
      throw new Error('DataSource not initialized in test environment');
    }

    // Store original repositories
    this.originalUserRepository = this.dataSource.getRepository(User);
    this.userRepository = this.originalUserRepository;
  }

  async startTransaction() {
    // Create a new query runner for this test
    this.queryRunner = this.dataSource.createQueryRunner();

    // Start transaction
    await this.queryRunner.connect();
    await this.queryRunner.startTransaction();

    // Replace the standard repositories with transaction-specific ones
    this.userRepository = this.queryRunner.manager.getRepository(User);

    console.log('Transaction started for test');
  }

  async rollbackTransaction() {
    if (this.queryRunner) {
      try {
        await this.queryRunner.rollbackTransaction();
        await this.queryRunner.release();

        // Restore original repositories after rollback
        this.userRepository = this.originalUserRepository;

        console.log('Transaction rolled back');
      } catch (error) {
        console.error('Error rolling back transaction:', error);
      }
    }
  }

  async seedDatabase() {
    try {
      // Create test users
      const users = [
        {
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          password: bcrypt.hashSync('admin123', 10),
          isAdmin: true,
        },
        {
          email: 'user@example.com',
          firstName: 'Regular',
          lastName: 'User',
          password: bcrypt.hashSync('user123', 10),
          isAdmin: false,
        },
      ];

      // Insert test users within current transaction
      for (const userData of users) {
        const user = this.userRepository.create(userData);
        await this.userRepository.save(user);
      }

      console.log('Test database seeded with users');
    } catch (error) {
      console.error('Error seeding database:', error);
      throw error;
    }
  }

  async cleanDatabase() {
    // Only clean if connected and not in a transaction
    // (if in a transaction, rollback will clean everything)
    if (this.dataSource && this.dataSource.isInitialized && !this.queryRunner) {
      try {
        // Order matters - delete related entities first
        await this.dataSource.query('DELETE FROM "users" CASCADE');
        console.log('Database cleaned');
      } catch (error) {
        console.error('Error cleaning database:', error);
      }
    }
  }

  // Get the user repository (returns transaction-specific repo if in transaction)
  getUserRepository(): Repository<User> {
    return this.userRepository;
  }
}
