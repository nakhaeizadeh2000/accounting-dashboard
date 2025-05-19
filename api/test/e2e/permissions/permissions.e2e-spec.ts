import { TestRequest } from '../../helpers/request.helper';
import { DatabaseTestHelper } from '../../helpers/database.helper';
import { AuthTestHelper } from '../../helpers/auth-test.helper';
import {
  setupTestApp,
  teardownTestApp,
  getCacheManager,
} from '../../setup-tests';
import * as fixtures from '../../fixtures';

describe('Permissions Module (e2e)', () => {
  let request: TestRequest;
  let dbHelper: DatabaseTestHelper;
  let authHelper: AuthTestHelper;
  let cacheManager: any;

  beforeAll(async () => {
    console.log('Setting up test environment for permissions tests');
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
  });

  afterEach(async () => {
    console.log('Rolling back transaction after test');
    await dbHelper.rollbackTransaction();
  });

  afterAll(async () => {
    console.log('Tearing down test environment');
    await teardownTestApp();
  });

  describe('GET /permissions', () => {
    it('should return all permissions for admin', async () => {
      console.log('Testing: admin should get all permissions');

      // Login as admin
      console.log('Logging in as admin');
      await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      console.log('Requesting permissions list');
      const response = await request.get('/permissions', {});
      console.log('Permissions response:', JSON.stringify(response.body));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('items');
      expect(response.body.data.items).toBeInstanceOf(Array);
      expect(response.body.data.items.length).toBeGreaterThan(0);

      // Verify permission structure
      const permission = response.body.data.items[0];
      console.log('Checking permission structure:', JSON.stringify(permission));

      expect(permission).toHaveProperty('id');
      expect(permission).toHaveProperty('action');
      expect(permission).toHaveProperty('subject');
      expect(permission).toHaveProperty('inverted');
      expect(permission).toHaveProperty('reason');
    });

    it('should return 401 for unauthenticated request', async () => {
      console.log('Testing: unauthenticated requests should be rejected');

      console.log('Requesting permissions without authentication');
      const response = await request.get('/permissions');
      console.log('Unauthenticated response:', JSON.stringify(response.body));

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /permissions/:id', () => {
    it('should return a specific permission', async () => {
      console.log('Testing: get specific permission by ID');

      // Login as admin
      console.log('Logging in as admin');
      await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      // First get all permissions to get an ID
      console.log('Getting all permissions to find an ID');
      const permissionsResponse = await request.get('/permissions', {});
      const permissionId = permissionsResponse.body.data.items[0].id;
      console.log(`Selected permission ID: ${permissionId}`);

      console.log(`Requesting specific permission: ${permissionId}`);
      const response = await request.get(`/permissions/${permissionId}`, {});
      console.log(
        'Specific permission response:',
        JSON.stringify(response.body),
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.id).toBe(permissionId);
    });

    it('should return 404 for non-existent permission', async () => {
      console.log(
        'Testing: request for non-existent permission ID returns 404',
      );

      // Login as admin
      console.log('Logging in as admin');
      await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      const nonExistentId = '99999';
      console.log(`Requesting non-existent permission ID: ${nonExistentId}`);
      const response = await request.get(`/permissions/${nonExistentId}`, {});
      console.log(
        'Response for non-existent ID:',
        JSON.stringify(response.body),
      );

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /permissions', () => {
    it('should create a new permission', async () => {
      console.log('Testing: creating a new permission');

      // Login as admin
      console.log('Logging in as admin');
      await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      const newPermission = {
        action: 'custom-action',
        subject: 'CustomEntity',
        inverted: false,
        reason: 'For testing purposes',
        fields: ['field1', 'field2'],
      };

      console.log('Creating new permission:', JSON.stringify(newPermission));
      const response = await request.post('/permissions', newPermission, {});
      console.log('Creation response:', JSON.stringify(response.body));

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.action).toBe(newPermission.action);
      expect(response.body.data.subject).toBe(newPermission.subject);
      expect(response.body.data.inverted).toBe(newPermission.inverted);
      expect(response.body.data.reason).toBe(newPermission.reason);
      expect(response.body.data.fields).toEqual(newPermission.fields);
    });

    it('should validate input when creating a permission', async () => {
      console.log('Testing: validation when creating a permission');

      // Login as admin
      console.log('Logging in as admin');
      await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      const invalidPermission = {
        // Missing required fields
        inverted: false,
      };

      console.log(
        'Attempting to create invalid permission:',
        JSON.stringify(invalidPermission),
      );
      const response = await request.post(
        '/permissions',
        invalidPermission,
        {},
      );
      console.log('Validation response:', JSON.stringify(response.body));

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /permissions/:id', () => {
    it('should update an existing permission', async () => {
      console.log('Testing: updating an existing permission');

      // Login as admin
      console.log('Logging in as admin');
      await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      // First get all permissions to get an ID
      console.log('Getting all permissions to find an ID to update');
      const permissionsResponse = await request.get('/permissions', {});
      const permissionId = permissionsResponse.body.data.items[0].id;
      console.log(`Selected permission ID for update: ${permissionId}`);

      const updateData = {
        reason: 'Updated reason',
        fields: ['updated_field1', 'updated_field2'],
      };

      console.log(
        `Updating permission ${permissionId} with:`,
        JSON.stringify(updateData),
      );
      const response = await request.put(
        `/permissions/${permissionId}`,
        updateData,
        {},
      );
      console.log('Update response:', JSON.stringify(response.body));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.id).toBe(permissionId);
      expect(response.body.data.reason).toBe(updateData.reason);
      expect(response.body.data.fields).toEqual(updateData.fields);
    });

    it('should return 404 when updating non-existent permission', async () => {
      console.log('Testing: updating non-existent permission returns 404');

      // Login as admin
      console.log('Logging in as admin');
      await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      const nonExistentId = '99999';
      const updateData = { reason: 'Updated' };

      console.log(
        `Attempting to update non-existent permission ID: ${nonExistentId}`,
      );
      const response = await request.put(
        `/permissions/${nonExistentId}`,
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

  describe('DELETE /permissions/:id', () => {
    it('should delete an existing permission', async () => {
      console.log('Testing: deleting an existing permission');

      // Login as admin
      console.log('Logging in as admin');
      await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      // First get all permissions to get an ID
      console.log('Getting all permissions to find an ID to delete');
      const permissionsResponse = await request.get('/permissions', {});
      const permissionId = permissionsResponse.body.data.items[0].id;
      console.log(`Selected permission ID for deletion: ${permissionId}`);

      console.log(`Deleting permission: ${permissionId}`);
      const response = await request.delete(`/permissions/${permissionId}`, {});
      console.log('Deletion response:', JSON.stringify(response.body));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify permission is deleted
      console.log(`Verifying permission ${permissionId} is deleted`);
      const getResponse = await request.get(`/permissions/${permissionId}`, {});
      console.log('Verification response:', JSON.stringify(getResponse.body));
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 when deleting non-existent permission', async () => {
      console.log('Testing: deleting non-existent permission returns 404');

      // Login as admin
      console.log('Logging in as admin');
      await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      const nonExistentId = '99999';
      console.log(
        `Attempting to delete non-existent permission ID: ${nonExistentId}`,
      );
      const response = await request.delete(
        `/permissions/${nonExistentId}`,
        {},
      );
      console.log(
        'Response for deleting non-existent ID:',
        JSON.stringify(response.body),
      );

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
