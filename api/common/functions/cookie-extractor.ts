import { FastifyRequest } from 'fastify';

export const cookieExtractor = (req: FastifyRequest): string | null => {
  return (
    req.cookies['access_token'] ||
    req.headers.authorization?.split(' ')[1] ||
    null
  ); // Adjust the cookie name as needed
};
