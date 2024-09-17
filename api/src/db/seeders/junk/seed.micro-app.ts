import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { Seeder } from '../seeder';
import { SeederModule } from '../seeder.module';

async function bootstrap() {
  NestFactory.createApplicationContext(SeederModule, {
    logger: ['error', 'warn', 'debug', 'verbose'],
  })
    .then((appContext) => {
      const logger = appContext.get(Logger);
      logger.warn('micro app is ready...');
      const seeder = appContext.get(Seeder);
      seeder
        .seed()
        .then(() => {
          logger.debug('Seeding complete!');
        })
        .catch((error) => {
          logger.error('Seeding failed!');
          throw error;
        })
        .finally(() => appContext.close());
    })
    .catch((error) => {
      throw error;
    });
}
bootstrap();
