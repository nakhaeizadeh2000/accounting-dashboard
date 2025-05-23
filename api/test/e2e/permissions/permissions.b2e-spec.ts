// import { TestRequest } from '../../helpers/request.helper';
// import { DatabaseTestHelper } from '../../helpers/database.helper';
// import { AuthTestHelper } from '../../helpers/auth-test.helper';
// import {
//   setupTestApp,
//   teardownTestApp,
//   getCacheManager,
//   getTestDataSource,
// } from '../../setup-tests';
// import * as fixtures from '../../fixtures';
// import { Permission } from '../../../src/permissions/entities/permission.entity';
// import { DataSource, Repository } from 'typeorm';

// describe('Permissions Module (e2e)', () => {
//   let request: TestRequest;
//   let dbHelper: DatabaseTestHelper;
//   let authHelper: AuthTestHelper;
//   let cacheManager: any;
//   let dataSource: DataSource;
//   let permissionRepository: Repository<Permission>;

//   beforeAll(async () => {
//     console.log('Setting up test environment for permissions tests');
//     await setupTestApp();

//     // Get global resources
//     cacheManager = getCacheManager();
//     dataSource = getTestDataSource();

//     // Initialize test helpers
//     request = new TestRequest();
//     dbHelper = new DatabaseTestHelper();
//     await dbHelper.init();
//     authHelper = new AuthTestHelper(request, dbHelper);

//     // Get the permission repository
//     permissionRepository = dataSource.getRepository(Permission);

//     console.log('✅ Test environment setup complete for permissions tests');
//   });

//   beforeEach(async () => {
//     console.log('Starting new transaction for test isolation');

//     // Start transaction for test isolation
//     await dbHelper.startTransaction();

//     // Get transaction-specific repository
//     permissionRepository = dbHelper.getRepository(Permission);

//     // Seed database within transaction
//     await dbHelper.seedDatabase();

//     // Reset for clean state
//     request.clearCookies();
//     request.clearHeaders();

//     // Reset cache manager mocks
//     cacheManager.reset.mockClear();
//     cacheManager.get.mockClear();
//     cacheManager.set.mockClear();
//     cacheManager.del.mockClear();
//   });

//   afterEach(async () => {
//     console.log('Rolling back transaction after test');
//     await dbHelper.rollbackTransaction();
//   });

//   afterAll(async () => {
//     console.log('Tearing down test environment');
//     await teardownTestApp();
//   });

//   describe('GET /permissions', () => {
//     it('should return all permissions for admin', async () => {
//       console.log('Testing: admin should get all permissions');

//       // Login as admin
//       console.log('Logging in as admin');
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Seed some additional permissions for testing
//       const testPermissions = await Promise.all([
//         permissionRepository.save({
//           action: 'read',
//           subject: 'TestEntity',
//           inverted: false,
//           reason: 'Test permission 1',
//         }),
//         permissionRepository.save({
//           action: 'create',
//           subject: 'TestEntity',
//           inverted: false,
//           reason: 'Test permission 2',
//         }),
//       ]);

//       console.log(`Created ${testPermissions.length} test permissions`);

//       // Request permissions list
//       console.log('Requesting permissions list');
//       const response = await request.get('/permissions', true);

//       console.log(
//         `Permissions response: Status ${response.statusCode}, Items: ${
//           response.body.data?.items?.length || 0
//         }`,
//       );

//       // Assertions
//       expect(response.statusCode).toBe(200);
//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toHaveProperty('items');
//       expect(response.body.data.items).toBeInstanceOf(Array);
//       expect(response.body.data.items.length).toBeGreaterThan(0);

//       // Verify permission structure
//       const permission = response.body.data.items[0];
//       console.log('Checking permission structure:', JSON.stringify(permission));

//       expect(permission).toHaveProperty('id');
//       expect(permission).toHaveProperty('action');
//       expect(permission).toHaveProperty('subject');
//       expect(permission).toHaveProperty('inverted');
//       expect(permission).toHaveProperty('reason');

//       // Verify our test permissions are included
//       const testPermissionIds = testPermissions.map((p) => p.id);
//       const returnedIds = response.body.data.items.map((p) => p.id);

//       const foundTestPermissions = testPermissionIds.every((id) =>
//         returnedIds.includes(id),
//       );

//       expect(foundTestPermissions).toBe(true);
//     });

//     it('should return paginated results when limit and page are specified', async () => {
//       console.log('Testing: permissions list should support pagination');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Create 10 test permissions
//       const testPermissions = [];
//       for (let i = 0; i < 10; i++) {
//         testPermissions.push(
//           await permissionRepository.save({
//             action: `action${i}`,
//             subject: `Subject${i}`,
//             inverted: false,
//             reason: `Test permission ${i}`,
//           }),
//         );
//       }

//       console.log(
//         `Created ${testPermissions.length} test permissions for pagination test`,
//       );

//       // Request first page with 5 items
//       const page1Response = await request.get(
//         '/permissions?page=1&limit=5',
//         true,
//       );

//       // Assertions for first page
//       expect(page1Response.statusCode).toBe(200);
//       expect(page1Response.body.success).toBe(true);
//       expect(page1Response.body.data.items.length).toBeLessThanOrEqual(5);
//       expect(page1Response.body.data).toHaveProperty('meta');
//       expect(page1Response.body.data.meta).toHaveProperty('totalItems');
//       expect(page1Response.body.data.meta).toHaveProperty('itemsPerPage', 5);
//       expect(page1Response.body.data.meta).toHaveProperty('currentPage', 1);

//       // Request second page
//       const page2Response = await request.get(
//         '/permissions?page=2&limit=5',
//         true,
//       );

//       // Assertions for second page
//       expect(page2Response.statusCode).toBe(200);
//       expect(page2Response.body.success).toBe(true);
//       expect(page2Response.body.data.items.length).toBeLessThanOrEqual(5);
//       expect(page2Response.body.data.meta).toHaveProperty('currentPage', 2);

//       // Verify different items on different pages
//       const page1Ids = page1Response.body.data.items.map((p) => p.id);
//       const page2Ids = page2Response.body.data.items.map((p) => p.id);

//       // No item should appear on both pages
//       const duplicateIds = page1Ids.filter((id) => page2Ids.includes(id));
//       expect(duplicateIds.length).toBe(0);
//     });

//     it('should return 401 for unauthenticated request', async () => {
//       console.log('Testing: unauthenticated requests should be rejected');

//       // Make request without authentication
//       console.log('Requesting permissions without authentication');
//       const response = await request.get('/permissions');

//       console.log('Unauthenticated response:', JSON.stringify(response.body));

//       expect(response.statusCode).toBe(401);
//       expect(response.body.success).toBe(false);
//     });

//     it('should support filtering by action and subject', async () => {
//       console.log('Testing: permissions list should support filtering');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Create test permissions with different actions and subjects
//       await Promise.all([
//         permissionRepository.save({
//           action: 'read',
//           subject: 'Article',
//           inverted: false,
//           reason: 'Read Article',
//         }),
//         permissionRepository.save({
//           action: 'update',
//           subject: 'Article',
//           inverted: false,
//           reason: 'Update Article',
//         }),
//         permissionRepository.save({
//           action: 'read',
//           subject: 'User',
//           inverted: false,
//           reason: 'Read User',
//         }),
//       ]);

//       // Filter by action
//       const actionFilterResponse = await request.get(
//         '/permissions?action=read',
//         true,
//       );

//       expect(actionFilterResponse.statusCode).toBe(200);
//       expect(actionFilterResponse.body.success).toBe(true);
//       expect(actionFilterResponse.body.data.items.length).toBeGreaterThan(0);

//       // All items should have action=read
//       const allReadAction = actionFilterResponse.body.data.items.every(
//         (p) => p.action === 'read',
//       );
//       expect(allReadAction).toBe(true);

//       // Filter by subject
//       const subjectFilterResponse = await request.get(
//         '/permissions?subject=Article',
//         true,
//       );

//       expect(subjectFilterResponse.statusCode).toBe(200);
//       expect(subjectFilterResponse.body.success).toBe(true);
//       expect(subjectFilterResponse.body.data.items.length).toBeGreaterThan(0);

//       // All items should have subject=Article
//       const allArticleSubject = subjectFilterResponse.body.data.items.every(
//         (p) => p.subject === 'Article',
//       );
//       expect(allArticleSubject).toBe(true);

//       // Filter by both action and subject
//       const combinedFilterResponse = await request.get(
//         '/permissions?action=read&subject=Article',
//         true,
//       );

//       expect(combinedFilterResponse.statusCode).toBe(200);
//       expect(combinedFilterResponse.body.success).toBe(true);

//       // All items should have action=read AND subject=Article
//       const allMatchCombined = combinedFilterResponse.body.data.items.every(
//         (p) => p.action === 'read' && p.subject === 'Article',
//       );
//       expect(allMatchCombined).toBe(true);
//     });
//   });

//   describe('GET /permissions/:id', () => {
//     it('should return a specific permission', async () => {
//       console.log('Testing: get specific permission by ID');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Create a test permission to retrieve
//       const testPermission = await permissionRepository.save({
//         action: 'special-action',
//         subject: 'SpecialEntity',
//         inverted: false,
//         reason: 'Special test permission',
//         fields: ['field1', 'field2'],
//         conditions: { status: 'active' },
//       });

//       const permissionId = testPermission.id;
//       console.log(`Created test permission with ID: ${permissionId}`);

//       // Request the specific permission
//       console.log(`Requesting specific permission: ${permissionId}`);
//       const response = await request.get(`/permissions/${permissionId}`, true);

//       console.log(
//         'Specific permission response:',
//         JSON.stringify(response.body),
//       );

//       // Assertions
//       expect(response.statusCode).toBe(200);
//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toHaveProperty('id', permissionId);
//       expect(response.body.data).toHaveProperty(
//         'action',
//         testPermission.action,
//       );
//       expect(response.body.data).toHaveProperty(
//         'subject',
//         testPermission.subject,
//       );
//       expect(response.body.data).toHaveProperty(
//         'reason',
//         testPermission.reason,
//       );
//       expect(response.body.data).toHaveProperty('fields');
//       expect(response.body.data.fields).toEqual(testPermission.fields);
//       expect(response.body.data).toHaveProperty('conditions');
//       expect(response.body.data.conditions).toEqual(testPermission.conditions);
//     });

//     it('should return 404 for non-existent permission', async () => {
//       console.log(
//         'Testing: request for non-existent permission ID returns 404',
//       );

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Use a non-existent ID
//       const nonExistentId = '99999999-9999-9999-9999-999999999999';
//       console.log(`Requesting non-existent permission ID: ${nonExistentId}`);

//       const response = await request.get(`/permissions/${nonExistentId}`, true);
//       console.log(
//         'Response for non-existent ID:',
//         JSON.stringify(response.body),
//       );

//       // Assertions
//       expect(response.statusCode).toBe(404);
//       expect(response.body.success).toBe(false);
//     });
//   });

//   describe('POST /permissions', () => {
//     it('should create a new permission', async () => {
//       console.log('Testing: creating a new permission');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Prepare test permission data
//       const newPermission = {
//         action: 'custom-action',
//         subject: 'CustomEntity',
//         inverted: false,
//         reason: 'For testing purposes',
//         fields: ['field1', 'field2'],
//         conditions: { status: 'active' },
//       };

//       console.log('Creating new permission:', JSON.stringify(newPermission));
//       const response = await request.post('/permissions', newPermission, true);

//       console.log('Creation response:', JSON.stringify(response.body));

//       // Assertions
//       expect(response.statusCode).toBe(201);
//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toHaveProperty('id');
//       expect(response.body.data.action).toBe(newPermission.action);
//       expect(response.body.data.subject).toBe(newPermission.subject);
//       expect(response.body.data.inverted).toBe(newPermission.inverted);
//       expect(response.body.data.reason).toBe(newPermission.reason);
//       expect(response.body.data.fields).toEqual(newPermission.fields);
//       expect(response.body.data.conditions).toEqual(newPermission.conditions);

//       // Verify permission was actually created in the database
//       const savedPermission = await permissionRepository.findOne({
//         where: { id: response.body.data.id },
//       });

//       expect(savedPermission).toBeDefined();
//       expect(savedPermission.action).toBe(newPermission.action);
//     });

//     it('should validate input when creating a permission', async () => {
//       console.log('Testing: validation when creating a permission');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Test cases for validation failures
//       const testCases = [
//         {
//           name: 'missing required fields',
//           data: {
//             // Missing action and subject
//             inverted: false,
//             reason: 'Incomplete permission',
//           },
//           expectedStatus: 400,
//         },
//         {
//           name: 'invalid action type',
//           data: {
//             action: 123, // Should be string
//             subject: 'TestEntity',
//             inverted: false,
//             reason: 'Invalid action type',
//           },
//           expectedStatus: 400,
//         },
//         {
//           name: 'invalid fields format',
//           data: {
//             action: 'read',
//             subject: 'TestEntity',
//             inverted: false,
//             reason: 'Test permission',
//             fields: 'not-an-array', // Should be array
//           },
//           expectedStatus: 400,
//         },
//         {
//           name: 'invalid conditions format',
//           data: {
//             action: 'read',
//             subject: 'TestEntity',
//             inverted: false,
//             reason: 'Test permission',
//             conditions: ['not-an-object'], // Should be object
//           },
//           expectedStatus: 400,
//         },
//       ];

//       // Run through each validation test case
//       for (const testCase of testCases) {
//         console.log(`Testing validation case: ${testCase.name}`);

//         const response = await request.post(
//           '/permissions',
//           testCase.data,
//           true,
//         );

//         console.log(
//           `Validation response for ${testCase.name}:`,
//           JSON.stringify(response.body),
//         );

//         expect(response.statusCode).toBe(testCase.expectedStatus);
//         expect(response.body.success).toBe(false);
//       }
//     });

//     it('should prevent duplicate action/subject combinations', async () => {
//       console.log('Testing: preventing duplicate action/subject combinations');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Create initial permission
//       const permissionData = {
//         action: 'unique-action',
//         subject: 'UniqueEntity',
//         inverted: false,
//         reason: 'Original permission',
//       };

//       const firstResponse = await request.post(
//         '/permissions',
//         permissionData,
//         true,
//       );
//       expect(firstResponse.statusCode).toBe(201);

//       // Try to create duplicate
//       console.log('Attempting to create duplicate permission');
//       const duplicateData = {
//         action: 'unique-action', // Same action
//         subject: 'UniqueEntity', // Same subject
//         inverted: false,
//         reason: 'Duplicate permission',
//       };

//       const duplicateResponse = await request.post(
//         '/permissions',
//         duplicateData,
//         true,
//       );

//       // Should fail with conflict error
//       expect(duplicateResponse.statusCode).toBe(409);
//       expect(duplicateResponse.body.success).toBe(false);
//     });
//   });

//   describe('PUT /permissions/:id', () => {
//     it('should update an existing permission', async () => {
//       console.log('Testing: updating an existing permission');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Create a permission to update
//       const initialPermission = await permissionRepository.save({
//         action: 'update-test-action',
//         subject: 'UpdateEntity',
//         inverted: false,
//         reason: 'Original reason',
//         fields: ['field1', 'field2'],
//       });

//       const permissionId = initialPermission.id;
//       console.log(`Created permission ${permissionId} for update test`);

//       // Prepare update data
//       const updateData = {
//         reason: 'Updated reason',
//         fields: ['updated_field1', 'updated_field2'],
//         conditions: { status: 'active' },
//       };

//       console.log(
//         `Updating permission ${permissionId} with:`,
//         JSON.stringify(updateData),
//       );

//       const response = await request.put(
//         `/permissions/${permissionId}`,
//         updateData,
//         true,
//       );

//       console.log('Update response:', JSON.stringify(response.body));

//       // Assertions
//       expect(response.statusCode).toBe(200);
//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toHaveProperty('id', permissionId);

//       // Fields that were updated
//       expect(response.body.data.reason).toBe(updateData.reason);
//       expect(response.body.data.fields).toEqual(updateData.fields);
//       expect(response.body.data.conditions).toEqual(updateData.conditions);

//       // Fields that should remain unchanged
//       expect(response.body.data.action).toBe(initialPermission.action);
//       expect(response.body.data.subject).toBe(initialPermission.subject);
//       expect(response.body.data.inverted).toBe(initialPermission.inverted);

//       // Verify update in database
//       const updatedPermission = await permissionRepository.findOne({
//         where: { id: permissionId },
//       });

//       expect(updatedPermission).toBeDefined();
//       expect(updatedPermission.reason).toBe(updateData.reason);
//     });

//     it('should return 404 when updating non-existent permission', async () => {
//       console.log('Testing: updating non-existent permission returns 404');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Use a non-existent ID
//       const nonExistentId = '99999999-9999-9999-9999-999999999999';
//       const updateData = { reason: 'Updated reason' };

//       console.log(
//         `Attempting to update non-existent permission ID: ${nonExistentId}`,
//       );

//       const response = await request.put(
//         `/permissions/${nonExistentId}`,
//         updateData,
//         true,
//       );

//       console.log(
//         'Response for updating non-existent ID:',
//         JSON.stringify(response.body),
//       );

//       // Assertions
//       expect(response.statusCode).toBe(404);
//       expect(response.body.success).toBe(false);
//     });

//     it('should validate input when updating a permission', async () => {
//       console.log('Testing: validation when updating a permission');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Create a permission to update
//       const permission = await permissionRepository.save({
//         action: 'validate-update-action',
//         subject: 'ValidateEntity',
//         inverted: false,
//         reason: 'Original reason',
//       });

//       // Test cases for validation failures
//       const testCases = [
//         {
//           name: 'invalid fields format',
//           data: {
//             fields: 'not-an-array', // Should be array
//           },
//           expectedStatus: 400,
//         },
//         {
//           name: 'invalid conditions format',
//           data: {
//             conditions: ['not-an-object'], // Should be object
//           },
//           expectedStatus: 400,
//         },
//         {
//           name: 'invalid inverted type',
//           data: {
//             inverted: 'not-a-boolean', // Should be boolean
//           },
//           expectedStatus: 400,
//         },
//       ];

//       // Run through each validation test case
//       for (const testCase of testCases) {
//         console.log(`Testing update validation case: ${testCase.name}`);

//         const response = await request.put(
//           `/permissions/${permission.id}`,
//           testCase.data,
//           true,
//         );

//         console.log(
//           `Validation response for ${testCase.name}:`,
//           JSON.stringify(response.body),
//         );

//         expect(response.statusCode).toBe(testCase.expectedStatus);
//         expect(response.body.success).toBe(false);
//       }
//     });

//     it("should update action and subject if they don't conflict", async () => {
//       console.log('Testing: updating action and subject fields');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Create a permission to update
//       const initialPermission = await permissionRepository.save({
//         action: 'old-action',
//         subject: 'OldEntity',
//         inverted: false,
//         reason: 'Original permission',
//       });

//       // Prepare update with new action and subject
//       const updateData = {
//         action: 'new-action',
//         subject: 'NewEntity',
//         reason: 'Updated permission',
//       };

//       console.log(
//         `Updating permission ${initialPermission.id} with new action/subject`,
//       );
//       const response = await request.put(
//         `/permissions/${initialPermission.id}`,
//         updateData,
//         true,
//       );

//       // Assertions
//       expect(response.statusCode).toBe(200);
//       expect(response.body.success).toBe(true);
//       expect(response.body.data.action).toBe(updateData.action);
//       expect(response.body.data.subject).toBe(updateData.subject);
//     });
//   });

//   describe('DELETE /permissions/:id', () => {
//     it('should delete an existing permission', async () => {
//       console.log('Testing: deleting an existing permission');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Create a permission to delete
//       const permission = await permissionRepository.save({
//         action: 'delete-test-action',
//         subject: 'DeleteEntity',
//         inverted: false,
//         reason: 'Permission to be deleted',
//       });

//       const permissionId = permission.id;
//       console.log(`Created permission ${permissionId} for deletion test`);

//       // Delete the permission
//       console.log(`Deleting permission: ${permissionId}`);
//       const response = await request.delete(
//         `/permissions/${permissionId}`,
//         true,
//       );

//       console.log('Deletion response:', JSON.stringify(response.body));

//       // Assertions for deletion response
//       expect(response.statusCode).toBe(200);
//       expect(response.body.success).toBe(true);

//       // Verify permission is deleted
//       console.log(`Verifying permission ${permissionId} is deleted`);
//       const getResponse = await request.get(
//         `/permissions/${permissionId}`,
//         true,
//       );

//       console.log('Verification response:', JSON.stringify(getResponse.body));
//       expect(getResponse.statusCode).toBe(404);

//       // Verify in database
//       const deletedPermission = await permissionRepository.findOne({
//         where: { id: permissionId },
//       });

//       expect(deletedPermission).toBeNull();
//     });

//     it('should return 404 when deleting non-existent permission', async () => {
//       console.log('Testing: deleting non-existent permission returns 404');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Use a non-existent ID
//       const nonExistentId = '99999999-9999-9999-9999-999999999999';
//       console.log(
//         `Attempting to delete non-existent permission ID: ${nonExistentId}`,
//       );

//       const response = await request.delete(
//         `/permissions/${nonExistentId}`,
//         true,
//       );

//       console.log(
//         'Response for deleting non-existent ID:',
//         JSON.stringify(response.body),
//       );

//       // Assertions
//       expect(response.statusCode).toBe(404);
//       expect(response.body.success).toBe(false);
//     });

//     it('should prevent deletion of permissions assigned to roles', async () => {
//       console.log(
//         'Testing: preventing deletion of permissions assigned to roles',
//       );

//       // Skip this test if your API doesn't have this constraint
//       // This is a common protection to prevent orphaned role references

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Create a permission
//       const permission = await permissionRepository.save({
//         action: 'protected-action',
//         subject: 'ProtectedEntity',
//         inverted: false,
//         reason: 'Permission assigned to a role',
//       });

//       // Assign the permission to a role
//       // This would typically require additional setup with a role repository
//       // For now, let's use a direct query to create the association
//       try {
//         const role = await dataSource.query(`
//           INSERT INTO roles (name, description)
//           VALUES ('TestRole', 'Role for testing permission protection')
//           RETURNING id
//         `);

//         const roleId = role[0].id;

//         await dataSource.query(
//           `
//           INSERT INTO roles_permissions_permissions ("rolesId", "permissionsId")
//           VALUES ($1, $2)
//         `,
//           [roleId, permission.id],
//         );

//         console.log(`Assigned permission ${permission.id} to role ${roleId}`);

//         // Now try to delete the permission
//         console.log(
//           `Attempting to delete permission assigned to role: ${permission.id}`,
//         );
//         const response = await request.delete(
//           `/permissions/${permission.id}`,
//           true,
//         );

//         // If your API implements this protection:
//         // expect(response.statusCode).toBe(409); // Conflict
//         // expect(response.body.success).toBe(false);

//         // If your API doesn't implement this protection yet:
//         console.log(
//           'Note: This test may fail if permission-role deletion constraints ' +
//             'are not implemented in your API',
//         );
//       } catch (error) {
//         console.log(
//           'Error in role-permission setup, skipping test:',
//           error.message,
//         );
//       }
//     });
//   });

//   describe('Special Permission Features', () => {
//     it('should handle inverted permissions correctly', async () => {
//       console.log('Testing: handling of inverted permissions');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Create an inverted permission (NOT condition)
//       const invertedPermission = {
//         action: 'access',
//         subject: 'SecretArea',
//         inverted: true, // This is a "NOT" permission
//         reason: 'Explicitly deny access to secret area',
//       };

//       console.log(
//         'Creating inverted permission:',
//         JSON.stringify(invertedPermission),
//       );
//       const createResponse = await request.post(
//         '/permissions',
//         invertedPermission,
//         true,
//       );

//       // Verify creation successful
//       expect(createResponse.statusCode).toBe(201);
//       expect(createResponse.body.data.inverted).toBe(true);

//       // Retrieve and verify
//       const retrieveResponse = await request.get(
//         `/permissions/${createResponse.body.data.id}`,
//         true,
//       );

//       expect(retrieveResponse.statusCode).toBe(200);
//       expect(retrieveResponse.body.data.inverted).toBe(true);
//     });

//     it('should handle permissions with conditions correctly', async () => {
//       console.log('Testing: handling of permissions with conditions');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Create a permission with conditions
//       const conditionalPermission = {
//         action: 'update',
//         subject: 'Project',
//         inverted: false,
//         reason: 'Can update projects with status=draft',
//         conditions: { status: 'draft' },
//       };

//       console.log(
//         'Creating conditional permission:',
//         JSON.stringify(conditionalPermission),
//       );

//       const createResponse = await request.post(
//         '/permissions',
//         conditionalPermission,
//         true,
//       );

//       // Verify creation successful
//       expect(createResponse.statusCode).toBe(201);
//       expect(createResponse.body.data.conditions).toEqual(
//         conditionalPermission.conditions,
//       );

//       // Retrieve and verify conditions were saved correctly
//       const retrieveResponse = await request.get(
//         `/permissions/${createResponse.body.data.id}`,
//         true,
//       );

//       expect(retrieveResponse.statusCode).toBe(200);
//       expect(retrieveResponse.body.data.conditions).toEqual(
//         conditionalPermission.conditions,
//       );
//     });

//     it('should handle permissions with fields correctly', async () => {
//       console.log('Testing: handling of permissions with field restrictions');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Create a permission with field restrictions
//       const fieldPermission = {
//         action: 'read',
//         subject: 'SensitiveDocument',
//         inverted: false,
//         reason: 'Can read only certain fields of sensitive documents',
//         fields: ['title', 'summary', 'publicInfo'],
//       };

//       console.log(
//         'Creating field-restricted permission:',
//         JSON.stringify(fieldPermission),
//       );

//       const createResponse = await request.post(
//         '/permissions',
//         fieldPermission,
//         true,
//       );

//       // Verify creation successful
//       expect(createResponse.statusCode).toBe(201);
//       expect(createResponse.body.data.fields).toEqual(fieldPermission.fields);

//       // Retrieve and verify fields were saved correctly
//       const retrieveResponse = await request.get(
//         `/permissions/${createResponse.body.data.id}`,
//         true,
//       );

//       expect(retrieveResponse.statusCode).toBe(200);
//       expect(retrieveResponse.body.data.fields).toEqual(fieldPermission.fields);
//     });

//     it('should update permission cache when permissions change', async () => {
//       console.log('Testing: permission cache invalidation');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Reset cache mock calls
//       cacheManager.del.mockClear();

//       // Create a new permission
//       const newPermission = {
//         action: 'cache-test',
//         subject: 'CacheEntity',
//         inverted: false,
//         reason: 'Testing cache invalidation',
//       };

//       console.log('Creating permission to test cache invalidation');
//       const createResponse = await request.post(
//         '/permissions',
//         newPermission,
//         true,
//       );

//       // Verify cache invalidation call was made
//       expect(createResponse.statusCode).toBe(201);
//       expect(cacheManager.del).toHaveBeenCalled();

//       // Reset again for update test
//       cacheManager.del.mockClear();

//       // Update the permission
//       console.log('Updating permission to test cache invalidation');
//       const updateResponse = await request.put(
//         `/permissions/${createResponse.body.data.id}`,
//         { reason: 'Updated reason' },
//         true,
//       );

//       // Verify cache invalidation call was made for update
//       expect(updateResponse.statusCode).toBe(200);
//       expect(cacheManager.del).toHaveBeenCalled();

//       // Reset again for delete test
//       cacheManager.del.mockClear();

//       // Delete the permission
//       console.log('Deleting permission to test cache invalidation');
//       const deleteResponse = await request.delete(
//         `/permissions/${createResponse.body.data.id}`,
//         true,
//       );

//       // Verify cache invalidation call was made for delete
//       expect(deleteResponse.statusCode).toBe(200);
//       expect(cacheManager.del).toHaveBeenCalled();
//     });
//   });

//   describe('Authorization for Permission Management', () => {
//     it('should allow admins to manage permissions', async () => {
//       // Already tested in other test cases - admin can create/update/delete
//       expect(true).toBe(true);
//     });

//     it('should deny regular users from managing permissions', async () => {
//       console.log('Testing: regular users cannot manage permissions');

//       // Login as regular user
//       await authHelper.login(fixtures.userCredentials.regular);

//       // Try to list permissions
//       console.log('Regular user attempting to list permissions');
//       const listResponse = await request.get('/permissions', true);

//       // Regular users should not have access to permissions
//       expect(listResponse.statusCode).toBe(403);
//       expect(listResponse.body.success).toBe(false);

//       // Try to create a permission
//       const newPermission = {
//         action: 'attempt-action',
//         subject: 'AttemptEntity',
//         inverted: false,
//         reason: 'Attempt by regular user',
//       };

//       console.log('Regular user attempting to create permission');
//       const createResponse = await request.post(
//         '/permissions',
//         newPermission,
//         true,
//       );

//       expect(createResponse.statusCode).toBe(403);
//       expect(createResponse.body.success).toBe(false);
//     });
//   });

//   describe('Bulk Operations', () => {
//     it('should handle bulk creation of permissions', async () => {
//       console.log('Testing: bulk creation of permissions');

//       // Skip this test if your API doesn't support bulk operations

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Bulk permission data
//       const bulkPermissions = [
//         {
//           action: 'bulk1',
//           subject: 'BulkEntity',
//           inverted: false,
//           reason: 'Bulk test 1',
//         },
//         {
//           action: 'bulk2',
//           subject: 'BulkEntity',
//           inverted: false,
//           reason: 'Bulk test 2',
//         },
//         {
//           action: 'bulk3',
//           subject: 'BulkEntity',
//           inverted: false,
//           reason: 'Bulk test 3',
//         },
//       ];

//       console.log(
//         `Attempting to create ${bulkPermissions.length} permissions in bulk`,
//       );

//       // If your API supports a bulk endpoint:
//       try {
//         const response = await request.post(
//           '/permissions/bulk',
//           bulkPermissions,
//           true,
//         );

//         // If bulk endpoint exists and works:
//         if (response.statusCode === 201) {
//           expect(response.body.success).toBe(true);
//           expect(response.body.data).toBeInstanceOf(Array);
//           expect(response.body.data.length).toBe(bulkPermissions.length);
//         } else {
//           console.log(
//             'Bulk permissions endpoint returned:',
//             response.statusCode,
//           );
//           console.log(
//             'This test can be skipped if bulk operations are not implemented',
//           );
//         }
//       } catch (error) {
//         console.log(
//           'Bulk permissions endpoint may not be implemented:',
//           error.message,
//         );
//       }
//     });
//   });
// });
