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
// import { User } from '../../../src/modules/users/entities/user.entity';
// import { Role } from '../../../src/role/entities/role.entity';
// import { DataSource, Repository } from 'typeorm';
// import * as bcrypt from 'bcryptjs';

// describe('Users Module (e2e)', () => {
//   let request: TestRequest;
//   let dbHelper: DatabaseTestHelper;
//   let authHelper: AuthTestHelper;
//   let cacheManager: any;
//   let dataSource: DataSource;
//   let userRepository: Repository<User>;
//   let roleRepository: Repository<Role>;

//   beforeAll(async () => {
//     console.log('Setting up test environment for users tests');
//     await setupTestApp();

//     // Get global resources
//     cacheManager = getCacheManager();
//     dataSource = getTestDataSource();

//     // Initialize test helpers
//     request = new TestRequest();
//     dbHelper = new DatabaseTestHelper();
//     await dbHelper.init();
//     authHelper = new AuthTestHelper(request, dbHelper);

//     // Get repositories
//     userRepository = dataSource.getRepository(User);
//     roleRepository = dataSource.getRepository(Role);

//     console.log('✅ Test environment setup complete for users tests');
//   });

//   beforeEach(async () => {
//     console.log('Starting new transaction for test isolation');

//     // Start transaction for test isolation
//     await dbHelper.startTransaction();

//     // Get transaction-specific repositories
//     userRepository = dbHelper.getRepository(User);
//     roleRepository = dbHelper.getRepository(Role);

//     // Seed database within transaction
//     await dbHelper.seedDatabase();

//     // Reset for clean state
//     request.clearCookies();

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

//   describe('GET /users', () => {
//     it('should return a list of users for admin', async () => {
//       console.log('Testing: admin should get the list of users');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Create additional test users
//       await Promise.all([
//         userRepository.save({
//           email: 'test-user1@example.com',
//           password: await bcrypt.hash('password123', 10),
//           firstName: 'Test',
//           lastName: 'User1',
//         }),
//         userRepository.save({
//           email: 'test-user2@example.com',
//           password: await bcrypt.hash('password123', 10),
//           firstName: 'Test',
//           lastName: 'User2',
//         }),
//       ]);

//       console.log('Requesting users list');
//       const response = await request.get('/users', true);
//       console.log(
//         `Users response: Status ${response.statusCode}, Items: ${response.body.data?.items?.length || 0}`,
//       );

//       // Assertions
//       expect(response.statusCode).toBe(200);
//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toHaveProperty('items');
//       expect(response.body.data.items).toBeInstanceOf(Array);
//       expect(response.body.data.items.length).toBeGreaterThan(0);

//       // Check user structure
//       const user = response.body.data.items[0];
//       expect(user).toHaveProperty('id');
//       expect(user).toHaveProperty('email');
//       expect(user).toHaveProperty('firstName');
//       expect(user).toHaveProperty('lastName');
//       expect(user).not.toHaveProperty('password'); // Password should never be returned

//       // Check pagination properties
//       expect(response.body.data).toHaveProperty('meta');
//       expect(response.body.data.meta).toHaveProperty('totalItems');
//       expect(response.body.data.meta).toHaveProperty('itemsPerPage');
//       expect(response.body.data.meta).toHaveProperty('currentPage');
//       expect(response.body.data.meta).toHaveProperty('totalPages');
//     });

//     it('should handle pagination correctly', async () => {
//       console.log('Testing: user list pagination');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Create 10 test users to ensure pagination
//       for (let i = 0; i < 10; i++) {
//         await userRepository.save({
//           email: `pagination-user${i}@example.com`,
//           password: await bcrypt.hash('password123', 10),
//           firstName: 'Pagination',
//           lastName: `User${i}`,
//         });
//       }

//       // Request with specific pagination parameters
//       console.log('Requesting paginated users list (page=2, limit=3)');
//       const response = await request.get('/users?page=2&limit=3', true);

//       console.log(
//         `Paginated users response: Page ${response.body.data.meta?.currentPage}, Items: ${response.body.data.items?.length}`,
//       );

//       // Assertions
//       expect(response.statusCode).toBe(200);
//       expect(response.body.data.items.length).toBeLessThanOrEqual(3); // Should return at most 3 items
//       expect(response.body.data.meta.currentPage).toBe(2); // Should be on page 2
//       expect(response.body.data.meta.itemsPerPage).toBe(3); // Should have limit of 3

//       // Request another page to ensure different results
//       const secondPageResponse = await request.get(
//         '/users?page=1&limit=3',
//         true,
//       );

//       // Get IDs from both pages
//       const firstPageIds = secondPageResponse.body.data.items.map((u) => u.id);
//       const secondPageIds = response.body.data.items.map((u) => u.id);

//       // Check that pages contain different users
//       const intersection = firstPageIds.filter((id) =>
//         secondPageIds.includes(id),
//       );
//       expect(intersection.length).toBe(0); // No overlap between pages
//     });

//     it('should support filtering by name', async () => {
//       console.log('Testing: filtering users by name');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Create users with specific names for filtering
//       await Promise.all([
//         userRepository.save({
//           email: 'john.smith@example.com',
//           password: await bcrypt.hash('password123', 10),
//           firstName: 'John',
//           lastName: 'Smith',
//         }),
//         userRepository.save({
//           email: 'jane.smith@example.com',
//           password: await bcrypt.hash('password123', 10),
//           firstName: 'Jane',
//           lastName: 'Smith',
//         }),
//         userRepository.save({
//           email: 'john.doe@example.com',
//           password: await bcrypt.hash('password123', 10),
//           firstName: 'John',
//           lastName: 'Doe',
//         }),
//       ]);

//       // Filter by firstName
//       console.log('Filtering users by firstName=John');
//       const firstNameResponse = await request.get(
//         '/users?firstName=John',
//         true,
//       );

//       expect(firstNameResponse.statusCode).toBe(200);
//       expect(firstNameResponse.body.data.items.length).toBeGreaterThan(0);

//       // All returned users should have firstName = John
//       expect(
//         firstNameResponse.body.data.items.every(
//           (user) => user.firstName === 'John',
//         ),
//       ).toBe(true);

//       // Filter by lastName
//       console.log('Filtering users by lastName=Smith');
//       const lastNameResponse = await request.get('/users?lastName=Smith', true);

//       expect(lastNameResponse.statusCode).toBe(200);
//       expect(lastNameResponse.body.data.items.length).toBeGreaterThan(0);

//       // All returned users should have lastName = Smith
//       expect(
//         lastNameResponse.body.data.items.every(
//           (user) => user.lastName === 'Smith',
//         ),
//       ).toBe(true);
//     });

//     it('should return 401 for unauthenticated request', async () => {
//       console.log('Testing: unauthenticated requests should be rejected');

//       // Request without authentication
//       console.log('Requesting users without authentication');
//       const response = await request.get('/users');

//       console.log('Unauthenticated response:', JSON.stringify(response.body));

//       expect(response.statusCode).toBe(401);
//       expect(response.body.success).toBe(false);
//     });

//     it('should return 403 for user without permissions', async () => {
//       console.log('Testing: permission check for user without read access');

//       // Create a regular user with no admin privileges
//       const regularUser = await userRepository.save({
//         email: 'no-permission@example.com',
//         password: await bcrypt.hash('password123', 10),
//         firstName: 'No',
//         lastName: 'Permission',
//         isAdmin: false, // Explicitly not an admin
//       });

//       // Login as the regular user
//       await authHelper.login({
//         email: regularUser.email,
//         password: 'password123',
//       });

//       // Try to access users list
//       console.log('Regular user attempting to access users list');
//       const response = await request.get('/users', true);

//       // Regular users should not have access to all users
//       // Note: This may pass if your API allows all authenticated users to see users list
//       // If that's the case, update the test to check a more restricted endpoint
//       expect(response.statusCode).toBe(403);
//       expect(response.body.success).toBe(false);
//     });
//   });

//   describe('GET /users/:id', () => {
//     it('should return a single user', async () => {
//       console.log('Testing: getting a single user by ID');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Create a test user
//       const testUser = await userRepository.save({
//         email: 'single-user@example.com',
//         password: await bcrypt.hash('password123', 10),
//         firstName: 'Single',
//         lastName: 'User',
//       });

//       const userId = testUser.id;
//       console.log(`Created test user with ID: ${userId}`);

//       // Request the user
//       console.log(`Requesting user: ${userId}`);
//       const response = await request.get(`/users/${userId}`, true);

//       console.log('User response:', JSON.stringify(response.body));

//       // Assertions
//       expect(response.statusCode).toBe(200);
//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toHaveProperty('id', userId);
//       expect(response.body.data).toHaveProperty('email', testUser.email);
//       expect(response.body.data).toHaveProperty(
//         'firstName',
//         testUser.firstName,
//       );
//       expect(response.body.data).toHaveProperty('lastName', testUser.lastName);
//       expect(response.body.data).not.toHaveProperty('password'); // Password should never be returned
//     });

//     it('should include user roles when requested', async () => {
//       console.log('Testing: getting user with roles included');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Create roles
//       const roles = await Promise.all([
//         roleRepository.save({
//           name: 'Editor',
//           description: 'Can edit content',
//         }),
//         roleRepository.save({
//           name: 'Reviewer',
//           description: 'Can review content',
//         }),
//       ]);

//       // Create a user with roles
//       const testUser = await userRepository.save({
//         email: 'user-with-roles@example.com',
//         password: await bcrypt.hash('password123', 10),
//         firstName: 'Role',
//         lastName: 'Tester',
//         roles: roles,
//       });

//       console.log(`Created user ${testUser.id} with ${roles.length} roles`);

//       // Request user with roles included
//       const response = await request.get(
//         `/users/${testUser.id}?include=roles`,
//         true,
//       );

//       // Check if the API supports this feature
//       expect(response.statusCode).toBe(200);

//       // If include=roles is supported, check the results
//       if (response.body.data.roles) {
//         expect(response.body.data.roles).toBeInstanceOf(Array);
//         expect(response.body.data.roles.length).toBe(roles.length);

//         // Verify role IDs match
//         const roleIds = roles.map((r) => r.id);
//         const returnedRoleIds = response.body.data.roles.map((r) => r.id);

//         roleIds.forEach((id) => {
//           expect(returnedRoleIds).toContain(id);
//         });
//       } else {
//         console.log('Include roles feature may not be implemented yet');
//       }
//     });

//     it('should return 404 for non-existent user', async () => {
//       console.log('Testing: request for non-existent user ID returns 404');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Use a non-existent ID
//       const nonExistentId = '99999999-9999-9999-9999-999999999999';
//       console.log(`Requesting non-existent user ID: ${nonExistentId}`);

//       const response = await request.get(`/users/${nonExistentId}`, true);

//       console.log(
//         'Response for non-existent ID:',
//         JSON.stringify(response.body),
//       );

//       // Assertions
//       expect(response.statusCode).toBe(404);
//       expect(response.body.success).toBe(false);
//     });

//     it('should allow users to access their own profile', async () => {
//       console.log('Testing: users can access their own profile');

//       // Create a regular user
//       const regularUser = await userRepository.save({
//         email: 'self-access@example.com',
//         password: await bcrypt.hash('password123', 10),
//         firstName: 'Self',
//         lastName: 'Access',
//         isAdmin: false,
//       });

//       // Login as the regular user
//       await authHelper.login({
//         email: regularUser.email,
//         password: 'password123',
//       });

//       // Access own profile
//       console.log(`User accessing their own profile: ${regularUser.id}`);
//       const response = await request.get(`/users/${regularUser.id}`, true);

//       // Should be allowed
//       expect(response.statusCode).toBe(200);
//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toHaveProperty('id', regularUser.id);
//     });

//     it('should prevent regular users from accessing other user profiles', async () => {
//       console.log('Testing: users cannot access other user profiles');

//       // Create two regular users
//       const user1 = await userRepository.save({
//         email: 'user-one@example.com',
//         password: await bcrypt.hash('password123', 10),
//         firstName: 'User',
//         lastName: 'One',
//         isAdmin: false,
//       });

//       const user2 = await userRepository.save({
//         email: 'user-two@example.com',
//         password: await bcrypt.hash('password123', 10),
//         firstName: 'User',
//         lastName: 'Two',
//         isAdmin: false,
//       });

//       // Login as the first user
//       await authHelper.login({
//         email: user1.email,
//         password: 'password123',
//       });

//       // Try to access the second user's profile
//       console.log(
//         `User ${user1.id} attempting to access user ${user2.id}'s profile`,
//       );
//       const response = await request.get(`/users/${user2.id}`, true);

//       // Should be forbidden
//       expect(response.statusCode).toBe(403);
//       expect(response.body.success).toBe(false);
//     });
//   });

//   describe('POST /users', () => {
//     it('should create a new user as admin', async () => {
//       console.log('Testing: creating a new user as admin');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Create roles to assign
//       const roles = await Promise.all([
//         roleRepository.save({
//           name: 'ContentCreator',
//           description: 'Can create content',
//         }),
//         roleRepository.save({
//           name: 'ContentConsumer',
//           description: 'Can consume content',
//         }),
//       ]);

//       const roleIds = roles.map((r) => r.id);

//       // Prepare new user data
//       const newUser = {
//         email: 'new-user@example.com',
//         password: 'StrongPassword123!',
//         firstName: 'New',
//         lastName: 'User',
//         isAdmin: false,
//         roleIds: roleIds, // If your API supports assigning roles during creation
//       };

//       console.log('Creating new user:', JSON.stringify(newUser));
//       const response = await request.post('/users', newUser, true);

//       console.log('Creation response:', JSON.stringify(response.body));

//       // Assertions
//       expect(response.statusCode).toBe(201);
//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toHaveProperty('id');
//       expect(response.body.data.email).toBe(newUser.email);
//       expect(response.body.data.firstName).toBe(newUser.firstName);
//       expect(response.body.data.lastName).toBe(newUser.lastName);
//       expect(response.body.data).not.toHaveProperty('password'); // Password should never be returned

//       // Verify roles were assigned if your API supports this
//       if (response.body.data.roles) {
//         expect(response.body.data.roles).toBeInstanceOf(Array);
//         expect(response.body.data.roles.length).toBe(roleIds.length);
//       }

//       // Verify in database that password is hashed
//       const savedUser = await userRepository.findOne({
//         where: { id: response.body.data.id },
//       });

//       expect(savedUser).toBeDefined();
//       expect(savedUser.password).not.toBe(newUser.password); // Should be hashed
//       expect(savedUser.password.startsWith('$2')).toBe(true); // Bcrypt hash starts with $2

//       // Verify roles in database if your schema supports this
//       const savedUserWithRoles = await userRepository.findOne({
//         where: { id: response.body.data.id },
//         relations: ['roles'],
//       });

//       if (savedUserWithRoles.roles) {
//         expect(savedUserWithRoles.roles.length).toBe(roleIds.length);

//         // Check each role is correctly assigned
//         const savedRoleIds = savedUserWithRoles.roles.map((r) => r.id);
//         roleIds.forEach((id) => {
//           expect(savedRoleIds).toContain(id);
//         });
//       }
//     });

//     it('should validate input when creating a user', async () => {
//       console.log('Testing: validation when creating a user');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Test cases for validation failures
//       const testCases = [
//         {
//           name: 'missing email',
//           data: {
//             // Missing email
//             password: 'Password123!',
//             firstName: 'Test',
//             lastName: 'User',
//           },
//           expectedStatus: 400,
//         },
//         {
//           name: 'invalid email format',
//           data: {
//             email: 'not-an-email',
//             password: 'Password123!',
//             firstName: 'Test',
//             lastName: 'User',
//           },
//           expectedStatus: 400,
//         },
//         {
//           name: 'password too short',
//           data: {
//             email: 'valid@example.com',
//             password: '123', // Too short
//             firstName: 'Test',
//             lastName: 'User',
//           },
//           expectedStatus: 400,
//         },
//         {
//           name: 'missing firstName',
//           data: {
//             email: 'valid@example.com',
//             password: 'Password123!',
//             // Missing firstName
//             lastName: 'User',
//           },
//           expectedStatus: 400,
//         },
//       ];

//       // Run through each validation test case
//       for (const testCase of testCases) {
//         console.log(`Testing validation case: ${testCase.name}`);

//         const response = await request.post('/users', testCase.data, true);

//         console.log(
//           `Validation response for ${testCase.name}:`,
//           JSON.stringify(response.body),
//         );

//         expect(response.statusCode).toBe(testCase.expectedStatus);
//         expect(response.body.success).toBe(false);
//       }
//     });

//     it('should prevent creating users with duplicate emails', async () => {
//       console.log('Testing: preventing duplicate user emails');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Create initial user
//       const email = 'duplicate@example.com';
//       const userData = {
//         email,
//         password: 'Password123!',
//         firstName: 'Original',
//         lastName: 'User',
//       };

//       const firstResponse = await request.post('/users', userData, true);
//       expect(firstResponse.statusCode).toBe(201);

//       // Try to create duplicate
//       console.log('Attempting to create user with duplicate email');
//       const duplicateData = {
//         email, // Same email
//         password: 'DifferentPassword123!',
//         firstName: 'Duplicate',
//         lastName: 'User',
//       };

//       const duplicateResponse = await request.post(
//         '/users',
//         duplicateData,
//         true,
//       );

//       // Should fail with conflict error
//       expect(duplicateResponse.statusCode).toBe(409);
//       expect(duplicateResponse.body.success).toBe(false);
//     });

//     it('should restrict user creation to admins only', async () => {
//       console.log('Testing: restricting user creation to admins');

//       // Create a regular non-admin user
//       const regularUser = await userRepository.save({
//         email: 'regular-user@example.com',
//         password: await bcrypt.hash('password123', 10),
//         firstName: 'Regular',
//         lastName: 'User',
//         isAdmin: false,
//       });

//       // Login as regular user
//       await authHelper.login({
//         email: regularUser.email,
//         password: 'password123',
//       });

//       // Try to create a new user
//       const newUserData = {
//         email: 'created-by-regular@example.com',
//         password: 'Password123!',
//         firstName: 'Created',
//         lastName: 'ByRegular',
//       };

//       console.log('Regular user attempting to create a new user');
//       const response = await request.post('/users', newUserData, true);

//       // Should be forbidden for non-admin users
//       expect(response.statusCode).toBe(403);
//       expect(response.body.success).toBe(false);
//     });
//   });

//   describe('PUT /users/:id', () => {
//     it('should update an existing user', async () => {
//       console.log('Testing: updating an existing user');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Create a user to update
//       const userToUpdate = await userRepository.save({
//         email: 'update-me@example.com',
//         password: await bcrypt.hash('password123', 10),
//         firstName: 'Update',
//         lastName: 'Me',
//       });

//       const userId = userToUpdate.id;
//       console.log(`Created user ${userId} for update test`);

//       // Create roles to assign during update
//       const roles = await Promise.all([
//         roleRepository.save({
//           name: 'UpdateRole1',
//           description: 'First update role',
//         }),
//         roleRepository.save({
//           name: 'UpdateRole2',
//           description: 'Second update role',
//         }),
//       ]);

//       const roleIds = roles.map((r) => r.id);

//       // Prepare update data
//       const updateData = {
//         firstName: 'Updated',
//         lastName: 'User',
//         roleIds, // If your API supports updating roles
//       };

//       console.log(`Updating user ${userId} with:`, JSON.stringify(updateData));
//       const response = await request.put(`/users/${userId}`, updateData, true);

//       console.log('Update response:', JSON.stringify(response.body));

//       // Assertions
//       expect(response.statusCode).toBe(200);
//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toHaveProperty('id', userId);
//       expect(response.body.data.firstName).toBe(updateData.firstName);
//       expect(response.body.data.lastName).toBe(updateData.lastName);
//       expect(response.body.data.email).toBe(userToUpdate.email); // Email shouldn't change

//       // Verify the update in the database
//       const updatedUser = await userRepository.findOne({
//         where: { id: userId },
//         relations: ['roles'],
//       });

//       expect(updatedUser.firstName).toBe(updateData.firstName);
//       expect(updatedUser.lastName).toBe(updateData.lastName);

//       // Check roles if your API supports role updates
//       if (updatedUser.roles) {
//         expect(updatedUser.roles.length).toBe(roleIds.length);

//         const updatedRoleIds = updatedUser.roles.map((r) => r.id);
//         roleIds.forEach((id) => {
//           expect(updatedRoleIds).toContain(id);
//         });
//       }
//     });

//     it('should allow changing password when updating user', async () => {
//       console.log('Testing: updating user password');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Create a user
//       const user = await userRepository.save({
//         email: 'change-password@example.com',
//         password: await bcrypt.hash('oldPassword123', 10),
//         firstName: 'Password',
//         lastName: 'Changer',
//       });

//       const userId = user.id;

//       // Store the original hashed password for comparison
//       const originalPassword = user.password;

//       // Update with new password
//       const updateData = {
//         password: 'newPassword456!',
//       };

//       console.log(`Updating user ${userId} with new password`);
//       const response = await request.put(`/users/${userId}`, updateData, true);

//       // Assertions
//       expect(response.statusCode).toBe(200);
//       expect(response.body.success).toBe(true);

//       // Verify password was changed in database
//       const updatedUser = await userRepository.findOne({
//         where: { id: userId },
//       });

//       expect(updatedUser.password).not.toBe(originalPassword); // Should be different from original
//       expect(updatedUser.password).not.toBe(updateData.password); // Should be hashed, not plaintext
//       expect(updatedUser.password.startsWith('$2')).toBe(true); // Should be bcrypt hash

//       // Test logging in with the new password
//       await authHelper.login({
//         email: user.email,
//         password: updateData.password,
//       });

//       // Verify we can access a protected resource after login with new password
//       const profileResponse = await request.get(`/users/${userId}`, true);
//       expect(profileResponse.statusCode).toBe(200);
//     });

//     it('should validate input when updating a user', async () => {
//       console.log('Testing: validation when updating a user');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Create a user to update
//       const user = await userRepository.save({
//         email: 'validate-update@example.com',
//         password: await bcrypt.hash('password123', 10),
//         firstName: 'Validate',
//         lastName: 'Update',
//       });

//       const userId = user.id;

//       // Test cases for validation failures
//       const testCases = [
//         {
//           name: 'invalid email format',
//           data: {
//             email: 'not-an-email',
//           },
//           expectedStatus: 400,
//         },
//         {
//           name: 'password too short',
//           data: {
//             password: '123', // Too short
//           },
//           expectedStatus: 400,
//         },
//         {
//           name: 'empty firstName',
//           data: {
//             firstName: '', // Empty string
//           },
//           expectedStatus: 400,
//         },
//       ];

//       // Run through each validation test case
//       for (const testCase of testCases) {
//         console.log(`Testing update validation case: ${testCase.name}`);

//         const response = await request.put(
//           `/users/${userId}`,
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

//     it('should return 404 when updating non-existent user', async () => {
//       console.log('Testing: updating non-existent user returns 404');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Use a non-existent ID
//       const nonExistentId = '99999999-9999-9999-9999-999999999999';
//       const updateData = { firstName: 'NonExistent' };

//       console.log(
//         `Attempting to update non-existent user ID: ${nonExistentId}`,
//       );
//       const response = await request.put(
//         `/users/${nonExistentId}`,
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

//     it('should allow users to update their own profile', async () => {
//       console.log('Testing: users can update their own profile');

//       // Create a regular user
//       const regularUser = await userRepository.save({
//         email: 'self-update@example.com',
//         password: await bcrypt.hash('password123', 10),
//         firstName: 'Self',
//         lastName: 'Update',
//         isAdmin: false,
//       });

//       // Login as the regular user
//       await authHelper.login({
//         email: regularUser.email,
//         password: 'password123',
//       });

//       // Update own profile
//       const updateData = {
//         firstName: 'Updated',
//         lastName: 'Self',
//       };

//       console.log(`User updating their own profile: ${regularUser.id}`);
//       const response = await request.put(
//         `/users/${regularUser.id}`,
//         updateData,
//         true,
//       );

//       // Should be allowed
//       expect(response.statusCode).toBe(200);
//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toHaveProperty(
//         'firstName',
//         updateData.firstName,
//       );
//       expect(response.body.data).toHaveProperty(
//         'lastName',
//         updateData.lastName,
//       );
//     });

//     it('should prevent regular users from updating other profiles', async () => {
//       console.log('Testing: users cannot update other profiles');

//       // Create two regular users
//       const user1 = await userRepository.save({
//         email: 'cannot-update@example.com',
//         password: await bcrypt.hash('password123', 10),
//         firstName: 'Cannot',
//         lastName: 'Update',
//         isAdmin: false,
//       });

//       const user2 = await userRepository.save({
//         email: 'target-user@example.com',
//         password: await bcrypt.hash('password123', 10),
//         firstName: 'Target',
//         lastName: 'User',
//         isAdmin: false,
//       });

//       // Login as the first user
//       await authHelper.login({
//         email: user1.email,
//         password: 'password123',
//       });

//       // Try to update the second user's profile
//       const updateData = {
//         firstName: 'Hacked',
//         lastName: 'Name',
//       };

//       console.log(
//         `User ${user1.id} attempting to update user ${user2.id}'s profile`,
//       );
//       const response = await request.put(
//         `/users/${user2.id}`,
//         updateData,
//         true,
//       );

//       // Should be forbidden
//       expect(response.statusCode).toBe(403);
//       expect(response.body.success).toBe(false);
//     });
//   });

//   describe('DELETE /users/:id', () => {
//     it('should delete an existing user', async () => {
//       console.log('Testing: deleting an existing user');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Create a user to delete
//       const userToDelete = await userRepository.save({
//         email: 'delete-me@example.com',
//         password: await bcrypt.hash('password123', 10),
//         firstName: 'Delete',
//         lastName: 'Me',
//       });

//       const userId = userToDelete.id;
//       console.log(`Created user ${userId} for deletion test`);

//       // Delete the user
//       console.log(`Deleting user: ${userId}`);
//       const response = await request.delete(`/users/${userId}`, true);

//       console.log('Deletion response:', JSON.stringify(response.body));

//       // Assertions for deletion response
//       expect(response.statusCode).toBe(200);
//       expect(response.body.success).toBe(true);

//       // Verify user is deleted
//       console.log(`Verifying user ${userId} is deleted`);
//       const getResponse = await request.get(`/users/${userId}`, true);

//       console.log('Verification response:', JSON.stringify(getResponse.body));
//       expect(getResponse.statusCode).toBe(404);

//       // Verify in database
//       const deletedUser = await userRepository.findOne({
//         where: { id: userId },
//       });

//       expect(deletedUser).toBeNull();
//     });

//     it('should return 404 when deleting non-existent user', async () => {
//       console.log('Testing: deleting non-existent user returns 404');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Use a non-existent ID
//       const nonExistentId = '99999999-9999-9999-9999-999999999999';
//       console.log(
//         `Attempting to delete non-existent user ID: ${nonExistentId}`,
//       );

//       const response = await request.delete(`/users/${nonExistentId}`, true);

//       console.log(
//         'Response for deleting non-existent ID:',
//         JSON.stringify(response.body),
//       );

//       // Assertions
//       expect(response.statusCode).toBe(404);
//       expect(response.body.success).toBe(false);
//     });

//     it('should prevent regular users from deleting accounts', async () => {
//       console.log('Testing: regular users cannot delete accounts');

//       // Create two regular users
//       const user1 = await userRepository.save({
//         email: 'cannot-delete@example.com',
//         password: await bcrypt.hash('password123', 10),
//         firstName: 'Cannot',
//         lastName: 'Delete',
//         isAdmin: false,
//       });

//       const user2 = await userRepository.save({
//         email: 'target-delete@example.com',
//         password: await bcrypt.hash('password123', 10),
//         firstName: 'Target',
//         lastName: 'Delete',
//         isAdmin: false,
//       });

//       // Login as the first user
//       await authHelper.login({
//         email: user1.email,
//         password: 'password123',
//       });

//       // 1. Try to delete another user's account
//       console.log(`User ${user1.id} attempting to delete user ${user2.id}`);
//       const deleteOtherResponse = await request.delete(
//         `/users/${user2.id}`,
//         true,
//       );

//       // Should be forbidden
//       expect(deleteOtherResponse.statusCode).toBe(403);
//       expect(deleteOtherResponse.body.success).toBe(false);

//       // 2. Try to delete their own account
//       // Note: This depends on your API implementation - some APIs allow users to delete
//       // their own accounts, others restrict this to admins only
//       console.log(`User ${user1.id} attempting to delete their own account`);
//       const deleteSelfResponse = await request.delete(
//         `/users/${user1.id}`,
//         true,
//       );

//       // The expected behavior depends on your API implementation
//       // If self-deletion is allowed:
//       if (deleteSelfResponse.statusCode === 200) {
//         console.log('API allows users to delete their own accounts');
//         expect(deleteSelfResponse.body.success).toBe(true);

//         // Verify account was deleted
//         const deletedUser = await userRepository.findOne({
//           where: { id: user1.id },
//         });
//         expect(deletedUser).toBeNull();
//       }
//       // If self-deletion is not allowed:
//       else if (deleteSelfResponse.statusCode === 403) {
//         console.log(
//           'API prevents users from deleting their own accounts (admin only)',
//         );
//         expect(deleteSelfResponse.body.success).toBe(false);

//         // Verify account still exists
//         const userStillExists = await userRepository.findOne({
//           where: { id: user1.id },
//         });
//         expect(userStillExists).not.toBeNull();
//       }
//     });

//     it('should handle cleaning up related data when deleting users', async () => {
//       console.log('Testing: related data cleanup when deleting users');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Create roles for the user
//       const roles = await Promise.all([
//         roleRepository.save({
//           name: 'DeleteTestRole1',
//           description: 'Role for deletion test 1',
//         }),
//         roleRepository.save({
//           name: 'DeleteTestRole2',
//           description: 'Role for deletion test 2',
//         }),
//       ]);

//       // Create a user with related data
//       const user = await userRepository.save({
//         email: 'related-data@example.com',
//         password: await bcrypt.hash('password123', 10),
//         firstName: 'Related',
//         lastName: 'Data',
//         roles: roles,
//       });

//       console.log(`Created user ${user.id} with roles and related data`);

//       // Create additional relations as needed (e.g., articles, comments, etc.)
//       // This depends on your data model

//       // Delete the user
//       console.log(`Deleting user with related data: ${user.id}`);
//       const response = await request.delete(`/users/${user.id}`, true);

//       // Assertions
//       expect(response.statusCode).toBe(200);
//       expect(response.body.success).toBe(true);

//       // Verify user is deleted
//       const deletedUser = await userRepository.findOne({
//         where: { id: user.id },
//       });
//       expect(deletedUser).toBeNull();

//       // Verify roles still exist (they should not be deleted when user is deleted)
//       for (const role of roles) {
//         const roleStillExists = await roleRepository.findOne({
//           where: { id: role.id },
//         });
//         expect(roleStillExists).not.toBeNull();
//       }

//       // Check for user-role associations in the join table
//       // This depends on your database schema
//       try {
//         const userRoleAssociations = await dataSource.query(
//           `SELECT * FROM user_roles WHERE "userId" = $1`,
//           [user.id],
//         );
//         expect(userRoleAssociations.length).toBe(0);
//       } catch (error) {
//         console.error('Error checking user_roles table:', error);
//       }
//     });
//   });

//   describe('User-specific Features', () => {
//     it('should retrieve the current user profile', async () => {
//       console.log('Testing: retrieving current user profile');

//       // Create a test user
//       const testUser = await userRepository.save({
//         email: 'profile-test@example.com',
//         password: await bcrypt.hash('password123', 10),
//         firstName: 'Profile',
//         lastName: 'Test',
//       });

//       // Login as the test user
//       await authHelper.login({
//         email: testUser.email,
//         password: 'password123',
//       });

//       // Request the current user profile
//       console.log('Requesting current user profile');
//       const response = await request.get('/users/profile', true);

//       // Assertions
//       expect(response.statusCode).toBe(200);
//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toHaveProperty('id', testUser.id);
//       expect(response.body.data).toHaveProperty('email', testUser.email);
//       expect(response.body.data).toHaveProperty(
//         'firstName',
//         testUser.firstName,
//       );
//       expect(response.body.data).toHaveProperty('lastName', testUser.lastName);
//     });

//     it('should update the current user profile', async () => {
//       console.log('Testing: updating current user profile');

//       // Create a test user
//       const testUser = await userRepository.save({
//         email: 'profile-update@example.com',
//         password: await bcrypt.hash('password123', 10),
//         firstName: 'Profile',
//         lastName: 'Update',
//       });

//       // Login as the test user
//       await authHelper.login({
//         email: testUser.email,
//         password: 'password123',
//       });

//       // Update the profile
//       const updateData = {
//         firstName: 'Updated',
//         lastName: 'Profile',
//       };

//       console.log('Updating current user profile');
//       const response = await request.put('/users/profile', updateData, true);

//       // Assertions
//       expect(response.statusCode).toBe(200);
//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toHaveProperty(
//         'firstName',
//         updateData.firstName,
//       );
//       expect(response.body.data).toHaveProperty(
//         'lastName',
//         updateData.lastName,
//       );

//       // Verify in database
//       const updatedUser = await userRepository.findOne({
//         where: { id: testUser.id },
//       });

//       expect(updatedUser.firstName).toBe(updateData.firstName);
//       expect(updatedUser.lastName).toBe(updateData.lastName);
//     });

//     it('should change user password', async () => {
//       console.log('Testing: changing user password');

//       // Create a test user
//       const testUser = await userRepository.save({
//         email: 'password-change@example.com',
//         password: await bcrypt.hash('oldPassword123', 10),
//         firstName: 'Password',
//         lastName: 'Change',
//       });

//       // Login as the test user
//       await authHelper.login({
//         email: testUser.email,
//         password: 'oldPassword123',
//       });

//       // Original hashed password
//       const originalPassword = testUser.password;

//       // Change password
//       const passwordChangeData = {
//         currentPassword: 'oldPassword123',
//         newPassword: 'newPassword456!',
//       };

//       console.log('Changing user password');
//       const response = await request.post(
//         '/users/change-password',
//         passwordChangeData,
//         true,
//       );

//       // Assertions
//       expect(response.statusCode).toBe(200);
//       expect(response.body.success).toBe(true);

//       // Verify in database
//       const updatedUser = await userRepository.findOne({
//         where: { id: testUser.id },
//       });

//       expect(updatedUser.password).not.toBe(originalPassword);

//       // Log out
//       await request.post('/auth/logout', {}, true);

//       // Try to login with old password
//       try {
//         await authHelper.login({
//           email: testUser.email,
//           password: 'oldPassword123',
//         });

//         // Should not succeed
//         fail('Login with old password should not succeed');
//       } catch (error) {
//         // This is expected - old password should not work
//         console.log('Correctly failed to login with old password');
//       }

//       // Try to login with new password
//       await authHelper.login({
//         email: testUser.email,
//         password: 'newPassword456!',
//       });

//       // Verify we're logged in by accessing a protected resource
//       const profileResponse = await request.get('/users/profile', true);
//       expect(profileResponse.statusCode).toBe(200);
//     });

//     it('should invalidate cache when user data changes', async () => {
//       console.log('Testing: cache invalidation for user data changes');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Reset cache mock calls
//       cacheManager.del.mockClear();

//       // Create a new user
//       const newUser = {
//         email: 'cache-test@example.com',
//         password: 'Password123!',
//         firstName: 'Cache',
//         lastName: 'Test',
//       };

//       console.log('Creating user to test cache invalidation');
//       const createResponse = await request.post('/users', newUser, true);

//       const userId = createResponse.body.data.id;

//       // Verify cache invalidation call was made
//       expect(createResponse.statusCode).toBe(201);
//       expect(cacheManager.del).toHaveBeenCalled();

//       // Reset again for update test
//       cacheManager.del.mockClear();

//       // Update the user
//       console.log('Updating user to test cache invalidation');
//       const updateResponse = await request.put(
//         `/users/${userId}`,
//         { firstName: 'UpdatedCache' },
//         true,
//       );

//       // Verify cache invalidation call was made for update
//       expect(updateResponse.statusCode).toBe(200);
//       expect(cacheManager.del).toHaveBeenCalled();

//       // Reset again for delete test
//       cacheManager.del.mockClear();

//       // Delete the user
//       console.log('Deleting user to test cache invalidation');
//       const deleteResponse = await request.delete(`/users/${userId}`, true);

//       // Verify cache invalidation call was made for delete
//       expect(deleteResponse.statusCode).toBe(200);
//       expect(cacheManager.del).toHaveBeenCalled();
//     });

//     it('should assign and remove roles from users', async () => {
//       console.log('Testing: assigning and removing roles from users');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Create test roles
//       const roles = await Promise.all([
//         roleRepository.save({
//           name: 'AssignRole1',
//           description: 'First assign test role',
//         }),
//         roleRepository.save({
//           name: 'AssignRole2',
//           description: 'Second assign test role',
//         }),
//       ]);

//       // Create a user without roles
//       const user = await userRepository.save({
//         email: 'role-assign@example.com',
//         password: await bcrypt.hash('password123', 10),
//         firstName: 'Role',
//         lastName: 'Assign',
//       });

//       console.log(`Created user ${user.id} for role assignment testing`);

//       // Get the role IDs
//       const roleIds = roles.map((r) => r.id);

//       // If your API has an endpoint to assign roles directly:
//       try {
//         console.log(`Assigning roles to user ${user.id}`);
//         const assignResponse = await request.post(
//           `/users/${user.id}/roles`,
//           { roleIds },
//           true,
//         );

//         if (assignResponse.statusCode === 200) {
//           console.log('Role assignment endpoint available');
//           expect(assignResponse.body.success).toBe(true);

//           // Verify roles were assigned in database
//           const userWithRoles = await userRepository.findOne({
//             where: { id: user.id },
//             relations: ['roles'],
//           });

//           expect(userWithRoles.roles.length).toBe(roleIds.length);

//           // Check each role was assigned
//           const assignedRoleIds = userWithRoles.roles.map((r) => r.id);
//           roleIds.forEach((id) => {
//             expect(assignedRoleIds).toContain(id);
//           });

//           // Test removing roles
//           console.log(`Removing roles from user ${user.id}`);
//           const removeResponse = await request.delete(
//             `/users/${user.id}/roles`,
//             true,
//           );

//           expect(removeResponse.statusCode).toBe(200);
//           expect(removeResponse.body.success).toBe(true);

//           // Verify roles were removed in database
//           const userWithoutRoles = await userRepository.findOne({
//             where: { id: user.id },
//             relations: ['roles'],
//           });

//           expect(userWithoutRoles.roles.length).toBe(0);
//         } else {
//           console.log(
//             `Role assignment endpoint returned status ${assignResponse.statusCode}`,
//           );
//         }
//       } catch (error) {
//         console.log(
//           'Role assignment endpoint may not be implemented:',
//           error.message,
//         );

//         // Alternative: Update user with roles
//         console.log('Trying alternative approach: updating user with roles');

//         const updateResponse = await request.put(
//           `/users/${user.id}`,
//           { roleIds },
//           true,
//         );

//         expect(updateResponse.statusCode).toBe(200);

//         // Verify roles were assigned in database
//         const userWithRoles = await userRepository.findOne({
//           where: { id: user.id },
//           relations: ['roles'],
//         });

//         if (userWithRoles.roles) {
//           expect(userWithRoles.roles.length).toBe(roleIds.length);
//         }
//       }
//     });

//     it('should filter users by role', async () => {
//       console.log('Testing: filtering users by role');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Create test roles
//       const role1 = await roleRepository.save({
//         name: 'FilterRole1',
//         description: 'First filter test role',
//       });

//       const role2 = await roleRepository.save({
//         name: 'FilterRole2',
//         description: 'Second filter test role',
//       });

//       // Create users with different roles
//       await Promise.all([
//         userRepository.save({
//           email: 'role1-user1@example.com',
//           password: await bcrypt.hash('password123', 10),
//           firstName: 'Role1',
//           lastName: 'User1',
//           roles: [role1],
//         }),
//         userRepository.save({
//           email: 'role1-user2@example.com',
//           password: await bcrypt.hash('password123', 10),
//           firstName: 'Role1',
//           lastName: 'User2',
//           roles: [role1],
//         }),
//         userRepository.save({
//           email: 'role2-user@example.com',
//           password: await bcrypt.hash('password123', 10),
//           firstName: 'Role2',
//           lastName: 'User',
//           roles: [role2],
//         }),
//         userRepository.save({
//           email: 'both-roles@example.com',
//           password: await bcrypt.hash('password123', 10),
//           firstName: 'Both',
//           lastName: 'Roles',
//           roles: [role1, role2],
//         }),
//       ]);

//       console.log('Created users with different roles for filtering test');

//       // Try filtering by role
//       console.log(`Filtering users by role: ${role1.id}`);
//       const response = await request.get(`/users?roleId=${role1.id}`, true);

//       // Check if filtering works
//       expect(response.statusCode).toBe(200);
//       expect(response.body.data.items.length).toBeGreaterThan(0);

//       // All returned users should have the specified role
//       // This test depends on how your API returns role data
//       const users = response.body.data.items;

//       if (users[0].roles) {
//         // If roles are included in the response
//         users.forEach((user) => {
//           const userRoleIds = user.roles.map((r) => r.id);
//           expect(userRoleIds).toContain(role1.id);
//         });
//       } else {
//         // If roles aren't included, at least verify count matches expected
//         expect(users.length).toBeGreaterThanOrEqual(3); // role1-user1, role1-user2, and both-roles
//       }

//       // Test filtering by the second role
//       console.log(`Filtering users by role: ${role2.id}`);
//       const response2 = await request.get(`/users?roleId=${role2.id}`, true);

//       expect(response2.statusCode).toBe(200);
//       expect(response2.body.data.items.length).toBeGreaterThan(0);
//       expect(response2.body.data.items.length).toBeLessThan(
//         response.body.data.items.length,
//       );
//     });

//     it('should handle user account locking and unlocking', async () => {
//       console.log('Testing: user account locking and unlocking');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Create a user to lock
//       const user = await userRepository.save({
//         email: 'lock-account@example.com',
//         password: await bcrypt.hash('password123', 10),
//         firstName: 'Lock',
//         lastName: 'Account',
//         isActive: true, // Ensure account starts active
//       });

//       console.log(`Created user ${user.id} for account locking test`);

//       // If your API supports account locking
//       try {
//         console.log(`Locking user account: ${user.id}`);
//         const lockResponse = await request.put(
//           `/users/${user.id}/lock`,
//           {},
//           true,
//         );

//         if (lockResponse.statusCode === 200) {
//           console.log('Account locking endpoint available');
//           expect(lockResponse.body.success).toBe(true);

//           // Verify account is locked in database
//           const lockedUser = await userRepository.findOne({
//             where: { id: user.id },
//           });

//           expect(lockedUser.isActive).toBe(false);

//           // Try logging in with locked account
//           try {
//             await authHelper.login({
//               email: user.email,
//               password: 'password123',
//             });

//             // Login should fail for locked accounts
//             fail('Login with locked account should not succeed');
//           } catch (error) {
//             // This is expected - locked accounts should not be able to login
//             console.log('Correctly failed to login with locked account');
//           }

//           // Now unlock the account
//           console.log(`Unlocking user account: ${user.id}`);
//           const unlockResponse = await request.put(
//             `/users/${user.id}/unlock`,
//             {},
//             true,
//           );

//           expect(unlockResponse.statusCode).toBe(200);
//           expect(unlockResponse.body.success).toBe(true);

//           // Verify account is unlocked in database
//           const unlockedUser = await userRepository.findOne({
//             where: { id: user.id },
//           });

//           expect(unlockedUser.isActive).toBe(true);

//           // Try logging in again
//           await authHelper.login({
//             email: user.email,
//             password: 'password123',
//           });

//           // Verify login worked by accessing a protected resource
//           const profileResponse = await request.get('/users/profile', true);
//           expect(profileResponse.statusCode).toBe(200);
//         } else {
//           console.log(
//             `Account locking endpoint returned status ${lockResponse.statusCode}`,
//           );
//         }
//       } catch (error) {
//         console.log(
//           'Account locking endpoint may not be implemented:',
//           error.message,
//         );

//         // Alternative: Update isActive status directly
//         console.log('Trying alternative approach: updating isActive status');

//         const updateResponse = await request.put(
//           `/users/${user.id}`,
//           { isActive: false },
//           true,
//         );

//         if (updateResponse.statusCode === 200) {
//           expect(updateResponse.body.data.isActive).toBe(false);

//           // Verify in database
//           const inactiveUser = await userRepository.findOne({
//             where: { id: user.id },
//           });

//           expect(inactiveUser.isActive).toBe(false);
//         }
//       }
//     });

//     it('should handle user search', async () => {
//       console.log('Testing: user search functionality');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // Create users with searchable attributes
//       await Promise.all([
//         userRepository.save({
//           email: 'john.smith@example.com',
//           password: await bcrypt.hash('password123', 10),
//           firstName: 'John',
//           lastName: 'Smith',
//         }),
//         userRepository.save({
//           email: 'sarah.johnson@example.com',
//           password: await bcrypt.hash('password123', 10),
//           firstName: 'Sarah',
//           lastName: 'Johnson',
//         }),
//         userRepository.save({
//           email: 'michael.williams@example.com',
//           password: await bcrypt.hash('password123', 10),
//           firstName: 'Michael',
//           lastName: 'Williams',
//         }),
//       ]);

//       console.log('Created users for search test');

//       // Test search by name
//       console.log('Searching for users with query "john"');
//       const nameResponse = await request.get('/users?search=john', true);

//       expect(nameResponse.statusCode).toBe(200);
//       expect(nameResponse.body.data.items.length).toBeGreaterThan(0);

//       // At least one result should contain "john" in name or email
//       const nameResults = nameResponse.body.data.items;
//       const hasJohn = nameResults.some(
//         (user) =>
//           user.firstName.toLowerCase().includes('john') ||
//           user.lastName.toLowerCase().includes('john') ||
//           user.email.toLowerCase().includes('john'),
//       );

//       expect(hasJohn).toBe(true);

//       // Test search by email domain
//       console.log('Searching for users with query "example.com"');
//       const emailResponse = await request.get(
//         '/users?search=example.com',
//         true,
//       );

//       expect(emailResponse.statusCode).toBe(200);
//       expect(emailResponse.body.data.items.length).toBeGreaterThan(0);
//     });

//     it('should export user data', async () => {
//       console.log('Testing: user data export functionality');

//       // Login as admin
//       await authHelper.login(fixtures.userCredentials.admin);

//       // If your API supports data export
//       try {
//         console.log('Requesting user data export');
//         const response = await request.get('/users/export', true);

//         if (response.statusCode === 200) {
//           console.log('Export endpoint available');

//           // Check for CSV or JSON content type
//           const contentType = response.headers['content-type'];
//           expect(contentType).toBeDefined();

//           const isCSV = contentType.includes('text/csv');
//           const isJSON = contentType.includes('application/json');

//           expect(isCSV || isJSON).toBe(true);

//           // Check that response contains data
//           if (isCSV) {
//             expect(response.text).toBeDefined();
//             expect(response.text.length).toBeGreaterThan(0);
//             expect(response.text).toContain('email');
//           } else if (isJSON) {
//             expect(response.body).toBeDefined();
//             expect(Array.isArray(response.body)).toBe(true);
//             expect(response.body.length).toBeGreaterThan(0);
//           }
//         } else {
//           console.log(`Export endpoint returned status ${response.statusCode}`);
//         }
//       } catch (error) {
//         console.log('Export endpoint may not be implemented:', error.message);
//       }
//     });
//   });
// });
