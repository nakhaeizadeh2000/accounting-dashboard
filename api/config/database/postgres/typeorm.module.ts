import { DataSource } from 'typeorm';
import { Global, Module } from '@nestjs/common';

@Global() // makes the module available globally for other modules once imported in the app modules
@Module({
  imports: [],
  providers: [
    {
      provide: DataSource, // add the datasource as a provider
      inject: [],
      useFactory: async () => {
        // using the factory function to create the datasource instance
        try {
          const dataSource = new DataSource({
            type: 'postgres',
            host: process.env.POSTGRE_HOST,
            port: +process.env.POSTGRE_PORT,
            database: process.env.POSTGRE_DB,
            username: process.env.POSTGRE_USER,
            password: process.env.POSTGRE_PASSWORD,
            synchronize: process.env.POSTGRE_SYNC && false,
            cache: {
              type: 'redis',
              options: {
                url:
                  'redis://' +
                  process.env.REDIS_HOST +
                  ':' +
                  process.env.REDIS_PORT,
              },
              duration: 300,
            },
            entities: ['dist/**/*.entity.{ts,js}'],
            migrations: ['dist/**/*.migration.{ts,js}'], // this will automatically load all entity file in the src folder
          });
          await dataSource.initialize(); // initialize the data source
          console.log('Database connected successfully');
          return dataSource;
        } catch (error) {
          console.log('Error connecting to database');
          throw error;
        }
      },
    },
  ],
  exports: [DataSource],
})
export class TypeOrmModule { }
