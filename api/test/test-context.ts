import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DataSource } from 'typeorm';
import { TestingModule } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';

/**
 * TestContext provides an isolated context for each test suite
 * This replaces the global singleton pattern with an instance-based approach
 */
export class TestContext {
  private app: NestFastifyApplication;
  private dataSource: DataSource;
  private testingModule: TestingModule;
  private schemaName: string;
  private isInitialized = false;
  private baseUrl = 'http://localhost:4001/api';

  constructor() {
    // Generate a unique schema name for this test context
    this.schemaName = `test_${uuidv4().replace(/-/g, '_').substring(0, 10)}`;
  }

  /**
   * Get the unique schema name for this test context
   */
  getSchemaName(): string {
    return this.schemaName;
  }

  /**
   * Set the NestFastifyApplication instance
   */
  setApp(app: NestFastifyApplication): void {
    this.app = app;
    this.isInitialized = true;
  }

  /**
   * Set the DataSource instance
   */
  setDataSource(dataSource: DataSource): void {
    this.dataSource = dataSource;
  }

  /**
   * Set the TestingModule instance
   */
  setTestingModule(testingModule: TestingModule): void {
    this.testingModule = testingModule;
  }

  /**
   * Get the NestFastifyApplication instance
   */
  getApp(): NestFastifyApplication {
    if (!this.isInitialized) {
      throw new Error('TestContext not initialized. Call init() first.');
    }
    return this.app;
  }

  /**
   * Get the DataSource instance
   */
  getDataSource(): DataSource {
    if (!this.isInitialized) {
      throw new Error('TestContext not initialized. Call init() first.');
    }
    return this.dataSource;
  }

  /**
   * Get the TestingModule instance
   */
  getTestingModule(): TestingModule {
    if (!this.isInitialized) {
      throw new Error('TestContext not initialized. Call init() first.');
    }
    return this.testingModule;
  }

  /**
   * Get the base URL for API requests
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Check if the context is initialized
   */
  isContextInitialized(): boolean {
    return this.isInitialized;
  }
}
