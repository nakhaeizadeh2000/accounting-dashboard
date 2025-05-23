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
// import { Role } from '../../../src/role/entities/role.entity';
// import { Permission } from '../../../src/permissions/entities/permission.entity';
// import { User } from '../../../src/modules/users/entities/user.entity';
// import { DataSource, Repository } from 'typeorm';

// describe('Roles Module (e2e)', () => {
//   let request: TestRequest;
//   let dbHelper: DatabaseTestHelper;
//   let authHelper: AuthTestHelper;
//   let cacheManager: any;
//   let dataSource: DataSource;
//   let roleRepository: Repository<Role>;
//   let permissionRepository: Repository<Permission>;
//   let userRepository: Repository<User>;

//   beforeAll(async () => {
//     console.log('Setting up test environment for roles tests');
//     await setupTestApp();

//     // Get global resources
//     cacheManager = getCacheManager();
//     dataSource = getTestDataSource();

//     // Initialize test helpers
//     request = new TestRequest();
//     dbHelper = new DatabaseTestHelper();
//     await dbHelper.init();
//     authHelper = new AuthTestHelper(request, dbHelper);

//     // Get the repositories
//     roleRepository = dataSource.getRepository(Role);
//     permissionRepository = dataSource.getRepository(Permission);
//     userRepository = dataSource.getRepository(User);

//     console.log('✅ Test environment setup complete for roles tests');
//   });

//   beforeEach(async () => {
//     console.log('Starting new transaction for test isolation');

//     // Start transaction for test isolation
//     await dbHelper.startTransaction();

//     // Get transaction-specific repositories
//     roleRepository = dbHelper.getRepository(Role);
//     permissionRepository = dbHelper.getRepository(Permission);
//     userRepository = dbHelper.getRepository(User);

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

//   describe('GET /roles', () => {
//     it('should return all roles for admin', async () => {
//       console.log('Testing: admin should get all roles');

//       // Login as admin
//       console.log('Logging in as admin');
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Seed some test roles with permissions
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

//       const testRoles = await Promise.all([
//         roleRepository.save({
//           name: 'Editor',
//           description: 'Can edit content',
//           permissions: [testPermissions[0], testPermissions[1]],
//         }),
//         roleRepository.save({
//           name: 'Viewer',
//           description: 'Can view content',
//           permissions: [testPermissions[0]],
//         }),
//       ]);

//       console.log(`Created ${testRoles.length} test roles with permissions`);

//       // Request roles list
//       console.log('Requesting roles list');
//       const response = await request.get('/roles', true);

//       console.log(
//         `Roles response: Status ${response.statusCode}, Items: ${
//           response.body.data?.items?.length || 0
//         }`,
//       );

//       // Assertions
//       expect(response.statusCode).toBe(200);
//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toHaveProperty('items');
//       expect(response.body.data.items).toBeInstanceOf(Array);
//       expect(response.body.data.items.length).toBeGreaterThan(0);

//       // Verify role structure
//       const role = response.body.data.items[0];
//       console.log('Checking role structure:', JSON.stringify(role));

//       expect(role).toHaveProperty('id');
//       expect(role).toHaveProperty('name');
//       expect(role).toHaveProperty('permissions');
//       expect(role.permissions).toBeInstanceOf(Array);

//       // Verify our test roles are included
//       const testRoleIds = testRoles.map((r) => r.id);
//       const returnedIds = response.body.data.items.map((r) => r.id);

//       testRoleIds.forEach((id) => {
//         expect(returnedIds).toContain(id);
//       });
//     });

//     it('should return paginated results when limit and page are specified', async () => {
//       console.log('Testing: roles list should support pagination');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Create 10 test roles
//       const testRoles = [];
//       for (let i = 0; i < 10; i++) {
//         testRoles.push(
//           await roleRepository.save({
//             name: `TestRole${i}`,
//             description: `Test role ${i}`,
//           }),
//         );
//       }

//       console.log(`Created ${testRoles.length} test roles for pagination test`);

//       // Request first page with 5 items
//       const page1Response = await request.get('/roles?page=1&limit=5', true);

//       // Assertions for first page
//       expect(page1Response.statusCode).toBe(200);
//       expect(page1Response.body.success).toBe(true);
//       expect(page1Response.body.data.items.length).toBeLessThanOrEqual(5);
//       expect(page1Response.body.data).toHaveProperty('meta');
//       expect(page1Response.body.data.meta).toHaveProperty('totalItems');
//       expect(page1Response.body.data.meta).toHaveProperty('itemsPerPage', 5);
//       expect(page1Response.body.data.meta).toHaveProperty('currentPage', 1);

//       // Request second page
//       const page2Response = await request.get('/roles?page=2&limit=5', true);

//       // Assertions for second page
//       expect(page2Response.statusCode).toBe(200);
//       expect(page2Response.body.success).toBe(true);
//       expect(page2Response.body.data.items.length).toBeLessThanOrEqual(5);
//       expect(page2Response.body.data.meta).toHaveProperty('currentPage', 2);

//       // Verify different items on different pages
//       const page1Ids = page1Response.body.data.items.map((r) => r.id);
//       const page2Ids = page2Response.body.data.items.map((r) => r.id);

//       // No item should appear on both pages
//       const duplicateIds = page1Ids.filter((id) => page2Ids.includes(id));
//       expect(duplicateIds.length).toBe(0);
//     });

//     it('should return 401 for unauthenticated request', async () => {
//       console.log('Testing: unauthenticated requests should be rejected');

//       // Make request without authentication
//       console.log('Requesting roles without authentication');
//       const response = await request.get('/roles');

//       console.log('Unauthenticated response:', JSON.stringify(response.body));

//       expect(response.statusCode).toBe(401);
//       expect(response.body.success).toBe(false);
//     });

//     it('should support filtering by name', async () => {
//       console.log('Testing: roles list should support filtering by name');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Create test roles with different names
//       await Promise.all([
//         roleRepository.save({
//           name: 'AdminRole',
//           description: 'Administrator role',
//         }),
//         roleRepository.save({
//           name: 'EditorRole',
//           description: 'Editor role',
//         }),
//         roleRepository.save({
//           name: 'ViewerRole',
//           description: 'Viewer role',
//         }),
//       ]);

//       // Filter by name
//       const filterResponse = await request.get('/roles?name=Editor', true);

//       expect(filterResponse.statusCode).toBe(200);
//       expect(filterResponse.body.success).toBe(true);
//       expect(filterResponse.body.data.items.length).toBeGreaterThan(0);

//       // All items should contain "Editor" in their name
//       const allContainEditor = filterResponse.body.data.items.every((r) =>
//         r.name.includes('Editor'),
//       );
//       expect(allContainEditor).toBe(true);
//     });
//   });

//   describe('GET /roles/:id', () => {
//     it('should return a specific role with permissions', async () => {
//       console.log('Testing: get specific role by ID');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Create test permissions
//       const permissions = await Promise.all([
//         permissionRepository.save({
//           action: 'read',
//           subject: 'Article',
//           inverted: false,
//           reason: 'Can read articles',
//         }),
//         permissionRepository.save({
//           action: 'create',
//           subject: 'Article',
//           inverted: false,
//           reason: 'Can create articles',
//         }),
//       ]);

//       // Create a test role with permissions
//       const testRole = await roleRepository.save({
//         name: 'ContentEditor',
//         description: 'Can edit content',
//         permissions: permissions,
//       });

//       const roleId = testRole.id;
//       console.log(`Created test role with ID: ${roleId}`);

//       // Request the specific role
//       console.log(`Requesting specific role: ${roleId}`);
//       const response = await request.get(`/roles/${roleId}`, true);

//       console.log('Specific role response:', JSON.stringify(response.body));

//       // Assertions
//       expect(response.statusCode).toBe(200);
//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toHaveProperty('id', roleId);
//       expect(response.body.data).toHaveProperty('name', testRole.name);
//       expect(response.body.data).toHaveProperty(
//         'description',
//         testRole.description,
//       );

//       // Check permissions
//       expect(response.body.data).toHaveProperty('permissions');
//       expect(response.body.data.permissions).toBeInstanceOf(Array);
//       expect(response.body.data.permissions.length).toBe(permissions.length);

//       // Verify permission IDs match
//       const permissionIds = permissions.map((p) => p.id);
//       const returnedPermissionIds = response.body.data.permissions.map(
//         (p) => p.id,
//       );

//       permissionIds.forEach((id) => {
//         expect(returnedPermissionIds).toContain(id);
//       });
//     });

//     it('should include users assigned to the role when requested', async () => {
//       console.log('Testing: getting role with users included');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Create a test role
//       const testRole = await roleRepository.save({
//         name: 'UsersTestRole',
//         description: 'Role with users for testing',
//       });

//       // Create users and assign the role
//       const users = await Promise.all([
//         userRepository.save({
//           email: 'role-user1@example.com',
//           password:
//             '$2a$10$XqAYPPZQ8q.hg5UJASyUsOSDokBnUjNE4ZCrKa2YBvFAWOiyQRK6u', // admin123
//           firstName: 'Role',
//           lastName: 'User1',
//           roles: [testRole],
//         }),
//         userRepository.save({
//           email: 'role-user2@example.com',
//           password:
//             '$2a$10$XqAYPPZQ8q.hg5UJASyUsOSDokBnUjNE4ZCrKa2YBvFAWOiyQRK6u', // admin123
//           firstName: 'Role',
//           lastName: 'User2',
//           roles: [testRole],
//         }),
//       ]);

//       console.log(
//         `Created role ${testRole.id} with ${users.length} assigned users`,
//       );

//       // Request role with users included
//       const response = await request.get(
//         `/roles/${testRole.id}?include=users`,
//         true,
//       );

//       // Check if the API supports this feature
//       expect(response.statusCode).toBe(200);
//       expect(response.body.success).toBe(true);

//       // If include=users is supported, check the results
//       if (response.body.data.users) {
//         expect(response.body.data.users).toBeInstanceOf(Array);
//         expect(response.body.data.users.length).toBe(users.length);

//         // Verify user IDs match
//         const userIds = users.map((u) => u.id);
//         const returnedUserIds = response.body.data.users.map((u) => u.id);

//         userIds.forEach((id) => {
//           expect(returnedUserIds).toContain(id);
//         });
//       } else {
//         console.log('Include users feature may not be implemented yet');
//       }
//     });

//     it('should return 404 for non-existent role', async () => {
//       console.log('Testing: request for non-existent role ID returns 404');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Use a non-existent ID
//       const nonExistentId = '99999999-9999-9999-9999-999999999999';
//       console.log(`Requesting non-existent role ID: ${nonExistentId}`);

//       const response = await request.get(`/roles/${nonExistentId}`, true);
//       console.log(
//         'Response for non-existent ID:',
//         JSON.stringify(response.body),
//       );

//       // Assertions
//       expect(response.statusCode).toBe(404);
//       expect(response.body.success).toBe(false);
//     });
//   });

//   describe('POST /roles', () => {
//     it('should create a new role with permissions', async () => {
//       console.log('Testing: creating a new role with permissions');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Create test permissions to attach to the role
//       const testPermissions = await Promise.all([
//         permissionRepository.save({
//           action: 'read',
//           subject: 'RoleTest',
//           inverted: false,
//           reason: 'Read permission for role test',
//         }),
//         permissionRepository.save({
//           action: 'create',
//           subject: 'RoleTest',
//           inverted: false,
//           reason: 'Create permission for role test',
//         }),
//         permissionRepository.save({
//           action: 'update',
//           subject: 'RoleTest',
//           inverted: false,
//           reason: 'Update permission for role test',
//         }),
//       ]);

//       const permissionIds = testPermissions.map((p) => p.id);
//       console.log(`Created ${permissionIds.length} permissions for new role`);

//       // Prepare role data
//       const newRole = {
//         name: 'TestEditor',
//         description: 'Role for testing creation',
//         permissionIds: permissionIds,
//       };

//       console.log('Creating new role:', JSON.stringify(newRole));
//       const response = await request.post('/roles', newRole, true);

//       console.log('Creation response:', JSON.stringify(response.body));

//       // Assertions
//       expect(response.statusCode).toBe(201);
//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toHaveProperty('id');
//       expect(response.body.data.name).toBe(newRole.name);
//       expect(response.body.data.description).toBe(newRole.description);

//       // Check permissions
//       expect(response.body.data).toHaveProperty('permissions');
//       expect(response.body.data.permissions).toBeInstanceOf(Array);
//       expect(response.body.data.permissions.length).toBe(permissionIds.length);

//       // Verify permission IDs match
//       const returnedPermissionIds = response.body.data.permissions.map(
//         (p) => p.id,
//       );
//       permissionIds.forEach((id) => {
//         expect(returnedPermissionIds).toContain(id);
//       });

//       // Verify role was actually created in the database
//       const savedRole = await roleRepository.findOne({
//         where: { id: response.body.data.id },
//         relations: ['permissions'],
//       });

//       expect(savedRole).toBeDefined();
//       expect(savedRole.name).toBe(newRole.name);
//       expect(savedRole.permissions.length).toBe(permissionIds.length);
//     });

//     it('should create a role without permissions', async () => {
//       console.log('Testing: creating a role without permissions');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Prepare role data without permissions
//       const newRole = {
//         name: 'EmptyRole',
//         description: 'Role with no permissions',
//       };

//       console.log(
//         'Creating role without permissions:',
//         JSON.stringify(newRole),
//       );
//       const response = await request.post('/roles', newRole, true);

//       // Assertions
//       expect(response.statusCode).toBe(201);
//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toHaveProperty('id');
//       expect(response.body.data.name).toBe(newRole.name);
//       expect(response.body.data.description).toBe(newRole.description);

//       // Should have empty permissions array
//       expect(response.body.data.permissions).toBeInstanceOf(Array);
//       expect(response.body.data.permissions.length).toBe(0);
//     });

//     it('should validate input when creating a role', async () => {
//       console.log('Testing: validation when creating a role');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Test cases for validation failures
//       const testCases = [
//         {
//           name: 'missing required fields',
//           data: {
//             // Missing name
//             description: 'Incomplete role',
//             permissionIds: [],
//           },
//           expectedStatus: 400,
//         },
//         {
//           name: 'invalid permissionIds format',
//           data: {
//             name: 'InvalidRole',
//             description: 'Role with invalid permissions',
//             permissionIds: 'not-an-array', // Should be array
//           },
//           expectedStatus: 400,
//         },
//         {
//           name: 'non-existent permission ID',
//           data: {
//             name: 'BadPermissionsRole',
//             description: 'Role with non-existent permission',
//             permissionIds: ['99999999-9999-9999-9999-999999999999'], // Non-existent ID
//           },
//           expectedStatus: 400, // or 404, depending on your API implementation
//         },
//         {
//           name: 'name too short',
//           data: {
//             name: '', // Empty string
//             description: 'Role with empty name',
//           },
//           expectedStatus: 400,
//         },
//       ];

//       // Run through each validation test case
//       for (const testCase of testCases) {
//         console.log(`Testing validation case: ${testCase.name}`);

//         const response = await request.post('/roles', testCase.data, true);

//         console.log(
//           `Validation response for ${testCase.name}:`,
//           JSON.stringify(response.body),
//         );

//         expect(response.statusCode).toBe(testCase.expectedStatus);
//         expect(response.body.success).toBe(false);
//       }
//     });

//     it('should prevent duplicate role names', async () => {
//       console.log('Testing: preventing duplicate role names');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Create initial role
//       const roleName = 'UniqueRoleName';
//       const roleData = {
//         name: roleName,
//         description: 'Original role',
//       };

//       const firstResponse = await request.post('/roles', roleData, true);
//       expect(firstResponse.statusCode).toBe(201);

//       // Try to create duplicate
//       console.log('Attempting to create duplicate role');
//       const duplicateData = {
//         name: roleName, // Same name
//         description: 'Duplicate role',
//       };

//       const duplicateResponse = await request.post(
//         '/roles',
//         duplicateData,
//         true,
//       );

//       // Should fail with conflict error
//       expect(duplicateResponse.statusCode).toBe(409);
//       expect(duplicateResponse.body.success).toBe(false);
//     });
//   });

//   describe('PUT /roles/:id', () => {
//     it('should update an existing role', async () => {
//       console.log('Testing: updating an existing role');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Create a role to update
//       const initialRole = await roleRepository.save({
//         name: 'RoleToUpdate',
//         description: 'Original description',
//       });

//       // Create permissions to add to the role
//       const permissions = await Promise.all([
//         permissionRepository.save({
//           action: 'read',
//           subject: 'UpdateTest',
//           inverted: false,
//           reason: 'Read permission for update test',
//         }),
//         permissionRepository.save({
//           action: 'update',
//           subject: 'UpdateTest',
//           inverted: false,
//           reason: 'Update permission for update test',
//         }),
//       ]);

//       const permissionIds = permissions.map((p) => p.id);

//       const roleId = initialRole.id;
//       console.log(`Created role ${roleId} for update test`);

//       // Prepare update data
//       const updateData = {
//         name: 'UpdatedRoleName',
//         description: 'Updated description',
//         permissionIds: permissionIds,
//       };

//       console.log(`Updating role ${roleId} with:`, JSON.stringify(updateData));
//       const response = await request.put(`/roles/${roleId}`, updateData, true);

//       console.log('Update response:', JSON.stringify(response.body));

//       // Assertions
//       expect(response.statusCode).toBe(200);
//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toHaveProperty('id', roleId);
//       expect(response.body.data.name).toBe(updateData.name);
//       expect(response.body.data.description).toBe(updateData.description);

//       // Check permissions
//       expect(response.body.data).toHaveProperty('permissions');
//       expect(response.body.data.permissions).toBeInstanceOf(Array);
//       expect(response.body.data.permissions.length).toBe(permissionIds.length);

//       // Verify permission IDs match
//       const returnedPermissionIds = response.body.data.permissions.map(
//         (p) => p.id,
//       );
//       permissionIds.forEach((id) => {
//         expect(returnedPermissionIds).toContain(id);
//       });

//       // Verify update in database
//       const updatedRole = await roleRepository.findOne({
//         where: { id: roleId },
//         relations: ['permissions'],
//       });

//       expect(updatedRole).toBeDefined();
//       expect(updatedRole.name).toBe(updateData.name);
//       expect(updatedRole.permissions.length).toBe(permissionIds.length);
//     });

//     it('should update role without changing permissions if not provided', async () => {
//       console.log('Testing: updating role without changing permissions');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Create permissions for the initial role
//       const permissions = await Promise.all([
//         permissionRepository.save({
//           action: 'read',
//           subject: 'KeepTest',
//           inverted: false,
//           reason: 'Read permission to keep',
//         }),
//         permissionRepository.save({
//           action: 'update',
//           subject: 'KeepTest',
//           inverted: false,
//           reason: 'Update permission to keep',
//         }),
//       ]);

//       // Create a role with permissions
//       const initialRole = await roleRepository.save({
//         name: 'KeepPermissionsRole',
//         description: 'Original description',
//         permissions: permissions,
//       });

//       const roleId = initialRole.id;
//       console.log(`Created role ${roleId} with permissions for update test`);

//       // Prepare update data without permissionIds
//       const updateData = {
//         name: 'NewNameOnly',
//         description: 'Updated description only',
//         // No permissionIds - should keep existing permissions
//       };

//       console.log(`Updating role ${roleId} without changing permissions`);
//       const response = await request.put(`/roles/${roleId}`, updateData, true);

//       // Assertions
//       expect(response.statusCode).toBe(200);
//       expect(response.body.success).toBe(true);
//       expect(response.body.data.name).toBe(updateData.name);
//       expect(response.body.data.description).toBe(updateData.description);

//       // Should still have the original permissions
//       expect(response.body.data.permissions).toBeInstanceOf(Array);
//       expect(response.body.data.permissions.length).toBe(permissions.length);

//       // Verify in database
//       const updatedRole = await roleRepository.findOne({
//         where: { id: roleId },
//         relations: ['permissions'],
//       });

//       expect(updatedRole.permissions.length).toBe(permissions.length);
//     });

//     it('should return 404 when updating non-existent role', async () => {
//       console.log('Testing: updating non-existent role returns 404');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Use a non-existent ID
//       const nonExistentId = '99999999-9999-9999-9999-999999999999';
//       const updateData = {
//         name: 'NonExistentRole',
//         description: 'Updated description',
//       };

//       console.log(
//         `Attempting to update non-existent role ID: ${nonExistentId}`,
//       );
//       const response = await request.put(
//         `/roles/${nonExistentId}`,
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

//     it('should validate input when updating a role', async () => {
//       console.log('Testing: validation when updating a role');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Create a role to update
//       const role = await roleRepository.save({
//         name: 'ValidationUpdateRole',
//         description: 'Role for validation testing',
//       });

//       // Test cases for validation failures
//       const testCases = [
//         {
//           name: 'empty name',
//           data: {
//             name: '', // Empty name
//             description: 'Role with empty name',
//           },
//           expectedStatus: 400,
//         },
//         {
//           name: 'invalid permissionIds format',
//           data: {
//             name: 'ValidName',
//             permissionIds: 'not-an-array', // Should be array
//           },
//           expectedStatus: 400,
//         },
//         {
//           name: 'non-existent permission ID',
//           data: {
//             name: 'ValidName',
//             permissionIds: ['99999999-9999-9999-9999-999999999999'], // Non-existent ID
//           },
//           expectedStatus: 400, // or 404, depending on your API implementation
//         },
//       ];

//       // Run through each validation test case
//       for (const testCase of testCases) {
//         console.log(`Testing update validation case: ${testCase.name}`);

//         const response = await request.put(
//           `/roles/${role.id}`,
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
//   });

//   describe('DELETE /roles/:id', () => {
//     it('should delete an existing role', async () => {
//       console.log('Testing: deleting an existing role');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Create a role to delete
//       const role = await roleRepository.save({
//         name: 'RoleToDelete',
//         description: 'Role that will be deleted',
//       });

//       const roleId = role.id;
//       console.log(`Created role ${roleId} for deletion test`);

//       // Delete the role
//       console.log(`Deleting role: ${roleId}`);
//       const response = await request.delete(`/roles/${roleId}`, true);

//       console.log('Deletion response:', JSON.stringify(response.body));

//       // Assertions for deletion response
//       expect(response.statusCode).toBe(200);
//       expect(response.body.success).toBe(true);

//       // Verify role is deleted
//       console.log(`Verifying role ${roleId} is deleted`);
//       const getResponse = await request.get(`/roles/${roleId}`, true);

//       console.log('Verification response:', JSON.stringify(getResponse.body));
//       expect(getResponse.statusCode).toBe(404);

//       // Verify in database
//       const deletedRole = await roleRepository.findOne({
//         where: { id: roleId },
//       });

//       expect(deletedRole).toBeNull();
//     });

//     it('should return 404 when deleting non-existent role', async () => {
//       console.log('Testing: deleting non-existent role returns 404');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Use a non-existent ID
//       const nonExistentId = '99999999-9999-9999-9999-999999999999';
//       console.log(
//         `Attempting to delete non-existent role ID: ${nonExistentId}`,
//       );

//       const response = await request.delete(`/roles/${nonExistentId}`, true);

//       console.log(
//         'Response for deleting non-existent ID:',
//         JSON.stringify(response.body),
//       );

//       // Assertions
//       expect(response.statusCode).toBe(404);
//       expect(response.body.success).toBe(false);
//     });

//     it('should handle deleting a role with assigned users', async () => {
//       console.log('Testing: deleting a role with assigned users');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Create a role
//       const role = await roleRepository.save({
//         name: 'AssignedRole',
//         description: 'Role assigned to users',
//       });

//       // Create users and assign the role
//       const users = await Promise.all([
//         userRepository.save({
//           email: 'assigned-user1@example.com',
//           password:
//             '$2a$10$XqAYPPZQ8q.hg5UJASyUsOSDokBnUjNE4ZCrKa2YBvFAWOiyQRK6u', // admin123
//           firstName: 'Assigned',
//           lastName: 'User1',
//           roles: [role],
//         }),
//         userRepository.save({
//           email: 'assigned-user2@example.com',
//           password:
//             '$2a$10$XqAYPPZQ8q.hg5UJASyUsOSDokBnUjNE4ZCrKa2YBvFAWOiyQRK6u', // admin123
//           firstName: 'Assigned',
//           lastName: 'User2',
//           roles: [role],
//         }),
//       ]);

//       console.log(
//         `Created role ${role.id} with ${users.length} assigned users`,
//       );

//       // Try to delete the role
//       console.log(`Attempting to delete role with assigned users: ${role.id}`);
//       const response = await request.delete(`/roles/${role.id}`, true);

//       // Check the behavior of your API:
//       // 1. If it allows cascading deletion (removes role assignments):
//       if (response.statusCode === 200) {
//         console.log(
//           'API allows deletion of roles with users (removes assignments)',
//         );
//         expect(response.body.success).toBe(true);

//         // Verify role is deleted
//         const deletedRole = await roleRepository.findOne({
//           where: { id: role.id },
//         });
//         expect(deletedRole).toBeNull();

//         // Verify users still exist but without the role
//         for (const user of users) {
//           const updatedUser = await userRepository.findOne({
//             where: { id: user.id },
//             relations: ['roles'],
//           });

//           expect(updatedUser).not.toBeNull();
//           const hasRole = updatedUser.roles.some((r) => r.id === role.id);
//           expect(hasRole).toBe(false);
//         }
//       }
//       // 2. If it prevents deletion when roles are assigned to users (409 Conflict):
//       else if (response.statusCode === 409) {
//         console.log('API prevents deletion of roles assigned to users');
//         expect(response.body.success).toBe(false);

//         // Verify role still exists
//         const roleStillExists = await roleRepository.findOne({
//           where: { id: role.id },
//         });
//         expect(roleStillExists).not.toBeNull();
//       }
//       // 3. Any other behavior should be documented
//       else {
//         console.log(
//           `API returned status ${response.statusCode} for deleting role with users`,
//         );
//         console.log('Response:', JSON.stringify(response.body));
//       }
//     });

//     it('should handle deleting a role with assigned permissions', async () => {
//       console.log('Testing: deleting a role with assigned permissions');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Create permissions
//       const permissions = await Promise.all([
//         permissionRepository.save({
//           action: 'read',
//           subject: 'DeleteTest',
//           inverted: false,
//           reason: 'Read permission for delete test',
//         }),
//         permissionRepository.save({
//           action: 'update',
//           subject: 'DeleteTest',
//           inverted: false,
//           reason: 'Update permission for delete test',
//         }),
//       ]);

//       // Create a role with permissions
//       const role = await roleRepository.save({
//         name: 'RoleWithPermissions',
//         description: 'Role with permissions for delete test',
//         permissions: permissions,
//       });

//       console.log(
//         `Created role ${role.id} with ${permissions.length} permissions`,
//       );

//       // Delete the role
//       console.log(`Deleting role with permissions: ${role.id}`);
//       const response = await request.delete(`/roles/${role.id}`, true);

//       // Assertions
//       expect(response.statusCode).toBe(200);
//       expect(response.body.success).toBe(true);

//       // Verify role is deleted
//       const deletedRole = await roleRepository.findOne({
//         where: { id: role.id },
//       });
//       expect(deletedRole).toBeNull();

//       // Verify permissions still exist
//       for (const permission of permissions) {
//         const permissionStillExists = await permissionRepository.findOne({
//           where: { id: permission.id },
//         });
//         expect(permissionStillExists).not.toBeNull();
//       }
//     });
//   });

//   describe('Role Specific Features', () => {
//     it('should update cache when roles change', async () => {
//       console.log('Testing: role cache invalidation');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Reset cache mock calls
//       cacheManager.del.mockClear();

//       // Create a new role
//       const newRole = {
//         name: 'CacheTestRole',
//         description: 'Role for testing cache invalidation',
//       };

//       console.log('Creating role to test cache invalidation');
//       const createResponse = await request.post('/roles', newRole, true);

//       // Verify cache invalidation call was made
//       expect(createResponse.statusCode).toBe(201);
//       expect(cacheManager.del).toHaveBeenCalled();

//       // Reset again for update test
//       cacheManager.del.mockClear();

//       // Update the role
//       console.log('Updating role to test cache invalidation');
//       const updateResponse = await request.put(
//         `/roles/${createResponse.body.data.id}`,
//         { description: 'Updated description' },
//         true,
//       );

//       // Verify cache invalidation call was made for update
//       expect(updateResponse.statusCode).toBe(200);
//       expect(cacheManager.del).toHaveBeenCalled();

//       // Reset again for delete test
//       cacheManager.del.mockClear();

//       // Delete the role
//       console.log('Deleting role to test cache invalidation');
//       const deleteResponse = await request.delete(
//         `/roles/${createResponse.body.data.id}`,
//         true,
//       );

//       // Verify cache invalidation call was made for delete
//       expect(deleteResponse.statusCode).toBe(200);
//       expect(cacheManager.del).toHaveBeenCalled();
//     });

//     it('should retrieve roles assigned to a user', async () => {
//       console.log('Testing: getting roles assigned to a user');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Create roles
//       const roles = await Promise.all([
//         roleRepository.save({
//           name: 'UserRole1',
//           description: 'First role for user',
//         }),
//         roleRepository.save({
//           name: 'UserRole2',
//           description: 'Second role for user',
//         }),
//       ]);

//       // Create a user with these roles
//       const user = await userRepository.save({
//         email: 'user-with-roles@example.com',
//         password:
//           '$2a$10$XqAYPPZQ8q.hg5UJASyUsOSDokBnUjNE4ZCrKa2YBvFAWOiyQRK6u', // admin123
//         firstName: 'User',
//         lastName: 'WithRoles',
//         roles: roles,
//       });

//       console.log(`Created user ${user.id} with ${roles.length} roles`);

//       // If your API has an endpoint to get roles for a user
//       try {
//         const response = await request.get(`/users/${user.id}/roles`, true);

//         if (response.statusCode === 200) {
//           console.log('User roles endpoint available');
//           expect(response.body.success).toBe(true);
//           expect(response.body.data).toBeInstanceOf(Array);
//           expect(response.body.data.length).toBe(roles.length);

//           // Verify role IDs match
//           const roleIds = roles.map((r) => r.id);
//           const returnedRoleIds = response.body.data.map((r) => r.id);

//           roleIds.forEach((id) => {
//             expect(returnedRoleIds).toContain(id);
//           });
//         } else {
//           console.log(
//             `User roles endpoint returned status ${response.statusCode}`,
//           );
//         }
//       } catch (error) {
//         console.log(
//           'User roles endpoint may not be implemented:',
//           error.message,
//         );
//       }

//       // Alternative: Check user endpoint with roles included
//       try {
//         const response = await request.get(
//           `/users/${user.id}?include=roles`,
//           true,
//         );

//         if (response.statusCode === 200 && response.body.data.roles) {
//           console.log('User endpoint with roles inclusion is available');
//           expect(response.body.data.roles).toBeInstanceOf(Array);
//           expect(response.body.data.roles.length).toBe(roles.length);
//         } else {
//           console.log('User endpoint may not support roles inclusion');
//         }
//       } catch (error) {
//         console.log('Error checking user endpoint with roles:', error.message);
//       }
//     });

//     it('should correctly check permissions based on roles', async () => {
//       console.log('Testing: permission checking based on roles');

//       // Create permissions
//       const permissions = await Promise.all([
//         permissionRepository.save({
//           action: 'read',
//           subject: 'TestResource',
//           inverted: false,
//           reason: 'Allow reading test resource',
//         }),
//         permissionRepository.save({
//           action: 'create',
//           subject: 'TestResource',
//           inverted: false,
//           reason: 'Allow creating test resource',
//         }),
//       ]);

//       // Create role with these permissions
//       const role = await roleRepository.save({
//         name: 'ResourceManager',
//         description: 'Can manage test resources',
//         permissions: permissions,
//       });

//       // Create a user with this role
//       const user = await userRepository.save({
//         email: 'permission-test@example.com',
//         password:
//           '$2a$10$XqAYPPZQ8q.hg5UJASyUsOSDokBnUjNE4ZCrKa2YBvFAWOiyQRK6u', // admin123
//         firstName: 'Permission',
//         lastName: 'Tester',
//         roles: [role],
//       });

//       console.log(
//         `Created user ${user.id} with role having ${permissions.length} permissions`,
//       );

//       // Login as the test user
//       await authHelper.login({
//         email: user.email,
//         password: 'admin123',
//       });

//       // If your API has permission checking endpoints
//       try {
//         // Check for a permission the user should have
//         const hasPermissionResponse = await request.get(
//           '/permissions/check?action=read&subject=TestResource',
//           true,
//         );

//         if (hasPermissionResponse.statusCode === 200) {
//           console.log('Permission check endpoint available');
//           expect(hasPermissionResponse.body.success).toBe(true);
//           expect(hasPermissionResponse.body.data.hasPermission).toBe(true);

//           // Check for a permission the user should NOT have
//           const noPermissionResponse = await request.get(
//             '/permissions/check?action=delete&subject=TestResource',
//             true,
//           );
//           expect(noPermissionResponse.body.data.hasPermission).toBe(false);
//         } else {
//           console.log(
//             `Permission check endpoint returned status ${hasPermissionResponse.statusCode}`,
//           );
//         }
//       } catch (error) {
//         console.log(
//           'Permission check endpoint may not be implemented:',
//           error.message,
//         );
//       }
//     });
//   });
// });
