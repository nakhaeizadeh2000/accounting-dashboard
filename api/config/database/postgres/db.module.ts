import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const DbModule = TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const option = {
      type: 'postgres',
      host: configService.get<string>('POSTGRE_HOST'),
      port: +configService.get<string>('POSTGRE_PORT'),
      database: configService.get<string>('POSTGRE_DB'),
      username: configService.get<string>('POSTGRE_USER'),
      password: configService.get<string>('POSTGRE_PASSWORD'),
      synchronize: configService.get<boolean>('POSTGRE_SYNC', false),
      cache: {
        type: 'redis',
        options: {
          url:
            'redis://' +
            configService.get<string>('REDIS_HOST') +
            ':' +
            configService.get<number>('REDIS_PORT'),
        },
        duration: 300,
      },
      logging: false,
      autoLoadEntities: true,
      entities: ['dist/**/*.entity.{ts,js}'],
      migrations: ['dist/**/*.migration.{ts,js}'],
    } as TypeOrmModuleAsyncOptions;
    return option;
  },
});
