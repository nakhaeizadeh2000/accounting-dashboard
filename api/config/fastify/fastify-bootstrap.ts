/** import fastify and modules */
import compression from '@fastify/compress';
import fastifyMultipart from '@fastify/multipart';
import { fastifySwagger } from '@fastify/swagger';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { FastifyInstance } from 'fastify/types/instance';
import fastifyCookie from '@fastify/cookie';
import fastifyHelmet from '@fastify/helmet';

export async function fastifyBootstrap(
  app: FastifyInstance & NestFastifyApplication,
) {
  await app.register(fastifyHelmet);
  app.register(compression, { encodings: ['gzip', 'deflate'] });
  app.register(fastifyMultipart, {
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB limit (example)
      // files: 1, // Limit number of files per request
      files: Infinity,
    },
  });
  app.register(fastifySwagger);
  app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET,
    parseOptions: {
      secure: process.env.NODE_ENV === 'production', // only transmits to serverv via https channel(prevent man-in-middle attack)
      signed: true, // check integrity of coockie data
      httpOnly: true, // Prevents client-side access to the cookie
      sameSite: 'lax', // CSRF protection
      path: '/', // Cookie is available across the entire site
    },
  });
}
