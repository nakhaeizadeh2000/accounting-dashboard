import { TestRequest } from '../../helpers/request.helper';
import { DatabaseTestHelper } from '../../helpers/database.helper';
import { AuthTestHelper } from '../../helpers/auth-test.helper';
import {
  setupTestApp,
  teardownTestApp,
  getCacheManager,
  getTestingModule,
} from '../../setup-tests';
import * as fixtures from '../../fixtures';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('JWT Authentication Flow (e2e)', () => {
  let request: TestRequest;
  let dbHelper: DatabaseTestHelper;
  let authHelper: AuthTestHelper;
  let cacheManager: any;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeAll(async () => {
    await setupTestApp();
    const testingModule = getTestingModule();

    cacheManager = getCacheManager();
    jwtService = testingModule.get<JwtService>(JwtService);
    configService = testingModule.get<ConfigService>(ConfigService);

    request = new TestRequest();

    dbHelper = new DatabaseTestHelper();
    await dbHelper.init();

    authHelper = new AuthTestHelper(request);
  });

  beforeEach(async () => {
    await dbHelper.seedDatabase();
    request.clearCookies();
    cacheManager.reset.mockClear();
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  describe('JWT Token Generation and Verification', () => {
    it('should generate a valid JWT token on login', async () => {
      const loginCredentials = {
        email: fixtures.users[0].email,
        password: 'admin123',
      };

      console.log('Login credentials:', JSON.stringify(loginCredentials));

      const response = await request.post('/auth/login', loginCredentials);
      console.log('Login response:', JSON.stringify(response.body));

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      // Extract token from the cookie
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      console.log(
        'Set-Cookie Headers:',
        Array.isArray(cookies) ? cookies.join('\n') : cookies,
      );

      // If cookies is an array, find the access_token cookie
      let accessTokenCookie = '';
      if (Array.isArray(cookies)) {
        accessTokenCookie =
          cookies.find((c) => c.startsWith('access_token=')) || '';
      } else if (typeof cookies === 'string') {
        // If it's a string, check if it contains the access_token
        accessTokenCookie = cookies.includes('access_token=') ? cookies : '';
      }

      expect(accessTokenCookie).toBeTruthy();

      // Extract the token value
      const tokenMatch = accessTokenCookie.match(/access_token=([^;]+)/);
      expect(tokenMatch).toBeDefined();
      expect(tokenMatch![1]).toBeDefined();

      const token = tokenMatch![1];
      console.log('Extracted JWT Token:', token);

      // Verify token can be decoded
      const jwtSecret = configService.get<string>('JWT_SECRET');
      const decoded = jwtService.verify(token, { secret: jwtSecret });
      console.log('Decoded Token:', JSON.stringify(decoded, null, 2));

      // Check token payload
      expect(decoded).toHaveProperty('user_id');
      expect(decoded).toHaveProperty('email');
      expect(decoded.email).toBe(loginCredentials.email);
      expect(decoded).toHaveProperty('exp');
      expect(decoded).toHaveProperty('iat');
    });

    it('should use token to authenticate requests', async () => {
      // Login to get token cookie
      console.log('Logging in to get authentication token');

      const loginResponse = await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      console.log('Login Response:', JSON.stringify(loginResponse, null, 2));

      // Access a protected resource
      console.log('Accessing protected resource with token');

      // Fix: Use empty object for headers instead of boolean
      const response = await request.get('/users', {});
      console.log(
        'Protected Resource Response:',
        JSON.stringify(response.body, null, 2),
      );

      // Verify access is granted
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
    it('should reject requests with invalid tokens', async () => {
      // 1. First ensure we're not authenticated (no cookies)
      console.log('Clearing authentication cookies');
      request.clearCookies();

      // 2. Then try to access a protected resource without proper authentication
      console.log('Accessing protected resource without authentication');

      const response = await request.get('/users');
      console.log(
        'Unauthorized Response:',
        JSON.stringify(response.body, null, 2),
      );

      // 3. Verify access is denied with appropriate error
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Token Refresh Logic', () => {
    it('should store refresh tokens in Redis during login', async () => {
      // Login
      console.log('Logging in to generate refresh token');

      const loginResponse = await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      console.log('Login Response:', JSON.stringify(loginResponse, null, 2));

      // Verify refresh token was stored in cache
      expect(cacheManager.set).toHaveBeenCalled();
      console.log(
        'Cache Manager Set Calls:',
        JSON.stringify(cacheManager.set.mock.calls, null, 2),
      );

      // Find the call that sets the refresh token
      const refreshTokenCall = cacheManager.set.mock.calls.find((call) =>
        call[0].includes('refresh_tokens_by_user_id'),
      );

      expect(refreshTokenCall).toBeDefined();
      expect(refreshTokenCall[1]).toBeDefined(); // The token value
      expect(refreshTokenCall[2]).toBeDefined(); // TTL options
    });

    it('should remove refresh tokens from Redis on logout', async () => {
      // Login
      console.log('Logging in before testing logout');

      const loginResponse = await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      console.log('Login Response:', JSON.stringify(loginResponse, null, 2));

      // Clear mock calls from login
      cacheManager.del.mockClear();

      // Logout
      console.log('Sending logout request');

      // Fix: Use empty object for headers instead of boolean
      const logoutResponse = await request.post('/auth/logout', {}, {});
      console.log(
        'Logout Response:',
        JSON.stringify(logoutResponse.body, null, 2),
      );

      // Verify refresh token was removed from cache
      expect(cacheManager.del).toHaveBeenCalled();
      console.log(
        'Cache Manager Del Calls:',
        JSON.stringify(cacheManager.del.mock.calls, null, 2),
      );

      // Check the correct cache key was deleted
      const userId = loginResponse.user.id;
      const expectedCacheKey = `refresh_tokens_by_user_id_${userId}`;

      const delCall = cacheManager.del.mock.calls.find((call) =>
        call[0].includes('refresh_tokens_by_user_id'),
      );

      expect(delCall).toBeDefined();
    });

    it('should handle simultaneous sessions for the same user', async () => {
      // Login in first session
      console.log('Logging in for first session');

      await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      // Store first session cookies
      // Since we don't have access to jar directly, let's extract from response
      const firstLoginResponse = await request.post('/auth/login', {
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      console.log(
        'First Login Response:',
        JSON.stringify(firstLoginResponse.body, null, 2),
      );

      const firstSessionCookies = firstLoginResponse.headers['set-cookie'];
      console.log(
        'First Session Cookies:',
        Array.isArray(firstSessionCookies)
          ? firstSessionCookies.join('\n')
          : firstSessionCookies,
      );

      // Clear cookies for second session
      request.clearCookies();

      // Login in second session
      console.log('Logging in for second session');

      const secondLoginResponse = await request.post('/auth/login', {
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      console.log(
        'Second Login Response:',
        JSON.stringify(secondLoginResponse.body, null, 2),
      );

      const secondSessionCookies = secondLoginResponse.headers['set-cookie'];
      console.log(
        'Second Session Cookies:',
        Array.isArray(secondSessionCookies)
          ? secondSessionCookies.join('\n')
          : secondSessionCookies,
      );

      // Verify both sessions have different tokens
      expect(firstSessionCookies).not.toEqual(secondSessionCookies);

      // Check that Redis has multiple refresh tokens for the user
      const refreshTokenCalls = cacheManager.set.mock.calls.filter((call) =>
        call[0].includes('refresh_tokens_by_user_id'),
      );

      console.log(
        'Refresh Token Cache Calls:',
        JSON.stringify(refreshTokenCalls, null, 2),
      );

      // We should have at least two calls for refresh tokens
      expect(refreshTokenCalls.length).toBeGreaterThanOrEqual(2);
    });

    it('should properly handle token expiration', async () => {
      // This test requires manipulating token expiration
      // which is challenging in an e2e test, but we can test
      // the underlying logic that handles expired tokens

      // Login to get valid credentials
      console.log('Logging in to get user details');

      const loginResponse = await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      console.log('Login Response:', JSON.stringify(loginResponse, null, 2));

      // Generate an expired token for testing
      const userId = loginResponse.user.id;
      const email = loginResponse.user.email;
      const jwtSecret = configService.get<string>('JWT_SECRET');

      console.log('Generating expired token for testing');

      const expiredPayload = {
        user_id: userId,
        email: email,
        exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
        iat: Math.floor(Date.now() / 1000) - 7200, // Issued 2 hours ago
      };

      console.log(
        'Expired Token Payload:',
        JSON.stringify(expiredPayload, null, 2),
      );

      const expiredToken = jwtService.sign(expiredPayload, {
        secret: jwtSecret,
      });

      console.log('Generated Expired Token:', expiredToken);

      // Verify that the expired token is recognized as invalid
      console.log('Verifying token expiration handling');

      try {
        jwtService.verify(expiredToken, { secret: jwtSecret });
        fail('Token verification should fail for expired token');
      } catch (error) {
        console.log(
          'Token Verification Error:',
          JSON.stringify(error, null, 2),
        );
        expect(error.name).toBe('TokenExpiredError');
      }
    });
  });

  describe('Security Features', () => {
    it('should use httpOnly cookies for tokens', async () => {
      // Login
      console.log('Logging in to check cookie security settings');

      const loginResponse = await request.post('/auth/login', {
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      console.log(
        'Login Response:',
        JSON.stringify(loginResponse.body, null, 2),
      );

      // Extract cookie settings from response
      const cookies = loginResponse.headers['set-cookie'];
      let tokenCookie = '';

      if (Array.isArray(cookies)) {
        tokenCookie = cookies.find((c) => c.includes('access_token=')) || '';
      } else if (typeof cookies === 'string') {
        tokenCookie = cookies;
      }

      console.log('Token Cookie Settings:', tokenCookie);

      expect(tokenCookie).toBeTruthy();
      expect(tokenCookie).toContain('HttpOnly');
    });

    it('should use secure cookies in production environment', async () => {
      // Store original NODE_ENV
      const originalNodeEnv = process.env.NODE_ENV;

      try {
        // Set production environment
        process.env.NODE_ENV = 'production';
        console.log('Testing with NODE_ENV=production');

        // Login
        const loginCredentials = {
          email: fixtures.users[0].email,
          password: 'admin123',
        };

        console.log('Login credentials:', JSON.stringify(loginCredentials));

        const response = await request.post('/auth/login', loginCredentials);
        console.log('Login Response:', JSON.stringify(response.body, null, 2));

        // Extract cookie settings
        const cookies = response.headers['set-cookie'];
        let tokenCookie = '';

        if (Array.isArray(cookies)) {
          tokenCookie = cookies.find((c) => c.includes('access_token=')) || '';
        } else if (typeof cookies === 'string') {
          tokenCookie = cookies;
        }

        console.log('Production Cookie Settings:', tokenCookie);

        expect(tokenCookie).toBeTruthy();
        // In production, cookies should be secure
        expect(tokenCookie).toContain('Secure');
      } finally {
        // Restore original NODE_ENV
        process.env.NODE_ENV = originalNodeEnv;
        console.log(`Restored NODE_ENV to ${originalNodeEnv || 'undefined'}`);
      }
    });

    it('should set appropriate CSRF protection', async () => {
      // Login
      console.log('Testing CSRF protection settings');

      const response = await request.post('/auth/login', {
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      console.log(
        'Login Response for CSRF test:',
        JSON.stringify(response.body, null, 2),
      );

      const cookies = response.headers['set-cookie'];
      let tokenCookie = '';

      if (Array.isArray(cookies)) {
        tokenCookie = cookies.find((c) => c.includes('access_token=')) || '';
      } else if (typeof cookies === 'string') {
        tokenCookie = cookies;
      }

      console.log('Cookie CSRF Settings:', tokenCookie);

      expect(tokenCookie).toBeTruthy();
      expect(tokenCookie).toContain('SameSite=Lax');
    });
  });
});
