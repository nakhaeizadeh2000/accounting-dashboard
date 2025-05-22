import { setupTestApp, teardownTestApp } from '../../setup-tests';
import { TestRequest } from '../../helpers/request.helper';
import { DatabaseTestHelper } from '../../helpers/database.helper';
import { AuthTestHelper } from '../../helpers/auth-test.helper';
import * as fixtures from '../../fixtures';
import { cacheManagerMockInstance } from '../../mocks/cache-manager.mock';

describe('Authentication Flow (e2e)', () => {
  let request: TestRequest;
  let dbHelper: DatabaseTestHelper;
  let authHelper: AuthTestHelper;

  beforeAll(async () => {
    await setupTestApp();
    request = new TestRequest();
    dbHelper = new DatabaseTestHelper();
    await dbHelper.init();
    authHelper = new AuthTestHelper(request, dbHelper);
  }, 30000);

  afterAll(async () => {
    // First clear all Redis mocks
    if (
      cacheManagerMockInstance &&
      typeof cacheManagerMockInstance._reset === 'function'
    ) {
      cacheManagerMockInstance._reset();
    }

    // Then teardown with timeout
    await Promise.race([
      teardownTestApp(),
      new Promise((resolve) => setTimeout(resolve, 3000)),
    ]);

    // Add a small delay to let any queued operations complete
    await new Promise((resolve) => setTimeout(resolve, 100));
  }, 10000);

  // Reset between each test for isolation
  beforeEach(async () => {
    // Reset database
    await dbHelper.resetDatabase();
    // Reset Redis mock
    cacheManagerMockInstance._reset();
    // Clear cookies
    request.clearCookies();
  });

  describe('User Registration', () => {
    it('should register a new user', async () => {
      // Use the factory function to create test user data
      const { isAdmin, ...newUser } = fixtures.createUser({
        email: `newuser@example.com`,
        password: 'Password123!',
      });

      console.log('Registration request payload:', JSON.stringify(newUser));

      const response = await request.post('/auth/register', newUser);
      console.log('Registration response:', JSON.stringify(response.body));

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.email).toBe(newUser.email);
      expect(response.body.data.firstName).toBe(newUser.firstName);
      expect(response.body.data.lastName).toBe(newUser.lastName);

      // Verify user exists in database
      const userRepo = dbHelper.getUserRepository();
      const savedUser = await userRepo.findOne({
        where: { email: newUser.email },
      });
      expect(savedUser).toBeDefined();
      expect(savedUser.email).toBe(newUser.email);
    });

    it('should validate password complexity', async () => {
      const userData = fixtures.createUser({
        email: `weakpassword@example.com`,
        password: '123', // Too short/simple
      });

      console.log('Weak password request payload:', JSON.stringify(userData));

      const response = await request.post('/auth/register', userData);
      console.log('Validation response:', JSON.stringify(response.body));

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      // Should contain validation error about password
      expect(response.body.message).toContain('password');
    });

    it('should prevent duplicate email registration', async () => {
      // First create a user
      const email = `duplicate@example.com`;

      // Register first user
      const firstUser = fixtures.createUser({
        email,
        password: 'Password123!',
      });

      console.log('First user request:', JSON.stringify(firstUser));

      const firstResponse = await request.post('/auth/register', firstUser);
      console.log('First user response:', JSON.stringify(firstResponse.body));

      expect(firstResponse.statusCode).toBe(201);

      // Try to register with the same email
      const secondUser = fixtures.createUser({
        email, // Same email as first user
        password: 'Password456!',
        firstName: 'Duplicate',
        lastName: 'Email',
      });

      console.log('Duplicate email request:', JSON.stringify(secondUser));

      const response = await request.post('/auth/register', secondUser);
      console.log('Duplicate email response:', JSON.stringify(response.body));

      expect(response.statusCode).toBe(409);
      expect(response.body.success).toBe(false);
      // Should contain error about duplicate email
      expect(response.body.message.toLowerCase()).toContain('email');
    });
  });

  describe('User Login', () => {
    it('should login a user and return JWT token', async () => {
      // Create a test user using the factory
      const userData = fixtures.createUser({
        email: `loginuser@example.com`,
        password: 'Password123!',
      });

      // Use the plaintext password before it gets hashed
      const plainTextPassword = userData.password;

      // Register the user
      console.log('Register user for login test:', JSON.stringify(userData));
      const registerResponse = await request.post('/auth/register', userData);
      console.log('Register response:', JSON.stringify(registerResponse.body));

      expect(registerResponse.statusCode).toBe(201);

      // Now try to login
      const loginData = {
        email: userData.email,
        password: plainTextPassword,
      };

      console.log('Login request:', JSON.stringify(loginData));

      const response = await request.post('/auth/login', loginData);
      console.log('Login response:', JSON.stringify(response.body));

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(userData.email);

      // Test sets cookie
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('access_token');

      // Store cookie for subsequent tests
      request.saveCookies(response);
    });

    it('should reject login with invalid credentials', async () => {
      const loginData = {
        email: `nonexistent@example.com`,
        password: 'WrongPassword123!',
      };

      console.log('Invalid login request:', JSON.stringify(loginData));

      const response = await request.post('/auth/login', loginData);
      console.log('Invalid login response:', JSON.stringify(response.body));

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject login with correct email but wrong password', async () => {
      // Create a test user
      const userData = fixtures.createUser({
        email: `wrongpass@example.com`,
        password: 'Password123!',
      });

      // Register the user
      await request.post('/auth/register', userData);

      // Try to login with wrong password
      const loginData = {
        email: userData.email,
        password: 'WrongPassword123!',
      };

      const response = await request.post('/auth/login', loginData);

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Protected Routes', () => {
    it('should allow access to protected routes with valid token', async () => {
      // Use AuthTestHelper to register and login
      const userData = fixtures.createUser({
        email: `protected@example.com`,
        password: 'Password123!',
      });

      // Register and login the user
      await authHelper.registerAndLogin(userData);

      // Try to access a protected route
      const response = await request.get('/users/profile', true); // true = withAuth

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.email).toBe(userData.email);
    });

    it('should deny access to protected routes without token', async () => {
      // Clear any existing cookies
      request.clearCookies();

      // Try to access a protected route without authentication
      const response = await request.get('/users/profile');

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should deny access with an invalid token', async () => {
      // Set an invalid token cookie
      request.withHeaders({
        Authorization: 'Bearer invalid.token.here',
      });

      // Try to access a protected route with invalid token
      const response = await request.get('/users/profile', true);

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Logout', () => {
    it('should successfully log out a user', async () => {
      // Use AuthTestHelper to register and login
      const userData = fixtures.createUser({
        email: `logout@example.com`,
        password: 'Password123!',
      });

      await authHelper.registerAndLogin(userData);

      // Verify we're logged in by accessing a protected route
      const profileResponse = await request.get('/users/profile', true);
      expect(profileResponse.statusCode).toBe(200);

      // Logout
      const logoutResponse = await request.post('/auth/logout', {}, true);
      expect(logoutResponse.statusCode).toBe(200);
      expect(logoutResponse.body.success).toBe(true);

      // Cookies should be cleared
      expect(logoutResponse.headers['set-cookie']).toBeDefined();
      expect(logoutResponse.headers['set-cookie'][0]).toContain(
        'access_token=;',
      );

      // Update our stored cookies
      request.saveCookies(logoutResponse);

      // Verify we're logged out by trying to access a protected route
      const afterLogoutResponse = await request.get('/users/profile', true);
      expect(afterLogoutResponse.statusCode).toBe(401);
    });

    it('should allow re-login after logout', async () => {
      // Use AuthTestHelper to register and login
      const userData = fixtures.createUser({
        email: `relogin@example.com`,
        password: 'Password123!',
      });

      // Save password before it gets hashed in the registration process
      const password = userData.password;

      await authHelper.registerAndLogin(userData);

      // Logout
      await authHelper.logout();

      // Try to login again
      const reloginResponse = await request.post('/auth/login', {
        email: userData.email,
        password: password,
      });

      expect(reloginResponse.statusCode).toBe(201);
      expect(reloginResponse.body.success).toBe(true);

      // Save the new cookies
      request.saveCookies(reloginResponse);

      // Verify we can access protected routes again
      const profileResponse = await request.get('/users/profile', true);
      expect(profileResponse.statusCode).toBe(200);
    });
  });
});
