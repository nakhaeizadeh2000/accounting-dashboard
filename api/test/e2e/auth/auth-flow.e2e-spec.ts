import { setupTestApp, teardownTestApp } from '../../setup-tests';
import { TestRequest } from '../../helpers/request.helper';
import { DatabaseTestHelper } from '../../helpers/database.helper';

describe('Authentication Flow (e2e)', () => {
  let request: TestRequest;
  let dbHelper: DatabaseTestHelper;

  // Setup the test environment
  beforeAll(async () => {
    // Setup database and test environment
    await setupTestApp();

    // Initialize helpers
    request = new TestRequest();

    dbHelper = new DatabaseTestHelper();
    await dbHelper.init();
  }, 30000);

  // Clean up after all tests
  afterAll(async () => {
    await teardownTestApp();
  });

  // For each test, start a new transaction and seed data
  beforeEach(async () => {
    await dbHelper.startTransaction();
    await dbHelper.seedDatabase();
  });

  // After each test, roll back the transaction to clean the database
  afterEach(async () => {
    await dbHelper.rollbackTransaction();
  });

  describe('User Registration', () => {
    it('should register a new user', async () => {
      // Use a unique email with timestamp to avoid conflicts
      const uniqueEmail = `newuser_${Date.now()}@example.com`;

      const newUser = {
        email: uniqueEmail,
        password: 'Password123!',
        firstName: 'New',
        lastName: 'User',
      };

      console.log('Registration request payload:', JSON.stringify(newUser));

      const response = await request.post('/auth/register', newUser);
      console.log('Registration response:', JSON.stringify(response.body));

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.email).toBe(newUser.email);
    });

    it('should validate password complexity', async () => {
      const userData = {
        email: `weakpassword_${Date.now()}@example.com`,
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
      const email = `duplicate_${Date.now()}@example.com`;

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
      const email = `loginuser_${Date.now()}@example.com`;
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
  });
});
