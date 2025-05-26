import { TestEnvironmentService } from './services/test-environment.service';
import { TestAppFactory } from './services/test-app.factory';
import { DatabaseInitializerService } from './services/database-initializer.service';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DataSource } from 'typeorm';
import { TestingModule, Test } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { createCacheManagerMock } from './mocks/cache-manager.mock';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ResponseInterceptor } from '../src/common/interceptors/response/response.interceptor';
import { HttpExceptionFilter } from '../src/common/exceptions/http-exception-filter';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { fastifyBootstrap } from '../src/config/fastify/fastify-bootstrap';
import { swaggerBootstrap } from '../src/config/swagger/swagger-bootstrap';
import { TestContainers } from './containers/test-containers';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { TypeOrmModule } from '@nestjs/typeorm';

// Global variables to track test environment state
let isInitialized = false;
let testAppFactory: TestAppFactory;
let environmentService: TestEnvironmentService;
let dataSource: DataSource;

/**
 * Initialize the entire test environment and application
 * @returns The initialized NestFastifyApplication instance
 */
export const setupTestApp = async (): Promise<NestFastifyApplication> => {
  if (isInitialized) {
    console.log('ℹ️ Test environment already initialized, reusing instance');
    return testAppFactory.getApp();
  }

  console.log('🚀 Setting up test environment and application...');

  try {
    // Force test environment settings
    process.env.NODE_ENV = 'test';
    process.env.POSTGRES_DB = 'test_db';

    // Safety check for production database
    if (
      process.env.POSTGRES_DB.includes('prod') ||
      process.env.POSTGRES_DB.includes('production')
    ) {
      throw new Error(
        `CRITICAL ERROR: Attempting to use production database: ${process.env.POSTGRES_DB}`,
      );
    }

    // 1. Initialize test environment (database, etc.)
    environmentService = TestEnvironmentService.getInstance();
    await environmentService.initializeEnvironment();

    // 2. Initialize test application
    testAppFactory = TestAppFactory.getInstance();
    const app = await testAppFactory.init();

    // Get the DataSource for later use
    dataSource = testAppFactory.getDataSource();

    isInitialized = true;
    console.log('✅ Test environment and application initialized successfully');

    return app;
  } catch (error) {
    console.error('❌ Test setup failed:', error);
    // Try to clean up on failure
    await teardownTestApp();
    throw error;
  }
};

/**
 * Clean up all test resources
 * Should be called after all tests in a suite are complete
 */
export const teardownTestApp = async (): Promise<void> => {
  if (!isInitialized) {
    return;
  }

  console.log('🧹 Safe test environment cleanup...');

  try {
    // Close the app with a proper timeout handler
    if (testAppFactory) {
      const closePromise = testAppFactory.close();
      // Use a proper timeout with cleanup
      const timeoutPromise = new Promise<void>((resolve) => {
        const id = setTimeout(() => {
          console.log('⚠️ App close timed out after 5000ms');
          resolve();
        }, 5000);

        closePromise.then(() => {
          clearTimeout(id);
          resolve();
        });
      });

      await timeoutPromise;
    }

    isInitialized = false;
    console.log('✅ Test environment cleaned up');
  } catch (error) {
    console.error('❌ Error during test teardown:', error);
    // Mark as not initialized anyway
    isInitialized = false;
  }
};

/**
 * Reset the test database to a clean state
 * Useful for resetting between test suites if needed
 */
export const resetTestDatabase = async (): Promise<void> => {
  if (!isInitialized) {
    throw new Error(
      'Test environment not initialized. Call setupTestApp() first.',
    );
  }

  try {
    const databaseInitializer = new DatabaseInitializerService();
    await databaseInitializer.resetTestDatabase();
    console.log('✅ Test database reset successfully');
    return;
  } catch (error) {
    console.error('❌ Failed to reset test database:', error);
    throw error;
  }
};

/**
 * Get the DataSource from the TestApp
 */
export const getTestDataSource = (): DataSource => {
  if (!isInitialized) {
    throw new Error(
      'Test environment not initialized. Call setupTestApp() first.',
    );
  }
  return testAppFactory.getDataSource();
};

/**
 * Get the TestingModule from the TestApp
 */
export const getTestingModule = (): TestingModule => {
  if (!isInitialized) {
    throw new Error(
      'Test environment not initialized. Call setupTestApp() first.',
    );
  }
  return testAppFactory.getTestingModule();
};

/**
 * Get the base URL for API requests
 * @param port Optional port number for isolated test apps
 * @returns The base URL for API requests
 */
export const getTestBaseUrl = (port?: number): string => {
  if (port) {
    return `http://localhost:${port}/api`;
  }

  if (!isInitialized) {
    throw new Error(
      'Test environment not initialized. Call setupTestApp() first.',
    );
  }
  return testAppFactory.getBaseUrl();
};

/**
 * Get a mock cache manager for testing
 */
export const getCacheManager = (): any => {
  return createCacheManagerMock();
};

/**
 * Check if the test environment is properly initialized
 */
export const isTestEnvironmentInitialized = (): boolean => {
  return isInitialized;
};

/**
 * Validate that we're connected to the test database
 */
export const validateTestDatabaseConnection = (): boolean => {
  if (!isInitialized) {
    return false;
  }

  const dataSource = testAppFactory.getDataSource();
  const dbName = dataSource.options.database;

  if (dbName !== 'test_db') {
    console.error(`❌ ERROR: Connected to wrong database: ${dbName}`);
    return false;
  }

  return true;
};

// Track port usage to avoid conflicts in parallel tests
const usedPorts = new Set<number>();
const getAvailablePort = (): number => {
  // Start from 4001 and find an unused port
  let port = 4001;
  while (usedPorts.has(port)) {
    port++;
  }
  usedPorts.add(port);
  return port;
};

/**
 * Release a port when a test app is closed
 */
export function releasePort(port: number): void {
  usedPorts.delete(port);
}

/**
 * Create a test app with an isolated database schema and Redis database
 */
export async function createIsolatedTestApp(schemaName: string): Promise<{
  app: NestFastifyApplication;
  dataSource: DataSource;
  testingModule: TestingModule;
}> {
  console.log(`🚀 Creating test app with schema: ${schemaName}`);

  // Ensure test database exists
  const dbInitializer = new DatabaseInitializerService();
  await dbInitializer.createTestDatabase();

  // Create schema if it doesn't exist
  await dbInitializer.createSchema(schemaName);

  // Create a unique port for this test app
  const port = getAvailablePort();
  console.log(`📡 Test app will use port: ${port}`);

  // Get Redis connection settings
  const redis = await TestContainers.initialize();

  // Generate a unique Redis database number for this test (0-15)
  const redisDbNumber = Math.floor(Math.random() * 15) + 1;
  console.log(`📊 Test app will use Redis database: ${redisDbNumber}`);

  // Create a dynamic module for Redis cache with isolated database
  const TestCacheModule = CacheModule.registerAsync({
    isGlobal: true,
    useFactory: async () => ({
      store: await redisStore({
        socket: {
          host: redis.host,
          port: redis.port,
        },
        database: redisDbNumber, // Use a unique Redis database for isolation
      }),
    }),
  });

  // Create custom TypeORM module with schema
  const TestTypeOrmModule = TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT) || 5432,
      username: process.env.POSTGRES_USER || 'develop',
      password: process.env.POSTGRES_PASSWORD || '123456',
      database: 'test_db',
      schema: schemaName, // Set the schema explicitly
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: false,
      autoLoadEntities: true,
    }),
  });

  // Override TypeORM config to use the test schema
  const testingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ isGlobal: true }),
      TestCacheModule,
      TestTypeOrmModule,
      AppModule,
    ],
  })
    // Remove the original CacheModule to avoid conflicts
    .overrideModule(CacheModule)
    .useModule(TestCacheModule)
    .compile();

  // Create app with Fastify adapter
  const app = testingModule.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter({}),
  );

  // Get config service
  const configService = app.get(ConfigService);
  const prefix = configService.get<string>('GLOBAL_PREFIX') || 'api';

  // Set global prefix
  app.setGlobalPrefix(prefix);

  // Configure fastify
  await fastifyBootstrap(app as any);

  // Configure swagger
  await swaggerBootstrap(app);

  // Apply global pipes, filters, and interceptors
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new ResponseInterceptor(),
  );

  // Get DataSource
  const dataSource = testingModule.get<DataSource>(DataSource);

  // CRITICAL: Set search path for all connections in this DataSource
  await dataSource.query(`SET search_path TO "${schemaName}",public`);

  // Create a query transformer to ensure schema is used
  dataSource.driver.afterConnect = async () => {
    await dataSource.query(`SET search_path TO "${schemaName}",public`);
  };

  // Initialize app
  await app.init();
  await app.listen(port, '0.0.0.0');

  console.log(`✅ Test app created and listening on port ${port}`);

  return { app, dataSource, testingModule };
}
