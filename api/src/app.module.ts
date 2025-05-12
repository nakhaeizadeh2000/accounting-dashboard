import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { PostgresModule } from './config/database/postgres/postgres.module';
import { AuthModule } from './modules/auth/auth.module';
import { SeederModule } from './db/seeders/seeder.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { PermissionModule } from './permissions/permission.module';
import { RoleModule } from './role/role.module';
import { FilesModule } from './modules/files/files.module';
import { CaslModule } from './modules/casl/casl.module';
import { ArticleModule } from './modules/articles/article.module';

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
