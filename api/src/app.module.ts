import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { PostgresModule } from '../config/database/postgres/postgres.module';
import { AuthModule } from './auth/auth.module';
import { SeederModule } from './db/seeders/seeder.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { PermissionModule } from './permissions/permission.module';
import { RoleModule } from './role/role.module';
import { CaslModule } from './casl/casl.module';
import { ArticleModule } from './article/article.module';
import { FilesModule } from './files/files.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PostgresModule,
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: process.env.REDIS_HOST,
            port: +process.env.REDIS_PORT,
          },
        }),
      }),
    }),
    SeederModule,
    AuthModule,
    UsersModule,
    PermissionModule,
    RoleModule,
    CaslModule,
    FilesModule,
    ArticleModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule { }
