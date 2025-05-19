import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const testDbConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER || 'develop',
  password: process.env.POSTGRES_PASSWORD || '123456',
  database: 'test_db',
  entities: ['dist/**/*.entity.{ts,js}'],
  synchronize: true,
  dropSchema: true,
  logging: ['error'],
};
