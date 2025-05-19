import { TestRequest } from '../../helpers/request.helper';
import { DatabaseTestHelper } from '../../helpers/database.helper';
import { AuthTestHelper } from '../../helpers/auth-test.helper';
import {
  setupTestApp,
  teardownTestApp,
  getCacheManager,
} from '../../setup-tests';
import * as fixtures from '../../fixtures';

describe('Roles Module (e2e)', () => {
  let request: TestRequest;
  let dbHelper: DatabaseTestHelper;
  let authHelper: AuthTestHelper;
  let cacheManager: any;

  beforeAll(async () => {
    console.log('Setting up test environment for roles tests');
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

  describe('GET /roles', () => {
    it('should return all roles for admin', async () => {
      console.log('Testing: admin should get all roles');

      // Login as admin
      console.log('Logging in as admin');
      await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      console.log('Requesting roles list');
      const response = await request.get('/roles', {});
      console.log('Roles response:', JSON.stringify(response.body));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('items');
      expect(response.body.data.items).toBeInstanceOf(Array);
      expect(response.body.data.items.length).toBeGreaterThan(0);

      // Verify role structure
      const role = response.body.data.items[0];
      console.log('Checking role structure:', JSON.stringify(role));

      expect(role).toHaveProperty('id');
      expect(role).toHaveProperty('name');
      expect(role).toHaveProperty('permissions');
      expect(role.permissions).toBeInstanceOf(Array);
    });

    it('should return 401 for unauthenticated request', async () => {
      console.log('Testing: unauthenticated requests should be rejected');

      console.log('Requesting roles without authentication');
      const response = await request.get('/roles');
      console.log('Unauthenticated response:', JSON.stringify(response.body));

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /roles/:id', () => {
    it('should return a specific role with permissions', async () => {
      console.log('Testing: get specific role by ID');

      // Login as admin
      console.log('Logging in as admin');
      await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      // First get all roles to get an ID
      console.log('Getting all roles to find an ID');
      const rolesResponse = await request.get('/roles', {});
      const roleId = rolesResponse.body.data.items[0].id;
      console.log(`Selected role ID: ${roleId}`);

      console.log(`Requesting specific role: ${roleId}`);
      const response = await request.get(`/roles/${roleId}`, {});
      console.log('Specific role response:', JSON.stringify(response.body));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.id).toBe(roleId);
      expect(response.body.data).toHaveProperty('permissions');
      expect(response.body.data.permissions).toBeInstanceOf(Array);
      expect(response.body.data.permissions.length).toBeGreaterThan(0);
    });

    it('should return 404 for non-existent role', async () => {
      console.log('Testing: request for non-existent role ID returns 404');

      // Login as admin
      console.log('Logging in as admin');
      await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      const nonExistentId = '99999';
      console.log(`Requesting non-existent role ID: ${nonExistentId}`);
      const response = await request.get(`/roles/${nonExistentId}`, {});
      console.log(
        'Response for non-existent ID:',
        JSON.stringify(response.body),
      );

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /roles', () => {
    it('should create a new role with permissions', async () => {
      console.log('Testing: creating a new role with permissions');

      // Login as admin
      console.log('Logging in as admin');
      await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      // Get permissions to attach to the new role
      console.log('Getting permissions to attach to the new role');
      const permissionsResponse = await request.get('/permissions', {});
      const permissionIds = permissionsResponse.body.data.items
        .slice(0, 3)
        .map((p) => p.id);
      console.log(`Selected permission IDs: ${permissionIds.join(', ')}`);

      const newRole = {
        name: 'Editor',
        permissionIds: permissionIds,
      };

      console.log('Creating new role:', JSON.stringify(newRole));
      const response = await request.post('/roles', newRole, {});
      console.log('Creation response:', JSON.stringify(response.body));

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(newRole.name);
      expect(response.body.data).toHaveProperty('permissions');
      expect(response.body.data.permissions).toBeInstanceOf(Array);
      expect(response.body.data.permissions.length).toBe(permissionIds.length);
    });

    it('should validate input when creating a role', async () => {
      console.log('Testing: validation when creating a role');

      // Login as admin
      console.log('Logging in as admin');
      await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      const invalidRole = {
        // Missing name
        permissionIds: ['1', '2'],
      };

      console.log(
        'Attempting to create invalid role:',
        JSON.stringify(invalidRole),
      );
      const response = await request.post('/roles', invalidRole, {});
      console.log('Validation response:', JSON.stringify(response.body));

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /roles/:id', () => {
    it('should update an existing role', async () => {
      console.log('Testing: updating an existing role');

      // Login as admin
      console.log('Logging in as admin');
      await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      // First get all roles to get an ID
      console.log('Getting all roles to find an ID to update');
      const rolesResponse = await request.get('/roles', {});
      const roleId = rolesResponse.body.data.items[0].id;
      console.log(`Selected role ID for update: ${roleId}`);

      // Get permissions to update the role
      console.log('Getting permissions to update the role with');
      const permissionsResponse = await request.get('/permissions', {});
      const permissionIds = permissionsResponse.body.data.items
        .slice(0, 2)
        .map((p) => p.id);
      console.log(
        `Selected permission IDs for update: ${permissionIds.join(', ')}`,
      );

      const updateData = {
        name: 'Updated Role',
        permissionIds: permissionIds,
      };

      console.log(`Updating role ${roleId} with:`, JSON.stringify(updateData));
      const response = await request.put(`/roles/${roleId}`, updateData, {});
      console.log('Update response:', JSON.stringify(response.body));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.id).toBe(roleId);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.permissions.length).toBe(permissionIds.length);
    });

    it('should return 404 when updating non-existent role', async () => {
      console.log('Testing: updating non-existent role returns 404');

      // Login as admin
      console.log('Logging in as admin');
      await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      const nonExistentId = '99999';
      const updateData = { name: 'Updated' };

      console.log(
        `Attempting to update non-existent role ID: ${nonExistentId}`,
      );
      const response = await request.put(
        `/roles/${nonExistentId}`,
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

  describe('DELETE /roles/:id', () => {
    it('should delete an existing role', async () => {
      console.log('Testing: deleting an existing role');

      // Login as admin
      console.log('Logging in as admin');
      await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      // First get all roles to get an ID
      console.log('Getting all roles to find an ID to delete');
      const rolesResponse = await request.get('/roles', {});
      const roleId = rolesResponse.body.data.items[0].id;
      console.log(`Selected role ID for deletion: ${roleId}`);

      console.log(`Deleting role: ${roleId}`);
      const response = await request.delete(`/roles/${roleId}`, {});
      console.log('Deletion response:', JSON.stringify(response.body));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify role is deleted
      console.log(`Verifying role ${roleId} is deleted`);
      const getResponse = await request.get(`/roles/${roleId}`, {});
      console.log('Verification response:', JSON.stringify(getResponse.body));
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 when deleting non-existent role', async () => {
      console.log('Testing: deleting non-existent role returns 404');

      // Login as admin
      console.log('Logging in as admin');
      await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      const nonExistentId = '99999';
      console.log(
        `Attempting to delete non-existent role ID: ${nonExistentId}`,
      );
      const response = await request.delete(`/roles/${nonExistentId}`, {});
      console.log(
        'Response for deleting non-existent ID:',
        JSON.stringify(response.body),
      );

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
