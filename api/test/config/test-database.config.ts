import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

// Create a function that returns the test database configuration
export const getTestDbConfig = (
  schema?: string,
  configService?: ConfigService,
): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT) || 5432,
    username: process.env.POSTGRES_USER || 'develop',
    password: process.env.POSTGRES_PASSWORD || '123456',
    database: 'test_db',
    schema: schema || 'public',
    entities: [__dirname + '/../../src/**/*.entity{.ts,.js}'],
    synchronize: true,
    dropSchema: false, // We'll manage schemas manually
    logging: process.env.DB_LOGGING === 'true' ? ['error', 'warn'] : false,
    // Disable cache for tests to ensure isolation
    cache: false,
  };
};
