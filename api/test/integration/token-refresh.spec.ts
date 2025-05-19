import { TestRequest } from '../helpers/request.helper';
import { DatabaseTestHelper } from '../helpers/database.helper';
import { AuthTestHelper } from '../helpers/auth-test.helper';
import {
  setupTestApp,
  teardownTestApp,
  getCacheManager,
  getTestingModule,
} from '../setup-tests';
import * as fixtures from '../fixtures';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('JWT Token Refresh (integration)', () => {
  let request: TestRequest;
  let dbHelper: DatabaseTestHelper;
  let authHelper: AuthTestHelper;
  let cacheManager: any;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeAll(async () => {
    console.log('Setting up test environment for JWT token refresh tests');
    await setupTestApp();
    const testingModule = getTestingModule();

    cacheManager = getCacheManager();
    jwtService = testingModule.get<JwtService>(JwtService);
    configService = testingModule.get<ConfigService>(ConfigService);

    request = new TestRequest();
    // No need for request.init() as we're using supertest.agent directly

    dbHelper = new DatabaseTestHelper();
    await dbHelper.init();

    authHelper = new AuthTestHelper(request);
    console.log('Test environment setup complete');
  });

  beforeEach(async () => {
    console.log('Starting new transaction for test');
    await dbHelper.startTransaction();
    await dbHelper.seedDatabase();
    request.clearCookies();

    // Reset all mock functions
    cacheManager.get.mockClear();
    cacheManager.set.mockClear();
    cacheManager.del.mockClear();
    console.log('Cache mock functions reset');
  });

  afterEach(async () => {
    console.log('Rolling back transaction after test');
    await dbHelper.rollbackTransaction();
  });

  afterAll(async () => {
    console.log('Tearing down test environment');
    await teardownTestApp();
  });

  describe('Refresh Token Storage', () => {
    it('should store refresh token in cache during login', async () => {
      console.log('Testing: refresh token storage in cache during login');

      // Login
      console.log('Logging in to generate refresh token');
      const loginResponse = await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });
      console.log(`Logged in as user ID: ${loginResponse.user.id}`);

      // Check that refresh token was stored in cache
      console.log('Verifying refresh token was stored in cache');
      expect(cacheManager.set).toHaveBeenCalled();

      // Find the specific call that stored the refresh token
      const cacheKey = cacheManager.set.mock.calls.find((call) =>
        call[0].includes('refresh_tokens_by_user_id'),
      )?.[0];

      expect(cacheKey).toBeDefined();
      console.log(`Found cache key: ${cacheKey}`);

      // Verify the token value was stored
      const storedValue = cacheManager.set.mock.calls.find(
        (call) => call[0] === cacheKey,
      )?.[1];
      expect(storedValue).toBeDefined();
      console.log('Refresh token successfully stored in cache');
    });

    it('should store multiple refresh tokens for the same user', async () => {
      console.log('Testing: storing multiple refresh tokens for the same user');

      // First login session
      console.log('First login session');
      const firstLogin = await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });
      console.log('First login complete');

      // Record the cache key pattern for this user
      const userId = firstLogin.user.id;
      const cacheKeyPattern = `refresh_tokens_by_user_id_${userId}`;
      console.log(`Cache key pattern for user: ${cacheKeyPattern}`);

      // Clear cookies to simulate a new session
      console.log('Clearing cookies for second session');
      request.clearCookies();

      // Mock the cache to return the existing token
      const existingToken = {
        token: 'first-refresh-token',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      cacheManager.get.mockImplementation((key) => {
        if (key === cacheKeyPattern) {
          return [existingToken];
        }
        return null;
      });
      console.log('Cache mock setup to return existing token');

      // Second login from same user, different device/session
      console.log('Second login session');
      await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });
      console.log('Second login complete');

      // Check that tokens were stored/updated in cache
      console.log('Verifying multiple tokens were stored');

      // Find the set call for refresh tokens
      const setCalls = cacheManager.set.mock.calls.filter((call) =>
        call[0].includes(cacheKeyPattern),
      );

      expect(setCalls.length).toBeGreaterThan(0);
      console.log(`Found ${setCalls.length} cache set operation(s)`);

      // The last call should have both tokens
      const lastSetCall = setCalls[setCalls.length - 1];
      const tokensArray = lastSetCall[1];

      expect(Array.isArray(tokensArray)).toBeTruthy();
      expect(tokensArray.length).toBeGreaterThanOrEqual(2);
      console.log(`Cache now contains ${tokensArray.length} tokens for user`);
    });
  });

  describe('Token Refresh Operations', () => {
    it('should use a refresh token to generate new access token', async () => {
      console.log('Testing: generating new access token using refresh token');

      // 1. Login to get initial tokens
      console.log('Logging in to get initial tokens');
      const loginResponse = await request.post('/auth/login', {
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      expect(loginResponse.status).toBe(201);
      expect(loginResponse.body.data).toHaveProperty('refresh_token');
      const refreshToken = loginResponse.body.data.refresh_token;
      console.log('Successfully obtained refresh token from login');

      // 2. Clear cookies to simulate expired access token
      console.log('Clearing cookies to simulate expired access token');
      request.clearCookies();

      // 3. Use refresh token to get new access token
      console.log('Requesting new access token with refresh token');
      const refreshResponse = await request.post(
        '/auth/refresh',
        {
          refresh_token: refreshToken,
        },
        {},
      );

      console.log(
        'Refresh token response:',
        JSON.stringify(refreshResponse.body),
      );

      // 4. Verify we got a new access token
      expect(refreshResponse.status).toBe(201);
      expect(refreshResponse.body.success).toBe(true);
      expect(refreshResponse.body.data).toHaveProperty('access_token');

      // 5. Check that new token cookie was set
      expect(refreshResponse.headers['set-cookie']).toBeDefined();
      console.log('New access token successfully issued');

      // 6. Use new access token to access protected resource
      console.log('Testing new access token on protected resource');
      request.saveCookies(refreshResponse);
      const protectedResponse = await request.get('/users', {});

      expect(protectedResponse.status).toBe(200);
      console.log('Successfully accessed protected resource with new token');
    });

    it('should reject invalid refresh tokens', async () => {
      console.log('Testing: rejection of invalid refresh tokens');

      // Try to refresh with a made-up token
      console.log('Attempting to refresh with invalid token');
      const invalidToken = 'invalid-refresh-token-value';

      const response = await request.post(
        '/auth/refresh',
        {
          refresh_token: invalidToken,
        },
        {},
      );

      console.log('Invalid token response:', JSON.stringify(response.body));

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      console.log('Invalid token correctly rejected with 401 Unauthorized');
    });

    it('should reject expired refresh tokens', async () => {
      console.log('Testing: rejection of expired refresh tokens');

      // 1. Login to get user ID for cache key
      console.log('Logging in to get user details');
      const loginResult = await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      const userId = loginResult.user.id;
      console.log(`User ID: ${userId}`);

      // 2. Mock an expired refresh token in cache
      const expiredDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago
      const expiredToken = {
        token: 'expired-refresh-token',
        expires_at: expiredDate,
      };

      // 3. Set up cache to return our expired token
      const cacheKey = `refresh_tokens_by_user_id_${userId}`;
      cacheManager.get.mockImplementation((key) => {
        if (key === cacheKey) {
          return [expiredToken];
        }
        return null;
      });
      console.log('Cache mock setup to return expired token');

      // 4. Try to use the expired token
      console.log('Attempting to refresh with expired token');
      const response = await request.post(
        '/auth/refresh',
        {
          refresh_token: expiredToken.token,
        },
        {},
      );

      console.log('Expired token response:', JSON.stringify(response.body));

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      console.log('Expired token correctly rejected with 401 Unauthorized');

      // 5. Verify expired token was removed from cache
      console.log('Verifying expired token was removed from cache');
      expect(cacheManager.del).toHaveBeenCalled();
    });
  });

  describe('Refresh Token Cleanup', () => {
    it('should clear all refresh tokens on logout', async () => {
      console.log('Testing: clearing all refresh tokens on logout');

      // Login
      console.log('Logging in to establish session');
      const loginResponse = await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      const userId = loginResponse.user.id;
      console.log(`Logged in as user ID: ${userId}`);

      // Clear mock calls from login
      cacheManager.del.mockClear();
      console.log('Cache del mock cleared');

      // Logout
      console.log('Performing logout');
      await request.post('/auth/logout', {}, {});
      console.log('Logout complete');

      // Check that refresh tokens were deleted from cache
      console.log('Verifying refresh tokens were deleted');
      expect(cacheManager.del).toHaveBeenCalled();

      // Verify that the user's refresh tokens cache key was deleted
      const refreshTokenCacheKey = `refresh_tokens_by_user_id_${userId}`;

      const delCalls = cacheManager.del.mock.calls;
      const deletedCacheKey = delCalls.find((call) =>
        call[0].includes('refresh_tokens_by_user_id'),
      )?.[0];

      expect(deletedCacheKey).toBeDefined();
      console.log(`Cache key deleted: ${deletedCacheKey}`);

      console.log('All refresh tokens successfully cleared on logout');
    });

    it('should handle concurrent sessions and selective token revocation', async () => {
      console.log('Testing: selective revocation of refresh tokens');

      // 1. Login to get user ID
      console.log('Logging in to get user details');
      const loginResult = await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      const userId = loginResult.user.id;
      console.log(`User ID: ${userId}`);

      // 2. Mock multiple refresh tokens in cache
      const now = Date.now();
      const futureDate = new Date(now + 7 * 24 * 60 * 60 * 1000); // 7 days in future

      const mockTokens = [
        {
          token: 'refresh-token-1',
          device_id: 'device-1',
          expires_at: futureDate,
        },
        {
          token: 'refresh-token-2',
          device_id: 'device-2',
          expires_at: futureDate,
        },
        {
          token: 'refresh-token-3',
          device_id: 'device-3',
          expires_at: futureDate,
        },
      ];

      // 3. Setup the cache mock to return our tokens
      const cacheKey = `refresh_tokens_by_user_id_${userId}`;
      cacheManager.get.mockImplementation((key) => {
        if (key === cacheKey) {
          return [...mockTokens]; // Return a copy of the array
        }
        return null;
      });
      console.log('Cache mock setup with multiple tokens');

      // 4. Revoke a specific token
      console.log('Revoking specific token');
      const tokenToRevoke = 'refresh-token-2';

      const revokeResponse = await request.post(
        '/auth/revoke',
        {
          refresh_token: tokenToRevoke,
        },
        {},
      );

      console.log('Revoke response:', JSON.stringify(revokeResponse.body));

      expect(revokeResponse.status).toBe(200);
      expect(revokeResponse.body.success).toBe(true);

      // 5. Verify the cache was updated to remove only that token
      console.log('Verifying selective token removal from cache');

      // Check that set was called to update the tokens
      expect(cacheManager.set).toHaveBeenCalled();

      // The set call should have the updated array without the revoked token
      const setCalls = cacheManager.set.mock.calls.filter(
        (call) => call[0] === cacheKey,
      );

      expect(setCalls.length).toBeGreaterThan(0);
      const updatedTokens = setCalls[setCalls.length - 1][1];

      expect(Array.isArray(updatedTokens)).toBeTruthy();
      expect(updatedTokens.length).toBe(2); // Should have one token less

      // Verify the revoked token is not in the updated list
      const tokenStillExists = updatedTokens.some(
        (t) => t.token === tokenToRevoke,
      );
      expect(tokenStillExists).toBe(false);

      console.log('Token successfully revoked while preserving other sessions');
    });

    it('should clean up expired tokens automatically', async () => {
      console.log('Testing: automatic cleanup of expired tokens');

      // 1. Login to get user ID
      console.log('Logging in to get user details');
      const loginResult = await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      const userId = loginResult.user.id;
      console.log(`User ID: ${userId}`);

      // 2. Mock a mix of valid and expired tokens in cache
      const now = Date.now();
      const futureDate = new Date(now + 7 * 24 * 60 * 60 * 1000); // 7 days in future
      const pastDate = new Date(now - 24 * 60 * 60 * 1000); // 1 day in past

      const mockTokens = [
        {
          token: 'valid-token-1',
          device_id: 'device-1',
          expires_at: futureDate,
        },
        {
          token: 'expired-token-2',
          device_id: 'device-2',
          expires_at: pastDate,
        },
        {
          token: 'valid-token-3',
          device_id: 'device-3',
          expires_at: futureDate,
        },
      ];

      // 3. Setup the cache mock to return our tokens
      const cacheKey = `refresh_tokens_by_user_id_${userId}`;
      cacheManager.get.mockImplementation((key) => {
        if (key === cacheKey) {
          return [...mockTokens]; // Return a copy of the array
        }
        return null;
      });
      console.log('Cache mock setup with mix of valid and expired tokens');

      // 4. Use a valid token to trigger automatic cleanup
      console.log('Using a valid token to trigger automatic cleanup');
      await request.post(
        '/auth/refresh',
        {
          refresh_token: 'valid-token-1',
        },
        {},
      );

      // 5. Verify that the cache was updated with only valid tokens
      console.log('Verifying expired tokens were automatically removed');

      // Check that set was called to update the tokens
      expect(cacheManager.set).toHaveBeenCalled();

      // The set call should have the updated array without expired tokens
      const setCalls = cacheManager.set.mock.calls.filter(
        (call) => call[0] === cacheKey,
      );

      expect(setCalls.length).toBeGreaterThan(0);
      const updatedTokens = setCalls[setCalls.length - 1][1];

      expect(Array.isArray(updatedTokens)).toBeTruthy();
      expect(updatedTokens.length).toBe(2); // Should have only the valid tokens

      // Verify that all tokens in the updated list are valid (not expired)
      const allValid = updatedTokens.every(
        (t) => t.token === 'valid-token-1' || t.token === 'valid-token-3',
      );
      expect(allValid).toBe(true);

      console.log('Expired tokens successfully cleaned up automatically');
    });
  });

  describe('Security Aspects of Refresh Tokens', () => {
    it('should prevent reuse of already used refresh tokens', async () => {
      console.log('Testing: prevention of refresh token reuse');

      // 1. Login to get initial tokens
      console.log('Logging in to get initial tokens');
      const loginResponse = await request.post('/auth/login', {
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      expect(loginResponse.status).toBe(201);
      expect(loginResponse.body.data).toHaveProperty('refresh_token');
      const refreshToken = loginResponse.body.data.refresh_token;
      console.log('Successfully obtained refresh token from login');

      // 2. Use refresh token to get new access token
      console.log('Using refresh token for the first time');
      const firstRefreshResponse = await request.post(
        '/auth/refresh',
        {
          refresh_token: refreshToken,
        },
        {},
      );

      expect(firstRefreshResponse.status).toBe(201);
      console.log('First refresh successful');

      // 3. Try to reuse the same refresh token
      console.log('Attempting to reuse the same refresh token');
      const secondRefreshResponse = await request.post(
        '/auth/refresh',
        {
          refresh_token: refreshToken,
        },
        {},
      );

      console.log(
        'Reuse response:',
        JSON.stringify(secondRefreshResponse.body),
      );

      // 4. Should be rejected as the token has already been used
      expect(secondRefreshResponse.status).toBe(401);
      expect(secondRefreshResponse.body.success).toBe(false);
      console.log('Refresh token reuse correctly prevented');
    });

    it('should invalidate all tokens when password is changed', async () => {
      console.log('Testing: invalidation of all tokens on password change');

      // 1. Login to get initial tokens
      console.log('Logging in to get initial tokens');
      const loginResult = await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      const userId = loginResult.user.id;
      console.log(`User ID: ${userId}`);

      // 2. Clear mock to focus on password change effects
      cacheManager.del.mockClear();
      console.log('Cache del mock cleared');

      // 3. Change user password
      console.log('Changing user password');
      const passwordChangeResponse = await request.post(
        '/auth/change-password',
        {
          currentPassword: 'admin123',
          newPassword: 'NewPassword123!',
        },
        {},
      );

      expect(passwordChangeResponse.status).toBe(200);
      console.log('Password changed successfully');

      // 4. Verify all refresh tokens were invalidated
      console.log('Verifying all refresh tokens were invalidated');
      expect(cacheManager.del).toHaveBeenCalled();

      // Check that the refresh tokens cache key for this user was deleted
      const refreshTokenCacheKey = `refresh_tokens_by_user_id_${userId}`;

      const delCalls = cacheManager.del.mock.calls;
      const deletedCacheKey = delCalls.find((call) =>
        call[0].includes('refresh_tokens_by_user_id'),
      )?.[0];

      expect(deletedCacheKey).toBeDefined();
      console.log(
        `All tokens invalidated on password change: ${deletedCacheKey}`,
      );
    });

    it('should generate different refresh tokens for different devices', async () => {
      console.log('Testing: unique tokens for different devices/sessions');

      // 1. Login from first device
      console.log('Logging in from first device');
      const firstDeviceUserAgent = 'Mozilla/5.0 First Device';
      const firstLoginResponse = await request.post(
        '/auth/login',
        {
          email: fixtures.users[0].email,
          password: 'admin123',
        },
        {
          'User-Agent': firstDeviceUserAgent,
        },
      );

      expect(firstLoginResponse.status).toBe(201);
      const firstRefreshToken = firstLoginResponse.body.data.refresh_token;
      console.log('First device login successful');

      // 2. Clear cookies to simulate different device/browser
      request.clearCookies();

      // 3. Login from second device with different user agent
      console.log('Logging in from second device');
      const secondDeviceUserAgent = 'Mozilla/5.0 Second Device';
      const secondLoginResponse = await request.post(
        '/auth/login',
        {
          email: fixtures.users[0].email,
          password: 'admin123',
        },
        {
          'User-Agent': secondDeviceUserAgent,
        },
      );

      expect(secondLoginResponse.status).toBe(201);
      const secondRefreshToken = secondLoginResponse.body.data.refresh_token;
      console.log('Second device login successful');

      // 4. Verify tokens are different
      console.log('Verifying tokens are different for different devices');
      expect(firstRefreshToken).not.toBe(secondRefreshToken);
      console.log(
        'Confirmed different refresh tokens issued for different devices',
      );
    });
  });

  describe('Refresh Token Rotation', () => {
    it('should issue a new refresh token when the current one is used', async () => {
      console.log('Testing: refresh token rotation on use');

      // 1. Login to get initial tokens
      console.log('Logging in to get initial tokens');
      const loginResponse = await request.post('/auth/login', {
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      const initialRefreshToken = loginResponse.body.data.refresh_token;
      console.log('Initial refresh token obtained');

      // 2. Use refresh token to get new access token
      console.log('Using refresh token to get new tokens');
      const refreshResponse = await request.post(
        '/auth/refresh',
        {
          refresh_token: initialRefreshToken,
        },
        {},
      );

      // 3. Verify we get both new access and refresh tokens
      expect(refreshResponse.status).toBe(201);
      expect(refreshResponse.body.data).toHaveProperty('access_token');
      expect(refreshResponse.body.data).toHaveProperty('refresh_token');

      const newRefreshToken = refreshResponse.body.data.refresh_token;
      console.log('New refresh token obtained');

      // 4. Verify the new token is different from the initial one
      expect(newRefreshToken).not.toBe(initialRefreshToken);
      console.log('Refresh token successfully rotated');

      // 5. Verify the old token can't be used again
      console.log('Verifying old token is invalidated');
      const oldTokenResponse = await request.post(
        '/auth/refresh',
        {
          refresh_token: initialRefreshToken,
        },
        {},
      );

      expect(oldTokenResponse.status).toBe(401);
      console.log('Old refresh token correctly invalidated');

      // 6. Verify the new token works
      console.log('Verifying new token is valid');
      const newTokenResponse = await request.post(
        '/auth/refresh',
        {
          refresh_token: newRefreshToken,
        },
        {},
      );

      expect(newTokenResponse.status).toBe(201);
      console.log('New refresh token works correctly');
    });
  });
});
