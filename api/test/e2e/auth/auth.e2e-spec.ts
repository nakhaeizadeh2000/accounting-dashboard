import { TestRequest } from '../../helpers/request.helper';
import { DatabaseTestHelper } from '../../helpers/database.helper';
import { AuthTestHelper } from '../../helpers/auth-test.helper';
import {
  setupTestApp,
  teardownTestApp,
  getCacheManager,
} from '../../setup-tests';
import * as fixtures from '../../fixtures';

describe('Auth Module (e2e)', () => {
  let request: TestRequest;
  let dbHelper: DatabaseTestHelper;
  let authHelper: AuthTestHelper;
  let cacheManager: any;

  beforeAll(async () => {
    await setupTestApp();
    cacheManager = getCacheManager();

    request = new TestRequest();

    dbHelper = new DatabaseTestHelper();
    await dbHelper.init();

    authHelper = new AuthTestHelper(request);
  });

  beforeEach(async () => {
    await dbHelper.seedDatabase();
    cacheManager.reset.mockClear();
    cacheManager.get.mockClear();
    cacheManager.set.mockClear();
    cacheManager.del.mockClear();
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const newUser = {
        email: `newuser@example.com`,
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      };

      console.log('Registration request payload:', JSON.stringify(newUser));

      const response = await request.post('/auth/register', newUser);
      console.log('Registration response:', JSON.stringify(response.body));

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe(newUser.email);
      expect(response.body.data.firstName).toBe(newUser.firstName);
      expect(response.body.data.lastName).toBe(newUser.lastName);
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should return 409 when registering with existing email', async () => {
      // First register a user with a unique email
      const uniqueEmail = `existing@example.com`;
      const firstUser = {
        email: uniqueEmail,
        password: 'password123',
        firstName: 'Existing',
        lastName: 'User',
      };

      console.log('First user registration:', JSON.stringify(firstUser));

      const firstResponse = await request.post('/auth/register', firstUser);
      console.log('First user response:', JSON.stringify(firstResponse.body));

      // Try to register with the same email
      const duplicateUser = {
        email: uniqueEmail, // Same email
        password: 'password123',
        firstName: 'Another',
        lastName: 'User',
      };

      console.log(
        'Duplicate registration request:',
        JSON.stringify(duplicateUser),
      );

      const response = await request.post('/auth/register', duplicateUser);
      console.log(
        'Duplicate registration response:',
        JSON.stringify(response.body),
      );

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('should validate input fields', async () => {
      const invalidUser = {
        email: 'not-an-email',
        password: '123', // Too short
        firstName: '',
        lastName: 'User',
      };

      console.log('Invalid registration data:', JSON.stringify(invalidUser));

      const response = await request.post('/auth/register', invalidUser);
      console.log('Validation response:', JSON.stringify(response.body));

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /auth/login', () => {
    it('should log in successfully and set cookies', async () => {
      // First register a user with known credentials
      const uniqueEmail = `login@example.com`;
      const password = 'Password123!';

      const registerData = {
        email: uniqueEmail,
        password,
        firstName: 'Login',
        lastName: 'Test',
      };

      console.log('Register for login test:', JSON.stringify(registerData));

      await request.post('/auth/register', registerData);

      // Attempt login
      const loginCredentials = {
        email: uniqueEmail,
        password,
      };

      console.log('Login credentials:', JSON.stringify(loginCredentials));

      const response = await request.post('/auth/login', loginCredentials);
      console.log('Login response:', JSON.stringify(response.body));

      if (response.headers['set-cookie']) {
        console.log('Set-Cookie Header:', response.headers['set-cookie']);
      }

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('access_token');
      expect(response.body.data).toHaveProperty('cookie_expires_in');

      // Check if cookies were set
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('access_token');

      // Check if refresh token was stored in cache
      expect(cacheManager.set).toHaveBeenCalled();
    });

    it('should return 401 with invalid credentials', async () => {
      const invalidCredentials = {
        email: 'user@example.com',
        password: 'wrong-password',
      };

      console.log(
        'Invalid login credentials:',
        JSON.stringify(invalidCredentials),
      );

      const response = await request.post('/auth/login', invalidCredentials);
      console.log('Failed login response:', JSON.stringify(response.body));

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /auth/logout', () => {
    it('should log out successfully and clear cookies', async () => {
      // First login
      const loginResponse = await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      console.log('Login before logout:', JSON.stringify(loginResponse));

      // Then logout
      const response = await request.post('/auth/logout', {}, {});
      console.log('Logout response:', JSON.stringify(response.body));

      if (response.headers['set-cookie']) {
        console.log('Cookie clearing headers:', response.headers['set-cookie']);
      }

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Check if cookies were cleared
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('access_token=;');

      // Check if refresh token was removed from cache
      expect(cacheManager.del).toHaveBeenCalled();
    });
  });
});
