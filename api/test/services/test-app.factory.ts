import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { AppModule } from '../../src/app.module';
import { DataSource } from 'typeorm';
import { ResponseInterceptor } from '../../src/common/interceptors/response/response.interceptor';
import { HttpExceptionFilter } from '../../src/common/exceptions/http-exception-filter';
import { fastifyBootstrap } from '../../src/config/fastify/fastify-bootstrap';
import { swaggerBootstrap } from '../../src/config/swagger/swagger-bootstrap';
import { createCacheManagerMock } from '../mocks/cache-manager.mock';

export class TestAppFactory {
  private static instance: TestAppFactory;
  private app: NestFastifyApplication;
  private testingModule: TestingModule;
  private dataSource: DataSource;
  private isInitialized = false;
  private port = 4001; // Different from main app
  private apiPrefix = 'api';

  private constructor() {}

  /**
   * Get the singleton instance of TestAppFactory
   */
  public static getInstance(): TestAppFactory {
    if (!TestAppFactory.instance) {
      TestAppFactory.instance = new TestAppFactory();
    }
    return TestAppFactory.instance;
  }

  /**
   * Initialize the test app
   */
  async init(): Promise<NestFastifyApplication> {
    if (this.isInitialized) {
      return this.app;
    }

    console.log('🚀 Creating test app instance...');

    try {
      // Build the testing module
      const testModuleBuilder = Test.createTestingModule({
        imports: [AppModule], // Import your main app module
      });

      // Mock the cache manager
      testModuleBuilder
        .overrideProvider(CACHE_MANAGER)
        .useValue(createCacheManagerMock());

      // Add other mocks as needed
      // testModuleBuilder.overrideProvider(SERVICE_NAME).useValue(mockService);

      // Compile the module
      this.testingModule = await testModuleBuilder.compile();

      // Get TypeORM DataSource
      this.dataSource = this.testingModule.get<DataSource>(DataSource);

      // Verify correct database
      const dbName = this.dataSource.options.database;
      if (dbName !== 'test_db') {
        throw new Error(
          `Test app connected to wrong database: ${dbName}. Expected: test_db`,
        );
      }
      console.log(`✅ Test app connected to database: ${dbName}`);

      // Create Fastify app
      const adapter = new FastifyAdapter();
      this.app =
        this.testingModule.createNestApplication<NestFastifyApplication>(
          adapter,
        );

      // Set global prefix
      this.app.setGlobalPrefix(this.apiPrefix);

      // Configure fastify
      await fastifyBootstrap(this.app as any);

      // Configure swagger
      await swaggerBootstrap(this.app);

      // Apply global pipes, filters, and interceptors
      this.app.useGlobalPipes(
        new ValidationPipe({
          transform: true,
          whitelist: true,
          forbidNonWhitelisted: true,
        }),
      );

      this.app.useGlobalFilters(new HttpExceptionFilter());

      this.app.useGlobalInterceptors(
        new ClassSerializerInterceptor(this.app.get(Reflector)),
        new ResponseInterceptor(),
      );

      // Initialize the app
      await this.app.init();

      // Listen on test port
      await this.app.listen(this.port, '0.0.0.0');
      console.log(`✅ Test app listening on port ${this.port}`);

      this.isInitialized = true;
      return this.app;
    } catch (error) {
      console.error('❌ Failed to initialize test app:', error);
      throw error;
    }
  }

  /**
   * Close the test app and release resources
   */
  async close(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      // Close NestJS application
      if (this.app) {
        await this.app.close();
      }

      // Close database connection if still open
      if (this.dataSource && this.dataSource.isInitialized) {
        await this.dataSource.destroy();
      }

      this.isInitialized = false;
      console.log('✅ Test app closed successfully');
    } catch (error) {
      console.error('❌ Error while closing test app:', error);
      throw error;
    }
  }

  /**
   * Get the NestFastifyApplication instance
   */
  getApp(): NestFastifyApplication {
    if (!this.isInitialized) {
      throw new Error('TestApp not initialized. Call init() first.');
    }
    return this.app;
  }

  /**
   * Get the TestingModule instance
   */
  getTestingModule(): TestingModule {
    if (!this.isInitialized) {
      throw new Error('TestApp not initialized. Call init() first.');
    }
    return this.testingModule;
  }

  /**
   * Get the DataSource instance
   */
  getDataSource(): DataSource {
    if (!this.isInitialized) {
      throw new Error('TestApp not initialized. Call init() first.');
    }
    return this.dataSource;
  }

  /**
   * Get the base URL for API requests
   */
  getBaseUrl(): string {
    return `http://localhost:${this.port}/${this.apiPrefix}`;
  }
}
