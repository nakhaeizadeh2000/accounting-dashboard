import { setupTestApp, teardownTestApp } from '../../setup-tests';
import { TestRequest } from '../../helpers/request.helper';
import { DatabaseTestHelper } from '../../helpers/database.helper';

describe('Authentication Flow (e2e)', () => {
  let request: TestRequest;
  let dbHelper: DatabaseTestHelper;

  // Setup the test environment
  beforeAll(async () => {
    // Set up test environment and initialize the TestApp
    await setupTestApp();

    // Initialize test request helper
    request = new TestRequest();

    // Initialize database helper
    dbHelper = new DatabaseTestHelper();
    await dbHelper.init();
  }, 30000);

  // Clean up after all tests
  afterAll(async () => {
    await teardownTestApp();
  });

  // For each test, seed data
  beforeEach(async () => {
    await dbHelper.seedDatabase();
  });

  describe('User Registration', () => {
    it('should register a new user', async () => {
      // Use a unique email with timestamp to avoid conflicts
      const uniqueEmail = `newuser@example.com`;

      const newUser = {
        email: uniqueEmail,
        password: 'Password123!',
        firstName: 'New',
        lastName: 'User',
      };

      console.log('Registration request payload:', JSON.stringify(newUser));

      const response = await request.post('/auth/register', newUser);
      console.log('Registration response:', JSON.stringify(response.body));

      expect(response.body.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.email).toBe(newUser.email);
    });

    it('should validate password complexity', async () => {
      const userData = {
        email: `weakpassword@example.com`,
        password: '123', // Too short/simple
        firstName: 'Weak',
        lastName: 'Password',
      };

      console.log('Weak password request payload:', JSON.stringify(userData));

      const response = await request.post('/auth/register', userData);
      console.log('Validation response:', JSON.stringify(response.body));

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      // Should contain validation error about password
      expect(response.body.message).toContain('password');
    });

    it('should prevent duplicate email registration', async () => {
      // First create a user
      const email = `duplicate@example.com`;

      // Register first user
      const firstUser = {
        email,
        password: 'Password123!',
        firstName: 'First',
        lastName: 'User',
      };

      console.log('First user request:', JSON.stringify(firstUser));

      const firstResponse = await request.post('/auth/register', firstUser);
      console.log('First user response:', JSON.stringify(firstResponse.body));

      // Try to register with the same email
      const secondUser = {
        email, // Same email as first user
        password: 'Password123!',
        firstName: 'Duplicate',
        lastName: 'Email',
      };

      console.log('Duplicate email request:', JSON.stringify(secondUser));

      const response = await request.post('/auth/register', secondUser);
      console.log('Duplicate email response:', JSON.stringify(response.body));

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      // Should contain error about duplicate email
      expect(response.body.message).toContain('email');
    });
  });

  describe('User Login', () => {
    it('should login a user and return JWT token', async () => {
      // First register a test user
      const email = `loginuser@example.com`;
      const password = 'Password123!';

      const registerData = {
        email,
        password,
        firstName: 'Login',
        lastName: 'User',
      };

      console.log(
        'Register user for login test:',
        JSON.stringify(registerData),
      );

      const registerResponse = await request.post(
        '/auth/register',
        registerData,
      );
      console.log('Register response:', JSON.stringify(registerResponse.body));

      // Now try to login
      const loginData = {
        email,
        password,
      };

      console.log('Login request:', JSON.stringify(loginData));

      const response = await request.post('/auth/login', loginData);
      console.log('Login response:', JSON.stringify(response.body));

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.accessToken).toBeDefined();

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

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Protected Routes', () => {
    it('should allow access to protected routes with valid token', async () => {
      // Register and login a user
      const email = `protected@example.com`;
      const password = 'Password123!';

      // Register
      await request.post('/auth/register', {
        email,
        password,
        firstName: 'Protected',
        lastName: 'Route',
      });

      // Login
      const loginResponse = await request.post('/auth/login', {
        email,
        password,
      });

      // Save cookies (token)
      request.saveCookies(loginResponse);

      // Try to access a protected route
      const response = await request.get('/users/profile', true); // true = withAuth

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should deny access to protected routes without token', async () => {
      // Clear any existing cookies
      request.clearCookies();

      // Try to access a protected route without authentication
      const response = await request.get('/users/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Logout', () => {
    it('should successfully log out a user', async () => {
      // Register and login a user
      const email = `logout_${Date.now()}@example.com`;
      const password = 'Password123!';

      // Register
      await request.post('/auth/register', {
        email,
        password,
        firstName: 'Logout',
        lastName: 'Test',
      });

      // Login
      const loginResponse = await request.post('/auth/login', {
        email,
        password,
      });

      // Save cookies (token)
      request.saveCookies(loginResponse);

      // Verify we're logged in by accessing a protected route
      const profileResponse = await request.get('/users/profile', true);
      expect(profileResponse.status).toBe(200);

      // Logout
      const logoutResponse = await request.post('/auth/logout', {}, true);
      expect(logoutResponse.status).toBe(200);
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
      expect(afterLogoutResponse.status).toBe(401);
    });
  });
});
