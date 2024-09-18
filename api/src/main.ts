import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';
import { fastifyBootstrap } from 'config/fastify/fastify-bootstrap';
import { FastifyInstance } from 'fastify/types/instance';
import { swaggerBootstrap } from 'config/swagger/swagger-bootstrap';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from 'common/interceptors/response/response.interceptor';
import { HttpExceptionFilter } from 'common/exceptions/http-exception-filter';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({}),
    {},
  );

  const configService = app.get(ConfigService);
  const prefix = configService.get<string>('GLOBAL_PREFIX') || 'api';

  /** set global prefix for app */
  app.setGlobalPrefix(prefix);

  /** config fastify */
  await fastifyBootstrap(app as FastifyInstance & NestFastifyApplication);

  /** config swagger */
  await swaggerBootstrap(app);

  // Enable global validation and transformation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Automatically transform payloads to DTO instances
      // transformOptions: { enableImplicitConversion: true },
      whitelist: true, // Strip properties that are not in the DTO
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are present
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new ResponseInterceptor(),
  );

  await app.listen(4000, '0.0.0.0');
}
bootstrap();
