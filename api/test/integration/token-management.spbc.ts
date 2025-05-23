// import { TestRequest } from '../helpers/request.helper';
// import { DatabaseTestHelper } from '../helpers/database.helper';
// import { AuthTestHelper } from '../helpers/auth-test.helper';
// import {
//   setupTestApp,
//   teardownTestApp,
//   getCacheManager,
//   getTestingModule,
// } from '../setup-tests';
// import * as fixtures from '../fixtures';
// import { JwtService } from '@nestjs/jwt';
// import { ConfigService } from '@nestjs/config';

// describe('JWT Token Management (integration)', () => {
//   let request: TestRequest;
//   let dbHelper: DatabaseTestHelper;
//   let authHelper: AuthTestHelper;
//   let cacheManager: any;
//   let jwtService: JwtService;
//   let configService: ConfigService;

//   beforeAll(async () => {
//     console.log('Setting up test environment for JWT token management tests');
//     await setupTestApp();
//     const testingModule = getTestingModule();

//     cacheManager = getCacheManager();
//     jwtService = testingModule.get<JwtService>(JwtService);
//     configService = testingModule.get<ConfigService>(ConfigService);

//     request = new TestRequest();
//     // No need for request.init() as we're using supertest.agent directly

//     dbHelper = new DatabaseTestHelper();
//     await dbHelper.init();

//     authHelper = new AuthTestHelper(request);
//     console.log('Test environment setup complete');
//   });

//   beforeEach(async () => {
//     console.log('Starting new transaction for test');
//     await dbHelper.startTransaction();
//     await dbHelper.seedDatabase();
//     request.clearCookies();
//     cacheManager.reset.mockClear();
//     console.log('Cache mock functions reset');
//   });

//   afterEach(async () => {
//     console.log('Rolling back transaction after test');
//     await dbHelper.rollbackTransaction();
//   });

//   afterAll(async () => {
//     console.log('Tearing down test environment');
//     await teardownTestApp();
//   });

//   describe('JWT Token Cookies', () => {
//     it('should set access token cookie after successful login', async () => {
//       console.log('Testing: setting access token cookie after login');

//       const loginCredentials = {
//         email: fixtures.users[0].email,
//         password: 'admin123',
//       };

//       console.log(
//         'Logging in with credentials:',
//         JSON.stringify(loginCredentials),
//       );
//       const response = await request.post('/auth/login', loginCredentials);

//       // Check response status
//       console.log('Checking login response status');
//       expect(response.status).toBe(201);
//       console.log('Login successful with status 201');

//       // Check if cookie was set
//       console.log('Checking for cookie in response headers');
//       expect(response.headers['set-cookie']).toBeDefined();
//       const cookies = response.headers['set-cookie'][0];
//       console.log('Cookies received:', cookies);

//       expect(cookies).toContain('access_token=');
//       expect(cookies).toContain('HttpOnly');
//       expect(cookies).toContain('Path=/');
//       console.log('Access token cookie properly set with correct attributes');
//     });

//     it('should clear access token cookie after logout', async () => {
//       console.log('Testing: clearing access token cookie after logout');

//       // Login first
//       console.log('Logging in before testing logout');
//       await authHelper.login({
//         email: fixtures.users[0].email,
//         password: 'admin123',
//       });
//       console.log('Login successful');

//       // Then logout
//       console.log('Performing logout');
//       const response = await request.post('/auth/logout', {}, {});
//       console.log('Logout response received');

//       // Check response status
//       expect(response.status).toBe(200);
//       console.log('Logout successful with status 200');

//       // Check if cookie was cleared
//       console.log('Checking for cookie clearing in response headers');
//       expect(response.headers['set-cookie']).toBeDefined();
//       const cookies = response.headers['set-cookie'][0];
//       console.log('Cookies received:', cookies);

//       expect(cookies).toContain('access_token=;');
//       expect(cookies).toContain('Expires=Thu, 01 Jan 1970 00:00:00 GMT');
//       console.log('Access token cookie properly cleared with expired date');
//     });
//   });

//   describe('JWT Token Validation and Renewal', () => {
//     it('should deny access with invalid JWT token', async () => {
//       console.log('Testing: denying access with invalid JWT token');

//       // Set an invalid token cookie directly
//       console.log('Clearing any existing cookies');
//       request.clearCookies();

//       // Make a request that requires authentication without a token
//       console.log('Requesting protected resource without authentication');
//       const response = await request.get('/users');

//       // Should return 401 Unauthorized
//       console.log('Checking response status');
//       expect(response.status).toBe(401);
//       expect(response.body.success).toBe(false);
//       console.log('Request correctly rejected with 401 Unauthorized');
//     });

//     it('should handle token parsing errors gracefully', async () => {
//       console.log('Testing: graceful handling of malformed tokens');

//       // Login to get a valid session first
//       console.log('Logging in to establish session');
//       const loginResponse = await request.post('/auth/login', {
//         email: fixtures.users[0].email,
//         password: 'admin123',
//       });

//       // Extract cookie and save it but alter it to be invalid
//       console.log('Extracting and modifying token cookie');
//       const cookies = loginResponse.headers['set-cookie'];
//       let tokenCookie = '';

//       if (Array.isArray(cookies)) {
//         tokenCookie = cookies.find((c) => c.includes('access_token=')) || '';
//       } else if (typeof cookies === 'string') {
//         tokenCookie = cookies;
//       }

//       // Create a malformed token by truncating it
//       const tokenMatch = tokenCookie.match(/access_token=([^;]+)/);
//       expect(tokenMatch).toBeDefined();
//       const validToken = tokenMatch[1];
//       const malformedToken = validToken.substring(0, validToken.length - 10);

//       console.log('Original token:', validToken);
//       console.log('Malformed token:', malformedToken);

//       // Clear cookies and set malformed one manually
//       request.clearCookies();

//       // Make a request with malformed token header
//       console.log('Making request with malformed token');
//       const response = await request.get('/users', {
//         Cookie: `access_token=${malformedToken}; Path=/; HttpOnly`,
//       });

//       // Should get auth error
//       expect(response.status).toBe(401);
//       expect(response.body.success).toBe(false);
//       expect(response.body.message).toBeTruthy();
//       console.log('Malformed token correctly results in 401 error');
//     });

//     it('should reject expired tokens', async () => {
//       console.log('Testing: rejection of expired tokens');

//       // Login to get user info
//       console.log('Logging in to get user information');
//       const loginResult = await authHelper.login({
//         email: fixtures.users[0].email,
//         password: 'admin123',
//       });

//       // Create an expired token manually
//       console.log('Creating expired token for testing');
//       const jwtSecret = configService.get<string>('JWT_SECRET');
//       const payload = {
//         sub: loginResult.user.id,
//         email: loginResult.user.email,
//         exp: Math.floor(Date.now() / 1000) - 3600, // expired 1 hour ago
//         iat: Math.floor(Date.now() / 1000) - 7200, // issued 2 hours ago
//       };

//       const expiredToken = jwtService.sign(payload, { secret: jwtSecret });
//       console.log('Generated expired token');

//       // Verify the token is actually expired
//       console.log('Verifying token is expired via JwtService');
//       try {
//         jwtService.verify(expiredToken, { secret: jwtSecret });
//         fail('Token verification should fail for expired token');
//       } catch (error) {
//         expect(error.name).toBe('TokenExpiredError');
//         console.log('Token verified to be expired');
//       }

//       // Clear cookies from login
//       console.log('Clearing existing cookies');
//       request.clearCookies();

//       // Make a request with the expired token
//       console.log('Making request with expired token');
//       const response = await request.get('/users', {
//         Cookie: `access_token=${expiredToken}; Path=/; HttpOnly`,
//       });

//       // Should get auth error
//       expect(response.status).toBe(401);
//       expect(response.body.success).toBe(false);
//       console.log('Expired token correctly rejected with 401 Unauthorized');
//     });
//   });

//   describe('Token Refresh Mechanism', () => {
//     it('should store refresh tokens in Redis cache during login', async () => {
//       console.log('Testing: refresh token storage in Redis cache');

//       // Clear previous mock calls
//       cacheManager.set.mockClear();
//       console.log('Cache mock reset');

//       // Perform login
//       console.log('Logging in to generate refresh token');
//       await authHelper.login({
//         email: fixtures.users[0].email,
//         password: 'admin123',
//       });

//       // Check if refresh token was stored in cache
//       console.log('Verifying refresh token storage in cache');
//       expect(cacheManager.set).toHaveBeenCalled();

//       // Find the specific call that sets the refresh token
//       const refreshTokenCalls = cacheManager.set.mock.calls.filter((call) =>
//         call[0].includes('refresh_token'),
//       );

//       expect(refreshTokenCalls.length).toBeGreaterThan(0);
//       console.log(
//         `Found ${refreshTokenCalls.length} refresh token cache operations`,
//       );

//       // Verify format and TTL of the first refresh token
//       const firstCall = refreshTokenCalls[0];
//       expect(firstCall[0]).toContain('refresh_token');
//       expect(firstCall[1]).toBeTruthy(); // Token value
//       expect(firstCall[2]).toBeDefined(); // TTL options

//       console.log('Refresh token correctly stored in cache');
//     });

//     it('should allow token refresh with valid refresh token', async () => {
//       console.log('Testing: refreshing access token with valid refresh token');

//       // Login to get refresh token
//       console.log('Logging in to obtain refresh token');
//       const loginResponse = await request.post('/auth/login', {
//         email: fixtures.users[0].email,
//         password: 'admin123',
//       });

//       // Extract refresh token from response
//       console.log('Extracting refresh token from login response');
//       expect(loginResponse.body.data).toHaveProperty('refresh_token');
//       const refreshToken = loginResponse.body.data.refresh_token;
//       console.log('Refresh token obtained');

//       // Clear cookies to simulate expired access token
//       console.log('Clearing cookies to simulate expired access token');
//       request.clearCookies();

//       // Request new access token using refresh token
//       console.log('Requesting new access token with refresh token');
//       const refreshResponse = await request.post('/auth/refresh', {
//         refresh_token: refreshToken,
//       });

//       // Check that we got a new access token
//       console.log('Verifying new access token was issued');
//       expect(refreshResponse.status).toBe(201);
//       expect(refreshResponse.body.success).toBe(true);
//       expect(refreshResponse.body.data).toHaveProperty('access_token');

//       // Check that a cookie was set with the new token
//       expect(refreshResponse.headers['set-cookie']).toBeDefined();
//       const cookies = refreshResponse.headers['set-cookie'][0];
//       expect(cookies).toContain('access_token=');
//       console.log('New access token successfully issued via refresh token');

//       // Test that the new token works for authentication
//       console.log('Testing new token with authenticated request');
//       request.saveCookies(refreshResponse);
//       const protectedResponse = await request.get('/users', {});

//       expect(protectedResponse.status).toBe(200);
//       console.log('New access token authentication successful');
//     });

//     it('should reject refresh attempts with invalid refresh tokens', async () => {
//       console.log('Testing: rejecting invalid refresh tokens');

//       // Try to refresh with an invalid token
//       console.log('Attempting to refresh with invalid token');
//       const invalidToken = 'invalid-refresh-token';

//       const refreshResponse = await request.post('/auth/refresh', {
//         refresh_token: invalidToken,
//       });

//       // Check that the request was rejected
//       console.log('Verifying refresh was rejected');
//       expect(refreshResponse.status).toBe(401);
//       expect(refreshResponse.body.success).toBe(false);
//       console.log('Invalid refresh token correctly rejected');
//     });

//     it('should invalidate refresh tokens on logout', async () => {
//       console.log('Testing: invalidation of refresh tokens on logout');

//       // Login to get a valid session
//       console.log('Logging in to establish session');
//       await authHelper.login({
//         email: fixtures.users[0].email,
//         password: 'admin123',
//       });

//       // Clear mock to track just the logout operation
//       cacheManager.del.mockClear();
//       console.log('Cache mock reset before logout');

//       // Perform logout
//       console.log('Logging out');
//       const logoutResponse = await request.post('/auth/logout', {}, {});
//       expect(logoutResponse.status).toBe(200);

//       // Check that refresh token was deleted from cache
//       console.log('Verifying refresh token deletion from cache');
//       expect(cacheManager.del).toHaveBeenCalled();

//       // Find calls related to refresh token deletion
//       const refreshTokenCalls = cacheManager.del.mock.calls.filter((call) =>
//         call[0].includes('refresh_token'),
//       );

//       expect(refreshTokenCalls.length).toBeGreaterThan(0);
//       console.log('Refresh token correctly removed from cache on logout');
//     });
//   });

//   describe('Token Security Features', () => {
//     it('should use httpOnly cookies to prevent XSS', async () => {
//       console.log('Testing: HttpOnly cookie flag for XSS prevention');

//       // Login to get token cookies
//       console.log('Logging in to check cookie settings');
//       const loginResponse = await request.post('/auth/login', {
//         email: fixtures.users[0].email,
//         password: 'admin123',
//       });

//       // Check for HttpOnly flag in cookies
//       console.log('Examining cookie security flags');
//       expect(loginResponse.headers['set-cookie']).toBeDefined();
//       const cookies = loginResponse.headers['set-cookie'][0];
//       expect(cookies).toContain('HttpOnly');

//       console.log('HttpOnly flag confirmed on access token cookie');
//     });

//     it('should use SameSite attribute on cookies for CSRF protection', async () => {
//       console.log('Testing: SameSite cookie attribute for CSRF protection');

//       // Login to get token cookies
//       console.log('Logging in to check cookie settings');
//       const loginResponse = await request.post('/auth/login', {
//         email: fixtures.users[0].email,
//         password: 'admin123',
//       });

//       // Check for SameSite attribute in cookies
//       console.log('Examining cookie CSRF protection');
//       expect(loginResponse.headers['set-cookie']).toBeDefined();
//       const cookies = loginResponse.headers['set-cookie'][0];

//       // In test environment, default to Lax. In production, it should be Strict
//       expect(cookies).toContain('SameSite=Lax');

//       console.log('SameSite attribute confirmed on access token cookie');
//     });

//     it('should use Secure flag in production environment', async () => {
//       console.log('Testing: Secure flag in production environment');

//       // Save original environment
//       const originalNodeEnv = process.env.NODE_ENV;

//       try {
//         // Set to production environment for this test
//         console.log('Temporarily setting NODE_ENV to production');
//         process.env.NODE_ENV = 'production';

//         // Login to get token cookies
//         console.log('Logging in to check production cookie settings');
//         const loginResponse = await request.post('/auth/login', {
//           email: fixtures.users[0].email,
//           password: 'admin123',
//         });

//         // Check for Secure flag in cookies
//         console.log('Examining cookie Secure flag');
//         expect(loginResponse.headers['set-cookie']).toBeDefined();
//         const cookies = loginResponse.headers['set-cookie'][0];
//         expect(cookies).toContain('Secure');

//         console.log('Secure flag confirmed on production access token cookie');
//       } finally {
//         // Restore original environment
//         console.log('Restoring original NODE_ENV');
//         process.env.NODE_ENV = originalNodeEnv;
//       }
//     });
//   });

//   describe('Token Lifetime and Expiration', () => {
//     it('should include appropriate expiration time in token', async () => {
//       console.log('Testing: token expiration time');

//       // Login to get token
//       console.log('Logging in to obtain token');
//       const loginResponse = await request.post('/auth/login', {
//         email: fixtures.users[0].email,
//         password: 'admin123',
//       });

//       // Extract token from cookie
//       console.log('Extracting token from cookie');
//       const cookies = loginResponse.headers['set-cookie'];
//       const tokenCookie = Array.isArray(cookies)
//         ? cookies.find((c) => c.includes('access_token=')) || ''
//         : cookies;

//       const tokenMatch = tokenCookie.match(/access_token=([^;]+)/);
//       expect(tokenMatch).toBeDefined();
//       const token = tokenMatch![1];
//       console.log('Access token extracted from cookie');

//       // Decode token (without verification) to check expiration
//       console.log('Decoding token to check expiration');
//       const decoded = jwtService.decode(token);
//       expect(decoded).toHaveProperty('exp');
//       expect(decoded).toHaveProperty('iat');

//       // Calculate token lifetime in seconds
//       const expiration = (decoded as any).exp;
//       const issuedAt = (decoded as any).iat;
//       const lifespan = expiration - issuedAt;

//       console.log(`Token lifespan: ${lifespan} seconds`);

//       // Check that token has a reasonable expiration (e.g., 15 minutes to 24 hours)
//       // This value should match your application's configuration
//       const minLifespan = 15 * 60; // 15 minutes
//       const maxLifespan = 24 * 60 * 60; // 24 hours

//       expect(lifespan).toBeGreaterThanOrEqual(minLifespan);
//       expect(lifespan).toBeLessThanOrEqual(maxLifespan);

//       console.log('Token has appropriate expiration time');
//     });

//     it('should have longer expiration for refresh tokens than access tokens', async () => {
//       console.log(
//         'Testing: refresh token has longer expiration than access token',
//       );

//       // Check how refresh tokens are stored in cache
//       console.log('Clearing cache mock calls');
//       cacheManager.set.mockClear();

//       // Login to generate both tokens
//       console.log('Logging in to generate tokens');
//       await authHelper.login({
//         email: fixtures.users[0].email,
//         password: 'admin123',
//       });

//       // Find refresh token TTL from cache operations
//       console.log('Examining refresh token TTL in cache operations');
//       const refreshTokenCalls = cacheManager.set.mock.calls.filter((call) =>
//         call[0].includes('refresh_token'),
//       );

//       expect(refreshTokenCalls.length).toBeGreaterThan(0);

//       // Get the TTL option from the cache call
//       const refreshTtlOptions = refreshTokenCalls[0][2];
//       expect(refreshTtlOptions).toBeDefined();
//       expect(refreshTtlOptions).toHaveProperty('ttl');

//       const refreshTtl = refreshTtlOptions.ttl;
//       console.log(`Refresh token TTL: ${refreshTtl} seconds`);

//       // Access token TTL from environment or config
//       const accessTokenTtl = configService.get<number>('JWT_EXPIRATION') || 900; // Default 15 minutes
//       console.log(`Access token TTL: ${accessTokenTtl} seconds`);

//       // Refresh token should live longer than access token
//       expect(refreshTtl).toBeGreaterThan(accessTokenTtl);
//       console.log(
//         'Confirmed refresh token has longer lifespan than access token',
//       );
//     });
//   });
// });
