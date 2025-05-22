// import {
//   setupTestApp,
//   teardownTestApp,
//   getCacheManager,
//   getTestingModule,
// } from '../../setup-tests';
// import { TestRequest } from '../../helpers/request.helper';
// import { DatabaseTestHelper } from '../../helpers/database.helper';
// import { AuthTestHelper } from '../../helpers/auth-test.helper';
// import * as fixtures from '../../fixtures';
// import { JwtService } from '@nestjs/jwt';
// import { ConfigService } from '@nestjs/config';

// describe('JWT Authentication Flow (e2e)', () => {
//   let request: TestRequest;
//   let dbHelper: DatabaseTestHelper;
//   let authHelper: AuthTestHelper;
//   let cacheManager: any;
//   let jwtService: JwtService;
//   let configService: ConfigService;

//   // Set up once for all tests
//   beforeAll(async () => {
//     await setupTestApp();
//     const testingModule = getTestingModule();

//     // Get services from the test module
//     cacheManager = getCacheManager();
//     jwtService = testingModule.get<JwtService>(JwtService);
//     configService = testingModule.get<ConfigService>(ConfigService);

//     // Initialize test helpers
//     request = new TestRequest();
//     dbHelper = new DatabaseTestHelper();
//     await dbHelper.init();
//     authHelper = new AuthTestHelper(request, dbHelper);

//     console.log('✅ Test environment setup complete for JWT flow tests');
//   });

//   // Clean up after all tests
//   afterAll(async () => {
//     await teardownTestApp();
//   });

//   // Set up each test with transaction isolation
//   beforeEach(async () => {
//     // Start transaction for test isolation
//     await dbHelper.startTransaction();

//     // Seed test data within the transaction
//     await dbHelper.seedDatabase();

//     // Clear any previous cookies
//     request.clearCookies();

//     // Reset cache manager mocks
//     cacheManager.reset.mockClear();
//     cacheManager.get.mockClear();
//     cacheManager.set.mockClear();
//     cacheManager.del.mockClear();
//   });

//   // Clean up after each test
//   afterEach(async () => {
//     // Roll back transaction
//     await dbHelper.rollbackTransaction();
//   });

//   describe('JWT Token Generation and Verification', () => {
//     it('should generate a valid JWT token on login', async () => {
//       // Use a specific user from fixtures for consistent testing
//       const loginCredentials = fixtures.userCredentials.admin;

//       console.log('Login credentials:', JSON.stringify(loginCredentials));

//       const response = await request.post('/auth/login', loginCredentials);
//       console.log('Login response:', JSON.stringify(response.body));

//       expect(response.statusCode).toBe(201);
//       expect(response.body.success).toBe(true);

//       // Extract token from the cookie
//       const cookies = response.headers['set-cookie'];
//       expect(cookies).toBeDefined();
//       console.log(
//         'Set-Cookie Headers:',
//         Array.isArray(cookies) ? cookies.join('\n') : cookies,
//       );

//       // If cookies is an array, find the access_token cookie
//       let accessTokenCookie = '';
//       if (Array.isArray(cookies)) {
//         accessTokenCookie =
//           cookies.find((c) => c.startsWith('access_token=')) || '';
//       } else if (typeof cookies === 'string') {
//         // If it's a string, check if it contains the access_token
//         accessTokenCookie = cookies.includes('access_token=') ? cookies : '';
//       }

//       expect(accessTokenCookie).toBeTruthy();

//       // Extract the token value
//       const tokenMatch = accessTokenCookie.match(/access_token=([^;]+)/);
//       expect(tokenMatch).toBeDefined();
//       expect(tokenMatch![1]).toBeDefined();

//       const token = tokenMatch![1];
//       console.log('Extracted JWT Token:', token);

//       // Verify token can be decoded
//       const jwtSecret = configService.get<string>('JWT_SECRET');
//       const decoded = jwtService.verify(token, { secret: jwtSecret });
//       console.log('Decoded Token:', JSON.stringify(decoded, null, 2));

//       // Check token payload
//       expect(decoded).toHaveProperty('user_id');
//       expect(decoded).toHaveProperty('email');
//       expect(decoded.email).toBe(loginCredentials.email);
//       expect(decoded).toHaveProperty('exp');
//       expect(decoded).toHaveProperty('iat');
//     });

//     it('should use token to authenticate requests', async () => {
//       // Login to get token cookie
//       console.log('Logging in to get authentication token');

//       await authHelper.login(fixtures.userCredentials.admin);

//       // Access a protected resource
//       console.log('Accessing protected resource with token');
//       const response = await request.get('/users/profile', true);

//       console.log(
//         'Protected Resource Response:',
//         JSON.stringify(response.body, null, 2),
//       );

//       // Verify access is granted
//       expect(response.statusCode).toBe(200);
//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toHaveProperty('email');
//       expect(response.body.data.email).toBe(
//         fixtures.userCredentials.admin.email,
//       );
//     });

//     it('should reject requests with invalid tokens', async () => {
//       // Clear any existing cookies
//       request.clearCookies();

//       // Add an invalid token as an authorization header
//       request.withHeaders({
//         Authorization: 'Bearer invalid.token.string',
//       });

//       // Try to access a protected resource with invalid token
//       console.log('Accessing protected resource with invalid token');
//       const response = await request.get('/users/profile', true);

//       console.log(
//         'Unauthorized Response:',
//         JSON.stringify(response.body, null, 2),
//       );

//       // Verify access is denied
//       expect(response.statusCode).toBe(401);
//       expect(response.body.success).toBe(false);
//     });

//     it('should extract user information from token', async () => {
//       // Login with admin user
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Access user profile
//       const profileResponse = await request.get('/users/profile', true);
//       console.log(
//         'Profile Response:',
//         JSON.stringify(profileResponse.body, null, 2),
//       );

//       // Verify user data in response matches logged in user
//       expect(profileResponse.statusCode).toBe(200);
//       expect(profileResponse.body.data).toHaveProperty('email');
//       expect(profileResponse.body.data.email).toBe(
//         fixtures.userCredentials.admin.email,
//       );
//       expect(profileResponse.body.data).toHaveProperty('firstName');
//       expect(profileResponse.body.data).toHaveProperty('lastName');
//     });
//   });

//   describe('Token Refresh Logic', () => {
//     it('should store refresh tokens in Redis during login', async () => {
//       // Login
//       console.log('Logging in to generate refresh token');

//       const loginResponse = await authHelper.login(
//         fixtures.userCredentials.admin,
//       );
//       console.log('Login Response:', JSON.stringify(loginResponse, null, 2));

//       // Verify refresh token was stored in cache
//       expect(cacheManager.set).toHaveBeenCalled();

//       // Find the call that sets the refresh token
//       const refreshTokenCall = cacheManager.set.mock.calls.find((call) =>
//         call[0].includes('refresh_tokens_by_user_id'),
//       );

//       expect(refreshTokenCall).toBeDefined();
//       expect(refreshTokenCall[1]).toBeDefined(); // The token value
//       expect(refreshTokenCall[2]).toBeDefined(); // TTL options
//     });

//     it('should remove refresh tokens from Redis on logout', async () => {
//       // Login
//       console.log('Logging in before testing logout');

//       const loginResponse = await authHelper.login(
//         fixtures.userCredentials.admin,
//       );
//       console.log('Login Response:', JSON.stringify(loginResponse, null, 2));

//       // Clear mock calls from login
//       cacheManager.del.mockClear();

//       // Logout
//       console.log('Sending logout request');
//       const logoutResponse = await request.post('/auth/logout', {}, true);

//       console.log(
//         'Logout Response:',
//         JSON.stringify(logoutResponse.body, null, 2),
//       );

//       // Verify refresh token was removed from cache
//       expect(cacheManager.del).toHaveBeenCalled();

//       // Check the cache delete calls
//       const delCall = cacheManager.del.mock.calls.find((call) =>
//         call[0].includes('refresh_tokens_by_user_id'),
//       );

//       expect(delCall).toBeDefined();
//     });

//     it('should handle simultaneous sessions for the same user', async () => {
//       // Login in first session
//       console.log('Logging in for first session');

//       const firstLoginResponse = await request.post(
//         '/auth/login',
//         fixtures.userCredentials.admin,
//       );
//       console.log(
//         'First Login Response:',
//         JSON.stringify(firstLoginResponse.body, null, 2),
//       );

//       // Save first session cookies
//       const firstSessionCookies = firstLoginResponse.headers['set-cookie'];

//       // Clear cookies for second session
//       request.clearCookies();

//       // Login in second session
//       console.log('Logging in for second session');
//       const secondLoginResponse = await request.post(
//         '/auth/login',
//         fixtures.userCredentials.admin,
//       );

//       console.log(
//         'Second Login Response:',
//         JSON.stringify(secondLoginResponse.body, null, 2),
//       );

//       const secondSessionCookies = secondLoginResponse.headers['set-cookie'];

//       // Verify both sessions have different tokens
//       expect(firstSessionCookies).not.toEqual(secondSessionCookies);

//       // Check that Redis has multiple refresh tokens for the user
//       const refreshTokenCalls = cacheManager.set.mock.calls.filter((call) =>
//         call[0].includes('refresh_tokens_by_user_id'),
//       );

//       console.log(
//         'Refresh Token Cache Calls:',
//         JSON.stringify(refreshTokenCalls, null, 2),
//       );

//       // We should have at least two calls for refresh tokens
//       expect(refreshTokenCalls.length).toBeGreaterThanOrEqual(2);
//     });

//     it('should properly handle token expiration', async () => {
//       // Login to get valid credentials
//       console.log('Logging in to get user details');

//       const loginResponse = await authHelper.login(
//         fixtures.userCredentials.admin,
//       );
//       console.log('Login Response:', JSON.stringify(loginResponse, null, 2));

//       // Generate an expired token for testing
//       const userId = loginResponse.user.id;
//       const email = loginResponse.user.email;
//       const jwtSecret = configService.get<string>('JWT_SECRET');

//       console.log('Generating expired token for testing');

//       const expiredPayload = {
//         user_id: userId,
//         email: email,
//         exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
//         iat: Math.floor(Date.now() / 1000) - 7200, // Issued 2 hours ago
//       };

//       console.log(
//         'Expired Token Payload:',
//         JSON.stringify(expiredPayload, null, 2),
//       );

//       const expiredToken = jwtService.sign(expiredPayload, {
//         secret: jwtSecret,
//       });

//       console.log('Generated Expired Token:', expiredToken);

//       // Verify that the expired token is recognized as invalid
//       console.log('Verifying token expiration handling');

//       try {
//         jwtService.verify(expiredToken, { secret: jwtSecret });
//         fail('Token verification should fail for expired token');
//       } catch (error) {
//         console.log('Token Verification Error:', error.name);
//         expect(error.name).toBe('TokenExpiredError');
//       }

//       // Try using the expired token for a request
//       request.clearCookies();
//       request.withHeaders({
//         Authorization: `Bearer ${expiredToken}`,
//       });

//       const response = await request.get('/users/profile', true);
//       expect(response.statusCode).toBe(401);
//     });
//   });

//   describe('Security Features', () => {
//     it('should use httpOnly cookies for tokens', async () => {
//       // Login
//       console.log('Logging in to check cookie security settings');

//       const loginResponse = await request.post(
//         '/auth/login',
//         fixtures.userCredentials.admin,
//       );
//       console.log(
//         'Login Response:',
//         JSON.stringify(loginResponse.body, null, 2),
//       );

//       // Extract cookie settings from response
//       const cookies = loginResponse.headers['set-cookie'];
//       let tokenCookie = '';

//       if (Array.isArray(cookies)) {
//         tokenCookie = cookies.find((c) => c.includes('access_token=')) || '';
//       } else if (typeof cookies === 'string') {
//         tokenCookie = cookies;
//       }

//       console.log('Token Cookie Settings:', tokenCookie);

//       expect(tokenCookie).toBeTruthy();
//       expect(tokenCookie).toContain('HttpOnly');
//     });

//     it('should use secure cookies in production environment', async () => {
//       // Store original NODE_ENV
//       const originalNodeEnv = process.env.NODE_ENV;

//       try {
//         // Set production environment
//         process.env.NODE_ENV = 'production';
//         console.log('Testing with NODE_ENV=production');

//         // Login
//         const loginCredentials = fixtures.userCredentials.admin;
//         console.log('Login credentials:', JSON.stringify(loginCredentials));

//         const response = await request.post('/auth/login', loginCredentials);
//         console.log('Login Response:', JSON.stringify(response.body, null, 2));

//         // Extract cookie settings
//         const cookies = response.headers['set-cookie'];
//         let tokenCookie = '';

//         if (Array.isArray(cookies)) {
//           tokenCookie = cookies.find((c) => c.includes('access_token=')) || '';
//         } else if (typeof cookies === 'string') {
//           tokenCookie = cookies;
//         }

//         console.log('Production Cookie Settings:', tokenCookie);

//         expect(tokenCookie).toBeTruthy();
//         // In production, cookies should be secure
//         expect(tokenCookie).toContain('Secure');
//       } finally {
//         // Restore original NODE_ENV
//         process.env.NODE_ENV = originalNodeEnv;
//         console.log(`Restored NODE_ENV to ${originalNodeEnv || 'undefined'}`);
//       }
//     });

//     it('should set appropriate CSRF protection', async () => {
//       // Login
//       console.log('Testing CSRF protection settings');

//       const response = await request.post(
//         '/auth/login',
//         fixtures.userCredentials.admin,
//       );
//       console.log(
//         'Login Response for CSRF test:',
//         JSON.stringify(response.body, null, 2),
//       );

//       const cookies = response.headers['set-cookie'];
//       let tokenCookie = '';

//       if (Array.isArray(cookies)) {
//         tokenCookie = cookies.find((c) => c.includes('access_token=')) || '';
//       } else if (typeof cookies === 'string') {
//         tokenCookie = cookies;
//       }

//       console.log('Cookie CSRF Settings:', tokenCookie);

//       expect(tokenCookie).toBeTruthy();
//       expect(tokenCookie).toContain('SameSite=Lax');
//     });
//     it('should prevent token theft via XSS', async () => {
//       // Login to get a token
//       const loginResponse = await request.post(
//         '/auth/login',
//         fixtures.userCredentials.admin,
//       );

//       // Extract cookie settings from response
//       const cookies = loginResponse.headers['set-cookie'];
//       let tokenCookie = '';

//       if (Array.isArray(cookies)) {
//         tokenCookie = cookies.find((c) => c.includes('access_token=')) || '';
//       } else if (typeof cookies === 'string') {
//         tokenCookie = cookies;
//       }

//       // Verify the cookie has protection against JavaScript access (HttpOnly)
//       expect(tokenCookie).toContain('HttpOnly');

//       // Verify the cookie expires (not a session cookie)
//       expect(tokenCookie).toMatch(/Expires=.+/);

//       // For SameSite protection
//       expect(tokenCookie).toMatch(/SameSite=(Lax|Strict)/);
//     });

//     it('should ensure tokens have appropriate expiry times', async () => {
//       // Login to get a token
//       const loginResponse = await request.post(
//         '/auth/login',
//         fixtures.userCredentials.admin,
//       );

//       // Extract token from the response
//       const tokenValue = loginResponse.body.data.accessToken;
//       expect(tokenValue).toBeDefined();

//       // Get the JWT secret
//       const jwtSecret = configService.get<string>('JWT_SECRET');

//       // Decode the token to check its expiry
//       const decoded = jwtService.verify(tokenValue, { secret: jwtSecret });

//       // Check that the token has expiration claims
//       expect(decoded).toHaveProperty('exp');
//       expect(decoded).toHaveProperty('iat');

//       // Verify expiration is reasonable (e.g., between 15 min and 24 hours in the future)
//       const now = Math.floor(Date.now() / 1000);
//       const fifteenMinutesInSeconds = 15 * 60;
//       const oneDayInSeconds = 24 * 60 * 60;

//       expect(decoded.exp).toBeGreaterThan(now + fifteenMinutesInSeconds);
//       expect(decoded.exp).toBeLessThan(now + oneDayInSeconds);

//       // Verify issued at time is recent
//       expect(decoded.iat).toBeGreaterThanOrEqual(now - 60); // Within last minute
//       expect(decoded.iat).toBeLessThanOrEqual(now + 60); // Allow for small clock differences
//     });
//   });

//   describe('Authorization Headers', () => {
//     it('should accept tokens via Authorization header', async () => {
//       // First login to get a token
//       const loginResponse = await request.post(
//         '/auth/login',
//         fixtures.userCredentials.admin,
//       );

//       // Get token from response
//       const token = loginResponse.body.data.accessToken;

//       // Clear cookies to ensure we're not using cookie auth
//       request.clearCookies();

//       // Set authorization header
//       request.withHeaders({
//         Authorization: `Bearer ${token}`,
//       });

//       // Try to access a protected route
//       const response = await request.get('/users/profile', true);

//       // Verify we can access protected routes with the token
//       expect(response.statusCode).toBe(200);
//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toHaveProperty('email');
//       expect(response.body.data.email).toBe(
//         fixtures.userCredentials.admin.email,
//       );
//     });

//     it('should reject malformed Authorization headers', async () => {
//       // Test with various malformed headers
//       const testCases = [
//         { header: 'Token abc123', name: 'wrong scheme' },
//         { header: 'Bearer', name: 'missing token' },
//         { header: 'Bearer ', name: 'empty token' },
//         { header: 'Bearer abc123 extra', name: 'extra content' },
//       ];

//       for (const testCase of testCases) {
//         console.log(`Testing Authorization header with ${testCase.name}`);

//         request.clearCookies();
//         request.clearHeaders();

//         request.withHeaders({
//           Authorization: testCase.header,
//         });

//         const response = await request.get('/users/profile', true);

//         expect(response.statusCode).toBe(401);
//         expect(response.body.success).toBe(false);
//       }
//     });

//     it('should prioritize valid token in cookie over invalid Authorization header', async () => {
//       // Login to get a valid cookie
//       const loginResponse = await request.post(
//         '/auth/login',
//         fixtures.userCredentials.admin,
//       );
//       request.saveCookies(loginResponse);

//       // Add an invalid Authorization header
//       request.withHeaders({
//         Authorization: 'Bearer invalid.token.value',
//       });

//       // Access a protected route
//       const response = await request.get('/users/profile', true);

//       // Should still work because of the valid cookie
//       expect(response.statusCode).toBe(200);
//       expect(response.body.success).toBe(true);
//     });
//   });

//   describe('Token Claims Validation', () => {
//     it('should validate standard JWT claims in tokens', async () => {
//       // Login to get a valid user and secret for token generation
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Get JWT secret
//       const jwtSecret = configService.get<string>('JWT_SECRET');

//       // Create a token with invalid standard claims
//       const invalidClaims = [
//         {
//           name: 'expired token',
//           payload: {
//             user_id: 'user-123',
//             email: 'test@example.com',
//             exp: Math.floor(Date.now() / 1000) - 3600, // Expired one hour ago
//           },
//         },
//         {
//           name: 'future issued token',
//           payload: {
//             user_id: 'user-123',
//             email: 'test@example.com',
//             iat: Math.floor(Date.now() / 1000) + 3600, // Issued one hour in the future
//             exp: Math.floor(Date.now() / 1000) + 7200, // Expires two hours in the future
//           },
//         },
//         {
//           name: 'wrong audience',
//           payload: {
//             user_id: 'user-123',
//             email: 'test@example.com',
//             aud: 'wrong-audience',
//             exp: Math.floor(Date.now() / 1000) + 3600,
//           },
//         },
//       ];

//       for (const { name, payload } of invalidClaims) {
//         console.log(`Testing JWT claim validation: ${name}`);

//         // Generate token with invalid claims
//         const token = jwtService.sign(payload, { secret: jwtSecret });

//         // Reset request state
//         request.clearCookies();
//         request.clearHeaders();

//         // Set token in Authorization header
//         request.withHeaders({
//           Authorization: `Bearer ${token}`,
//         });

//         // Try to access a protected route
//         const response = await request.get('/users/profile', true);

//         // Should be rejected due to invalid claims
//         expect(response.statusCode).toBe(401);
//         expect(response.body.success).toBe(false);
//       }
//     });

//     it('should validate custom claims in tokens', async () => {
//       // This test checks custom claims validation if your app implements it
//       // For example, validating that user_id or email exists

//       // Login to get valid user details
//       const loginResponse = await authHelper.login(
//         fixtures.userCredentials.admin,
//       );
//       const userId = loginResponse.user.id;

//       // Get JWT secret
//       const jwtSecret = configService.get<string>('JWT_SECRET');

//       // Create a token with missing user_id
//       const token = jwtService.sign(
//         {
//           // No user_id claim
//           email: 'test@example.com',
//           exp: Math.floor(Date.now() / 1000) + 3600,
//         },
//         { secret: jwtSecret },
//       );

//       // Reset request state
//       request.clearCookies();
//       request.clearHeaders();

//       // Set token in Authorization header
//       request.withHeaders({
//         Authorization: `Bearer ${token}`,
//       });

//       // Try to access a protected route
//       const response = await request.get('/users/profile', true);

//       // Should be rejected due to missing custom claims
//       // Note: This assertion may vary based on your implementation
//       expect(response.statusCode).toBe(401);
//     });
//   });
// });
