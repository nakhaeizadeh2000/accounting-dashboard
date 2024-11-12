import { DataSource, DataSourceOptions } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';
import { registerAs } from '@nestjs/config';

dotenvConfig({ path: '.env' });

export const config = {
  type: 'postgres',
  host: process.env.POSTGRE_HOST,
  port: +process.env.POSTGRE_PORT,
  database: process.env.POSTGRE_DB,
  username: process.env.POSTGRE_USER,
  password: process.env.POSTGRE_PASSWORD,
  synchronize: process.env.POSTGRE_SYNC === 'true',
  cache: {
    type: 'redis',
    options: {
      url: 'redis://' + process.env.REDIS_HOST + ':' + process.env.REDIS_PORT,
    },
    duration: 300,
  },
  logging: true,
  autoLoadEntities: true,
  entities: ['dist/**/*.entity.{ts,js}'],
  migrations: ['dist/**/*.migration.{ts,js}'],
};

export default registerAs('typeorm', () => config);

export const connectionSource = new DataSource(config as DataSourceOptions);
