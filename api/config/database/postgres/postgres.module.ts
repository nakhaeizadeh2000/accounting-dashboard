import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRE_HOST,
      port: +process.env.POSTGRE_PORT,
      database: process.env.POSTGRE_DB,
      username: process.env.POSTGRE_USER,
      password: process.env.POSTGRE_PASSWORD,
      synchronize: true,
      cache: {
        type: 'redis',
        options: {
          url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
        },
        duration: 300,
      },
      logging: true,
      autoLoadEntities: true,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/**/*.migration{.ts,.js}'],
    }),
  ],
  exports: [TypeOrmModule],
})
export class PostgresModule { }
