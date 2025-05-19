import { TestRequest } from '../../helpers/request.helper';
import { DatabaseTestHelper } from '../../helpers/database.helper';
import { AuthTestHelper } from '../../helpers/auth-test.helper';
import {
  setupTestApp,
  teardownTestApp,
  getCacheManager,
} from '../../setup-tests';
import * as fixtures from '../../fixtures';

describe('Users Module (e2e)', () => {
  let request: TestRequest;
  let dbHelper: DatabaseTestHelper;
  let authHelper: AuthTestHelper;
  let cacheManager: any;

  beforeAll(async () => {
    console.log('Setting up test environment for users tests');
    await setupTestApp();
    cacheManager = getCacheManager();

    request = new TestRequest();
    // Removed request.init() as we're using supertest.agent directly

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
    cacheManager.reset.mockClear();
    cacheManager.get.mockClear();
    cacheManager.set.mockClear();
    cacheManager.del.mockClear();
  });

  afterEach(async () => {
    console.log('Rolling back transaction after test');
    await dbHelper.rollbackTransaction();
  });

  afterAll(async () => {
    console.log('Tearing down test environment');
    await teardownTestApp();
  });

  describe('GET /users', () => {
    it('should return a list of users for admin', async () => {
      console.log('Testing: admin should get the list of users');

      // Login as admin
      console.log('Logging in as admin');
      await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      console.log('Requesting users list');
      const response = await request.get('/users', {});
      console.log('Users response:', JSON.stringify(response.body));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('items');
      expect(response.body.data.items).toBeInstanceOf(Array);
      expect(response.body.data.items.length).toBeGreaterThan(0);

      // Check pagination properties
      console.log('Verifying pagination properties');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('currentPage');
      expect(response.body.data).toHaveProperty('totalPages');
      expect(response.body.data).toHaveProperty('pageSize');
    });

    it('should handle pagination correctly', async () => {
      console.log('Testing: user list pagination');

      // Login as admin
      console.log('Logging in as admin');
      await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      console.log('Requesting paginated users list (page=1, limit=1)');
      const response = await request.get('/users?page=1&limit=1', {});
      console.log('Paginated users response:', JSON.stringify(response.body));

      expect(response.status).toBe(200);
      expect(response.body.data.items.length).toBe(1);
      expect(response.body.data.currentPage).toBe(1);
      expect(response.body.data.pageSize).toBe(1);
    });

    it('should return 401 for unauthenticated request', async () => {
      console.log('Testing: unauthenticated requests should be rejected');

      console.log('Requesting users without authentication');
      const response = await request.get('/users');
      console.log('Unauthenticated response:', JSON.stringify(response.body));

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 403 for user without permissions', async () => {
      console.log(
        'Testing: permission check for user without read access (TODO)',
      );
      // TODO: Create a user without user read permissions and test
      // This would need to be implemented after we have the permission tests in place
    });
  });

  describe('GET /users/:id', () => {
    it('should return a single user', async () => {
      console.log('Testing: getting a single user by ID');

      // Login as admin
      console.log('Logging in as admin');
      await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      // First get the users to get an ID
      console.log('Getting all users to find an ID');
      const usersResponse = await request.get('/users', {});
      const userId = usersResponse.body.data.items[0].id;
      console.log(`Selected user ID: ${userId}`);

      console.log(`Requesting user: ${userId}`);
      const response = await request.get(`/users/${userId}`, {});
      console.log('User response:', JSON.stringify(response.body));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.id).toBe(userId);
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data).toHaveProperty('firstName');
      expect(response.body.data).toHaveProperty('lastName');
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should return 404 for non-existent user', async () => {
      console.log('Testing: request for non-existent user ID returns 404');

      // Login as admin
      console.log('Logging in as admin');
      await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      const nonExistentId = '99999';
      console.log(`Requesting non-existent user ID: ${nonExistentId}`);
      const response = await request.get(`/users/${nonExistentId}`, {});
      console.log(
        'Response for non-existent ID:',
        JSON.stringify(response.body),
      );

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /users', () => {
    it('should create a new user as admin', async () => {
      console.log('Testing: creating a new user as admin');

      // Login as admin
      console.log('Logging in as admin');
      await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      const newUser = {
        email: 'created@example.com',
        password: 'password123',
        firstName: 'Created',
        lastName: 'User',
        isAdmin: false,
      };

      console.log('Creating new user:', JSON.stringify(newUser));
      const response = await request.post('/users', newUser, {});
      console.log('Creation response:', JSON.stringify(response.body));

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe(newUser.email);
      expect(response.body.data.firstName).toBe(newUser.firstName);
      expect(response.body.data.lastName).toBe(newUser.lastName);
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should validate input when creating a user', async () => {
      console.log('Testing: validation when creating a user');

      // Login as admin
      console.log('Logging in as admin');
      await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      const invalidUser = {
        email: 'not-valid-email',
        password: '123', // Too short
        firstName: '',
        lastName: 'User',
      };

      console.log(
        'Attempting to create invalid user:',
        JSON.stringify(invalidUser),
      );
      const response = await request.post('/users', invalidUser, {});
      console.log('Validation response:', JSON.stringify(response.body));

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /users/:id', () => {
    it('should update an existing user', async () => {
      console.log('Testing: updating an existing user');

      // Login as admin
      console.log('Logging in as admin');
      await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      // First get the users to get an ID
      console.log('Getting all users to find an ID to update');
      const usersResponse = await request.get('/users', {});
      const userId = usersResponse.body.data.items[1].id; // Update regular user
      console.log(`Selected user ID for update: ${userId}`);

      const updateData = {
        firstName: 'Updated',
        lastName: 'User',
      };

      console.log(`Updating user ${userId} with:`, JSON.stringify(updateData));
      const response = await request.put(`/users/${userId}`, updateData, {});
      console.log('Update response:', JSON.stringify(response.body));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.id).toBe(userId);
      expect(response.body.data.firstName).toBe(updateData.firstName);
      expect(response.body.data.lastName).toBe(updateData.lastName);
    });

    it('should return 404 when updating non-existent user', async () => {
      console.log('Testing: updating non-existent user returns 404');

      // Login as admin
      console.log('Logging in as admin');
      await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      const nonExistentId = '99999';
      const updateData = { firstName: 'Test' };

      console.log(
        `Attempting to update non-existent user ID: ${nonExistentId}`,
      );
      const response = await request.put(
        `/users/${nonExistentId}`,
        updateData,
        {},
      );
      console.log(
        'Response for updating non-existent ID:',
        JSON.stringify(response.body),
      );

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete an existing user', async () => {
      console.log('Testing: deleting an existing user');

      // Login as admin
      console.log('Logging in as admin');
      await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      // First get the users to get an ID
      console.log('Getting all users to find an ID to delete');
      const usersResponse = await request.get('/users', {});
      const userId = usersResponse.body.data.items[1].id; // Delete regular user
      console.log(`Selected user ID for deletion: ${userId}`);

      console.log(`Deleting user: ${userId}`);
      const response = await request.delete(`/users/${userId}`, {});
      console.log('Deletion response:', JSON.stringify(response.body));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify user is deleted
      console.log(`Verifying user ${userId} is deleted`);
      const getResponse = await request.get(`/users/${userId}`, {});
      console.log('Verification response:', JSON.stringify(getResponse.body));
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 when deleting non-existent user', async () => {
      console.log('Testing: deleting non-existent user returns 404');

      // Login as admin
      console.log('Logging in as admin');
      await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      const nonExistentId = '99999';
      console.log(
        `Attempting to delete non-existent user ID: ${nonExistentId}`,
      );
      const response = await request.delete(`/users/${nonExistentId}`, {});
      console.log(
        'Response for deleting non-existent ID:',
        JSON.stringify(response.body),
      );

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
