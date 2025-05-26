import { TestContext } from '../../context/test-context';
import * as fixtures from '../../fixtures';

/**
 * Authentication Flow E2E Tests
 *
 * This file tests the complete authentication flow including:
 * - User registration
 * - Login
 * - Protected routes access
 * - Logout
 *
 * Each test file gets its own isolated database schema and Redis database
 * for true parallel execution at the file level.
 */
describe('Authentication Flow (e2e)', () => {
  // Create a single test context for this entire test file
  const testContext = new TestContext();

  // Setup and teardown for the entire test file
  beforeAll(async () => {
    // Initialize the test context - this creates an isolated app instance
    // with its own database schema and Redis database
    await testContext.initialize();
    console.log(`Test running with schema: ${testContext.getSchemaName()}`);
  }, 60000); // Increased timeout for container startup

  afterAll(async () => {
    // Clean up all resources used by this test file
    console.log(`Cleaning up test schema: ${testContext.getSchemaName()}`);
    await testContext.cleanup();
  }, 15000);

  // Reset database state before each test
  beforeEach(async () => {
    await testContext.reset();
  });

  /**
   * User Registration Tests
   */
  describe('User Registration', () => {
    it('should register a new user', async () => {
      // Use the factory function to create test user data
      const newUser = fixtures.createSimpleUser({
        email: `newuser@example.com`,
        password: 'Password123!',
      });

      console.log('Registration request payload:', JSON.stringify(newUser));

      const response = await testContext.request.post(
        '/auth/register',
        newUser,
      );
      console.log('Registration response:', JSON.stringify(response.body));

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.email).toBe(newUser.email);
      expect(response.body.data.firstName).toBe(newUser.firstName);
      expect(response.body.data.lastName).toBe(newUser.lastName);

      // Verify user exists in database
      const userRepo = testContext.dbHelper.getUserRepository();
      const savedUser = await userRepo.findOne({
        where: { email: newUser.email },
      });
      expect(savedUser).toBeDefined();
      expect(savedUser.email).toBe(newUser.email);
    });

    it('should validate password complexity', async () => {
      const userData = fixtures.createSimpleUser({
        email: `weakpassword@example.com`,
        password: '123', // Too short/simple
      });

      console.log('Weak password request payload:', JSON.stringify(userData));

      const response = await testContext.request.post(
        '/auth/register',
        userData,
      );
      console.log('Validation response:', JSON.stringify(response.body));

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      // Should contain validation error about password
      expect(response.body.validationErrors).toHaveProperty('password');
    });

    it('should prevent duplicate email registration', async () => {
      // First create a user
      const email = `duplicate@example.com`;

      // Register first user
      const firstUser = fixtures.createSimpleUser({
        email,
        password: 'Password123!',
      });

      console.log('First user request:', JSON.stringify(firstUser));

      const firstResponse = await testContext.request.post(
        '/auth/register',
        firstUser,
      );
      console.log('First user response:', JSON.stringify(firstResponse.body));

      expect(firstResponse.statusCode).toBe(201);

      // Try to register with the same email
      const secondUser = fixtures.createSimpleUser({
        email, // Same email as first user
        password: 'Password456!',
        firstName: 'Duplicate',
        lastName: 'Email',
      });

      console.log('Duplicate email request:', JSON.stringify(secondUser));

      const response = await testContext.request.post(
        '/auth/register',
        secondUser,
      );
      console.log('Duplicate email response:', JSON.stringify(response.body));

      expect(response.statusCode).toBe(409);
      expect(response.body.success).toBe(false);
      // Should contain error about duplicate email
      expect(
        response.body.message?.some((msg) =>
          msg.includes('ایمیل مورد نظر قبلا استفاده شده است'),
        ),
      ).toBe(true);
    });
  });

  /**
   * User Login Tests
   */
  describe('User Login', () => {
    it('should login a user and return JWT token', async () => {
      // Create a test user using the factory
      const userData = fixtures.createSimpleUser({
        email: `loginuser@example.com`,
        password: 'Password123!',
      });

      // Use the plaintext password before it gets hashed
      const plainTextPassword = userData.password;

      // Register the user
      console.log('Register user for login test:', JSON.stringify(userData));
      const registerResponse = await testContext.request.post(
        '/auth/register',
        userData,
      );
      console.log('Register response:', JSON.stringify(registerResponse.body));

      expect(registerResponse.statusCode).toBe(201);

      // Now try to login
      const loginData = {
        email: userData.email,
        password: plainTextPassword,
      };

      console.log('Login request:', JSON.stringify(loginData));

      const response = await testContext.request.post('/auth/login', loginData);
      console.log('Login response:', JSON.stringify(response.body));

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.access_token).toBeDefined();
      expect(response.body.data.cookie_expires_in).toBeDefined();

      // Test sets cookie
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('access_token');

      // Store cookie for subsequent tests
      testContext.request.saveCookies(response);
    });

    it('should reject login with invalid credentials', async () => {
      const loginData = {
        email: `nonexistent@example.com`,
        password: 'WrongPassword123!',
      };

      console.log('Invalid login request:', JSON.stringify(loginData));

      const response = await testContext.request.post('/auth/login', loginData);
      console.log('Invalid login response:', JSON.stringify(response.body));

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
      expect(
        response.body.message?.some((msg) =>
          msg.includes('کاربری با این مشخصات وجود ندارد'),
        ),
      ).toBe(true);
    });

    it('should reject login with correct email but wrong password', async () => {
      // Create a test user
      const userData = fixtures.createSimpleUser({
        email: `wrongpass@example.com`,
        password: 'Password123!',
      });

      // Register the user
      await testContext.request.post('/auth/register', userData);

      // Try to login with wrong password
      const loginData = {
        email: userData.email,
        password: 'WrongPassword123!',
      };

      const response = await testContext.request.post('/auth/login', loginData);

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
      expect(
        response.body.message?.some((msg) =>
          msg.includes('کاربری با این مشخصات وجود ندارد'),
        ),
      ).toBe(true);
    });
  });

  /**
   * Protected Routes Tests
   */
  describe('Protected Routes', () => {
    it('should allow access to protected routes with valid token', async () => {
      // Use AuthTestHelper to register and login
      const userData = fixtures.createSimpleUser({
        email: `protected@example.com`,
        password: 'Password123!',
      });

      // Register and login the user
      await testContext.authHelper.registerAndLogin(userData);

      // Try to access a protected route
      const response = await testContext.request.get(
        '/article/noPermission',
        true,
      ); // true = withAuth

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should deny access to protected routes without token', async () => {
      // Try to access a protected route without authentication
      const response = await testContext.request.get(
        '/article/noPermission',
        false,
      );

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should deny access with an invalid token', async () => {
      // Set an invalid token
      testContext.request.setInvalidAuthToken();

      // Try to access a protected route with invalid token
      const response = await testContext.request.get(
        '/article/noPermission',
        true,
      );

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  /**
   * Logout Tests
   */
  describe('Logout', () => {
    it('should successfully log out a user', async () => {
      // Use AuthTestHelper to register and login
      const userData = fixtures.createSimpleUser({
        email: `logout@example.com`,
        password: 'Password123!',
      });

      await testContext.authHelper.registerAndLogin(userData);

      // Verify we're logged in by accessing a protected route
      const profileResponse = await testContext.request.get(
        '/article/noPermission',
        true,
      );
      expect(profileResponse.statusCode).toBe(200);

      // Logout
      const logoutResponse = await testContext.request.post(
        '/auth/logout',
        {},
        true,
      );
      expect(logoutResponse.statusCode).toBe(200);
      expect(logoutResponse.body.success).toBe(true);

      // Cookies should be cleared
      expect(logoutResponse.headers['set-cookie']).toBeDefined();
      expect(logoutResponse.headers['set-cookie'][0]).toContain(
        'access_token=;',
      );

      // Update our stored cookies
      testContext.request.saveCookies(logoutResponse);

      // Verify we're logged out by trying to access a protected route
      const afterLogoutResponse = await testContext.request.get(
        '/article/noPermission',
        true,
      );
      expect(afterLogoutResponse.statusCode).toBe(401);
    });

    it('should allow re-login after logout', async () => {
      // Use AuthTestHelper to register and login
      const userData = fixtures.createSimpleUser({
        email: `relogin@example.com`,
        password: 'Password123!',
      });

      // Save password before it gets hashed in the registration process
      const password = userData.password;

      await testContext.authHelper.registerAndLogin(userData);

      // Logout
      await testContext.authHelper.logout();

      // Try to login again
      const reloginResponse = await testContext.request.post('/auth/login', {
        email: userData.email,
        password: password,
      });

      expect(reloginResponse.statusCode).toBe(201);
      expect(reloginResponse.body.success).toBe(true);

      // Save the new cookies
      testContext.request.saveCookies(reloginResponse);

      // Verify we can access protected routes again
      const profileResponse = await testContext.request.get(
        '/article/noPermission',
        true,
      );
      expect(profileResponse.statusCode).toBe(200);
    });
  });
});
