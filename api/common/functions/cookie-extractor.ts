import { FastifyRequest } from 'fastify';

export const cookieExtractor = (req: FastifyRequest): string | null => {
  return req.cookies['access_token'] || null; // Adjust the cookie name as needed
};
