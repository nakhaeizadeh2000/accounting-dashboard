import { JwtService } from '@nestjs/jwt';

/**
 * Creates a simplified mock JWT service for testing
 */
export const createJwtServiceMock = () => {
  // Store tokens and their payloads for verification
  const tokenStore = new Map<string, any>();

  return {
    sign: jest.fn((payload: any) => {
      const token = `mocked-jwt-token-${Date.now()}`;
      tokenStore.set(token, { payload, issuedAt: Date.now() });
      return token;
    }),

    verify: jest.fn((token: string) => {
      const tokenData = tokenStore.get(token);
      if (!tokenData) {
        throw new Error('Invalid token');
      }
      return tokenData.payload;
    }),

    verifyAsync: jest.fn(async (token: string) => {
      if (token === 'invalid-token') {
        throw new Error('Invalid token');
      }
      const tokenData = tokenStore.get(token);
      return tokenData ? tokenData.payload : { user_id: '1' };
    }),

    decode: jest.fn((token: string) => {
      const tokenData = tokenStore.get(token);
      return tokenData ? tokenData.payload : null;
    }),
  };
};

/**
 * Creates a provider override for JwtService in testing modules
 */
export const jwtServiceMockProvider = {
  provide: JwtService,
  useFactory: createJwtServiceMock,
};
