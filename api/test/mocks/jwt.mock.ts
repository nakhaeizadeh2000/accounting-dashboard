import { JwtService } from '@nestjs/jwt';

/**
 * Creates a mock JWT service for testing
 * This can be used to override the JwtService in your tests
 */
export const createJwtServiceMock = () => {
  // Store tokens and their payloads for verification
  const tokenStore = new Map<string, any>();

  // Default token expiration (can be overridden in tests)
  const defaultExpiration = 3600; // 1 hour

  return {
    sign: jest.fn((payload: any, options?: any) => {
      const token = `mocked-jwt-token-${Date.now()}`;
      const expiration = options?.expiresIn || defaultExpiration;

      // Store token with payload and expiration
      tokenStore.set(token, {
        payload,
        expiration,
        issuedAt: Date.now(),
      });

      return token;
    }),

    verify: jest.fn((token: string, options?: any) => {
      const tokenData = tokenStore.get(token);

      if (!tokenData) {
        throw new Error('Invalid token');
      }

      // Check if token is expired
      const isExpired =
        tokenData.issuedAt + tokenData.expiration * 1000 < Date.now();
      if (isExpired) {
        throw new Error('Token expired');
      }

      return tokenData.payload;
    }),

    verifyAsync: jest.fn(async (token: string, options?: any) => {
      if (token === 'invalid-token') {
        throw new Error('Invalid token');
      }

      if (token === 'expired-token') {
        throw new Error('Token expired');
      }

      const tokenData = tokenStore.get(token);
      if (tokenData) {
        return tokenData.payload;
      }

      // Default mock payload if token not found in store
      return { user_id: '1', refresh_token_id: '123' };
    }),

    decode: jest.fn((token: string) => {
      const tokenData = tokenStore.get(token);
      return tokenData ? tokenData.payload : null;
    }),

    // Helper method to simulate token expiration for testing
    _expireToken: (token: string) => {
      const tokenData = tokenStore.get(token);
      if (tokenData) {
        // Set issuedAt to a time that makes the token expired
        tokenData.issuedAt = Date.now() - (tokenData.expiration * 1000 + 1000);
        tokenStore.set(token, tokenData);
      }
    },

    // Helper method to inspect the token store for testing
    _getTokenStore: () => tokenStore,

    // Helper method to clear all tokens
    _clearTokens: () => tokenStore.clear(),
  };
};

/**
 * Creates a provider override for JwtService in testing modules
 */
export const jwtServiceMockProvider = {
  provide: JwtService,
  useFactory: createJwtServiceMock,
};
