import { Reflector } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { getCacheManager } from './setup-tests';

// Import all the necessary components from your main.ts
import { ResponseInterceptor } from '../src/common/interceptors/response/response.interceptor';
import { HttpExceptionFilter } from '../src/common/exceptions/http-exception-filter';
import { fastifyBootstrap } from '../src/config/fastify/fastify-bootstrap';
import { swaggerBootstrap } from '../src/config/swagger/swagger-bootstrap';

// TestApp singleton class to manage the test instance
export class TestApp {
  private static instance: TestApp;
  private app: NestFastifyApplication;
  private testingModule: TestingModule;
  private dataSource: DataSource;
  private isInitialized = false;
  private port = 4001; // Use a different port than your main app
  private apiPrefix: string = 'api';

  private constructor() {}

  public static getInstance(): TestApp {
    if (!TestApp.instance) {
      TestApp.instance = new TestApp();
    }
    return TestApp.instance;
  }

  public async init(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    console.log('🚀 Creating test app instance...');

    // Force test environment
    process.env.NODE_ENV = 'test';
    // process.env.POSTGRES_DB = 'test_db';

    // Create a test module with TypeORM override for test database
    try {
      const testingModuleBuilder = Test.createTestingModule({
        imports: [
          // Override TypeORM config for test database
          // TypeOrmModule.forRootAsync({
          //   imports: [ConfigModule],
          //   inject: [ConfigService],
          //   useFactory: (configService: ConfigService) => ({
          //     type: 'postgres' as const,
          //     host: configService.get('POSTGRES_HOST') || 'localhost',
          //     port: parseInt(configService.get('POSTGRES_PORT')) || 5432,
          //     username: configService.get('POSTGRES_USER') || 'develop',
          //     password: configService.get('POSTGRES_PASSWORD') || '123456',
          //     database: 'test_db', // Force test database
          //     entities: [__dirname + '/../**/*.entity{.ts,.js}'], // Use the same entities as your main app
          //     synchronize: true, // Safe to use in test
          //     logging: false,
          //   }),
          // }),
          // Import your main app module to get all controllers, services, etc.
          AppModule,
        ],
      });

      // Add provider overrides BEFORE compiling
      testingModuleBuilder
        .overrideProvider(CACHE_MANAGER)
        .useValue(getCacheManager());

      // Add any other provider overrides here
      // testingModuleBuilder.overrideProvider(SERVICE_NAME).useValue(mockService);

      // Compile the module
      this.testingModule = await testingModuleBuilder.compile();

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

      // Create Fastify app - Same as in main.ts
      const adapter = new FastifyAdapter({});
      this.app =
        this.testingModule.createNestApplication<NestFastifyApplication>(
          adapter,
        );

      // Set global prefix - Same as in main.ts
      const configService = this.app.get(ConfigService);
      const prefix = configService.get<string>('GLOBAL_PREFIX') || 'api';
      this.apiPrefix = prefix;
      this.app.setGlobalPrefix(prefix);

      // Configure fastify - Same as in main.ts
      await fastifyBootstrap(this.app as any);

      // Configure swagger - Same as in main.ts
      await swaggerBootstrap(this.app);

      // Apply global validation pipe - Same as in main.ts
      this.app.useGlobalPipes(
        new ValidationPipe({
          transform: true,
          whitelist: true,
          forbidNonWhitelisted: true,
        }),
      );

      // Apply global exception filter - Same as in main.ts
      this.app.useGlobalFilters(new HttpExceptionFilter());

      // Apply global interceptors - Same as in main.ts
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
      return;
    } catch (error) {
      console.error('Failed to initialize test app:', error);
      throw error;
    }
  }

  public async resetDatabase(): Promise<void> {
    if (!this.dataSource || !this.dataSource.isInitialized) {
      throw new Error('DataSource not initialized');
    }

    console.log('🔄 Resetting test database...');
    await this.dataSource.synchronize(true);
    console.log('✅ Test database reset complete');
  }

  public async close(): Promise<void> {
    if (this.app) {
      await this.app.close();
      this.isInitialized = false;
      console.log('✅ Test app closed');
    }
  }

  public getApp(): NestFastifyApplication {
    if (!this.isInitialized) {
      throw new Error('TestApp not initialized. Call init() first.');
    }
    return this.app;
  }

  public getTestingModule(): TestingModule {
    if (!this.isInitialized) {
      throw new Error('TestApp not initialized. Call init() first.');
    }
    return this.testingModule;
  }

  public getDataSource(): DataSource {
    if (!this.isInitialized) {
      throw new Error('TestApp not initialized. Call init() first.');
    }
    return this.dataSource;
  }

  public getBaseUrl(): string {
    return `http://localhost:${this.port}/${this.apiPrefix}`;
  }
}
