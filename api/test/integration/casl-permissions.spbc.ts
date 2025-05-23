// import { TestRequest } from '../helpers/request.helper';
// import { DatabaseTestHelper } from '../helpers/database.helper';
// import { AuthTestHelper } from '../helpers/auth-test.helper';
// import {
//   setupTestApp,
//   teardownTestApp,
//   getTestingModule,
// } from '../setup-tests';
// import * as fixtures from '../fixtures';
// import { getConnection } from 'typeorm';
// import { Permission } from '../../src/permissions/entities/permission.entity';
// import { Role } from '../../src/role/entities/role.entity';
// import { User } from '../../src/modules/users/entities/user.entity';
// import { Article } from '../../src/modules/articles/entities/article.entity';

// describe('CASL Field-Level Permissions (integration)', () => {
//   let request: TestRequest;
//   let dbHelper: DatabaseTestHelper;
//   let authHelper: AuthTestHelper;
//   let adminUser: any;
//   let regularUser: any;
//   let limitedUser: any;
//   let articleId: string;

//   beforeAll(async () => {
//     console.log(
//       'Setting up test environment for CASL field-level permissions tests',
//     );
//     await setupTestApp();

//     request = new TestRequest();
//     // Removed request.init() as we're using supertest.agent directly

//     dbHelper = new DatabaseTestHelper();
//     await dbHelper.init();

//     authHelper = new AuthTestHelper(request);
//     console.log('Test environment setup complete');
//   });

//   beforeEach(async () => {
//     console.log('Starting new transaction for test');
//     await dbHelper.startTransaction();

//     // Create special test data for field-level permission testing
//     console.log('Setting up test data for field-level permissions');
//     const connection = getConnection();

//     // 1. Create permissions including field-level ones
//     console.log('Creating permission entities');
//     const permissions = await connection.getRepository(Permission).save([
//       {
//         action: 'create',
//         subject: 'Article',
//         inverted: false,
//         reason: 'Allow creating articles',
//       },
//       {
//         action: 'read',
//         subject: 'Article',
//         inverted: false,
//         reason: 'Allow reading all article fields',
//       },
//       {
//         action: 'read',
//         subject: 'Article',
//         fields: ['title', 'created_at'],
//         inverted: false,
//         reason: 'Allow reading only title and created_at of articles',
//       },
//       {
//         action: 'update',
//         subject: 'Article',
//         inverted: false,
//         reason: 'Allow updating articles',
//       },
//       {
//         action: 'delete',
//         subject: 'Article',
//         inverted: false,
//         reason: 'Allow deleting articles',
//       },
//     ]);
//     console.log(`Created ${permissions.length} permission entities`);

//     // 2. Create roles with different field-level permissions
//     console.log('Creating role entities with different permission sets');
//     const adminRole = await connection.getRepository(Role).save({
//       name: 'Admin',
//       permissions: permissions,
//     });

//     const regularRole = await connection.getRepository(Role).save({
//       name: 'Regular',
//       permissions: [permissions[0], permissions[1], permissions[3]], // create, read-all, update
//     });

//     const limitedRole = await connection.getRepository(Role).save({
//       name: 'Limited',
//       permissions: [permissions[2]], // read-limited
//     });
//     console.log('Created Admin, Regular and Limited roles');

//     // 3. Create users with different roles
//     console.log('Creating test users with different roles');
//     adminUser = await connection.getRepository(User).save({
//       email: 'admin@example.com',
//       password: '$2a$10$XqAYPPZQ8q.hg5UJASyUsOSDokBnUjNE4ZCrKa2YBvFAWOiyQRK6u', // admin123
//       firstName: 'Admin',
//       lastName: 'User',
//       isAdmin: true,
//       roles: [adminRole],
//     });

//     regularUser = await connection.getRepository(User).save({
//       email: 'regular@example.com',
//       password: '$2a$10$XqAYPPZQ8q.hg5UJASyUsOSDokBnUjNE4ZCrKa2YBvFAWOiyQRK6u', // admin123
//       firstName: 'Regular',
//       lastName: 'User',
//       isAdmin: false,
//       roles: [regularRole],
//     });

//     limitedUser = await connection.getRepository(User).save({
//       email: 'limited@example.com',
//       password: '$2a$10$XqAYPPZQ8q.hg5UJASyUsOSDokBnUjNE4ZCrKa2YBvFAWOiyQRK6u', // admin123
//       firstName: 'Limited',
//       lastName: 'User',
//       isAdmin: false,
//       roles: [limitedRole],
//     });
//     console.log('Created Admin, Regular, and Limited users');

//     // 4. Create an article for testing
//     console.log('Creating test article');
//     const article = await connection.getRepository(Article).save({
//       title: 'Test Article for Field-Level Permissions',
//       content:
//         'This content should only be visible to users with full read permissions.',
//       author: adminUser,
//     });

//     articleId = article.id.toString();
//     console.log(`Created article with ID: ${articleId}`);
//     console.log('Test data setup complete');
//   });

//   afterEach(async () => {
//     console.log('Rolling back transaction after test');
//     await dbHelper.rollbackTransaction();
//   });

//   afterAll(async () => {
//     console.log('Tearing down test environment');
//     await teardownTestApp();
//   });

//   describe('Field-level permissions on Articles', () => {
//     it('should return all fields for admin user', async () => {
//       console.log('Testing: admin user should see all article fields');

//       // Login as admin
//       console.log('Logging in as admin');
//       await authHelper.login({
//         email: adminUser.email,
//         password: 'admin123',
//       });

//       console.log(`Requesting article with ID: ${articleId}`);
//       const response = await request.get(`/articles/${articleId}`, {});
//       console.log('Admin article response:', JSON.stringify(response.body));

//       expect(response.status).toBe(200);
//       expect(response.body.success).toBe(true);

//       console.log('Verifying all fields are present for admin');
//       expect(response.body.data).toHaveProperty('id');
//       expect(response.body.data).toHaveProperty('title');
//       expect(response.body.data).toHaveProperty('content');
//       expect(response.body.data).toHaveProperty('created_at');
//       expect(response.body.data).toHaveProperty('updated_at');
//       expect(response.body.data).toHaveProperty('author');

//       console.log('All fields are present as expected for admin');
//     });

//     it('should return all fields for regular user with full read permission', async () => {
//       console.log('Testing: regular user should see all article fields');

//       // Login as regular user
//       console.log('Logging in as regular user');
//       await authHelper.login({
//         email: regularUser.email,
//         password: 'admin123',
//       });

//       console.log(`Requesting article with ID: ${articleId}`);
//       const response = await request.get(`/articles/${articleId}`, {});
//       console.log(
//         'Regular user article response:',
//         JSON.stringify(response.body),
//       );

//       expect(response.status).toBe(200);
//       expect(response.body.success).toBe(true);

//       console.log('Verifying all fields are present for regular user');
//       expect(response.body.data).toHaveProperty('id');
//       expect(response.body.data).toHaveProperty('title');
//       expect(response.body.data).toHaveProperty('content');
//       expect(response.body.data).toHaveProperty('created_at');
//       expect(response.body.data).toHaveProperty('updated_at');

//       console.log('All fields are present as expected for regular user');
//     });

//     it('should return only title and created_at for limited user', async () => {
//       console.log('Testing: limited user should see only specific fields');

//       // Login as limited user
//       console.log('Logging in as limited user');
//       await authHelper.login({
//         email: limitedUser.email,
//         password: 'admin123',
//       });

//       console.log(`Requesting article with ID: ${articleId}`);
//       const response = await request.get(`/articles/${articleId}`, {});
//       console.log(
//         'Limited user article response:',
//         JSON.stringify(response.body),
//       );

//       expect(response.status).toBe(200);
//       expect(response.body.success).toBe(true);

//       console.log('Verifying only allowed fields are present');
//       expect(response.body.data).toHaveProperty('id');
//       expect(response.body.data).toHaveProperty('title');
//       expect(response.body.data).toHaveProperty('created_at');

//       // These fields should be filtered out
//       console.log('Verifying restricted fields are not present');
//       expect(response.body.data).not.toHaveProperty('content');
//       expect(response.body.data).not.toHaveProperty('updated_at');
//       expect(response.body.data).not.toHaveProperty('author');

//       console.log('Field filtering working correctly for limited user');
//     });

//     it('should allow regular user to update article', async () => {
//       console.log('Testing: regular user should be able to update article');

//       // Login as regular user
//       console.log('Logging in as regular user');
//       await authHelper.login({
//         email: regularUser.email,
//         password: 'admin123',
//       });

//       const updateData = {
//         title: 'Updated Title',
//         content: 'Updated content for testing permissions',
//       };

//       console.log(
//         `Updating article ${articleId} with:`,
//         JSON.stringify(updateData),
//       );
//       const response = await request.put(
//         `/articles/${articleId}`,
//         updateData,
//         {},
//       );
//       console.log('Update response:', JSON.stringify(response.body));

//       expect(response.status).toBe(200);
//       expect(response.body.success).toBe(true);
//       expect(response.body.data.title).toBe(updateData.title);
//       expect(response.body.data.content).toBe(updateData.content);

//       console.log('Article successfully updated by regular user');
//     });

//     it('should not allow limited user to update article', async () => {
//       console.log('Testing: limited user should not be able to update article');

//       // Login as limited user
//       console.log('Logging in as limited user');
//       await authHelper.login({
//         email: limitedUser.email,
//         password: 'admin123',
//       });

//       const updateData = {
//         title: 'This should fail',
//         content: 'This update should not be allowed',
//       };

//       console.log(
//         `Attempting to update article ${articleId} with:`,
//         JSON.stringify(updateData),
//       );
//       const response = await request.put(
//         `/articles/${articleId}`,
//         updateData,
//         {},
//       );
//       console.log('Update attempt response:', JSON.stringify(response.body));

//       expect(response.status).toBe(403);
//       expect(response.body.success).toBe(false);

//       console.log('Update correctly rejected with 403 Forbidden');
//     });

//     it('should apply field-level permissions to collection endpoints', async () => {
//       console.log('Testing: field-level permissions on collection endpoints');

//       // Login as limited user
//       console.log('Logging in as limited user');
//       await authHelper.login({
//         email: limitedUser.email,
//         password: 'admin123',
//       });

//       console.log('Requesting articles collection');
//       const response = await request.get('/articles', {});
//       console.log(
//         'Articles collection response:',
//         JSON.stringify(response.body),
//       );

//       expect(response.status).toBe(200);
//       expect(response.body.success).toBe(true);
//       expect(response.body.data.items).toBeInstanceOf(Array);
//       expect(response.body.data.items.length).toBeGreaterThan(0);

//       // Check that the first article only has permitted fields
//       const article = response.body.data.items[0];
//       console.log(
//         'Examining fields on first article in collection:',
//         JSON.stringify(article),
//       );

//       console.log('Verifying only allowed fields are present');
//       expect(article).toHaveProperty('id');
//       expect(article).toHaveProperty('title');
//       expect(article).toHaveProperty('created_at');

//       // These fields should be filtered out
//       console.log('Verifying restricted fields are not present');
//       expect(article).not.toHaveProperty('content');
//       expect(article).not.toHaveProperty('updated_at');
//       expect(article).not.toHaveProperty('author');

//       console.log('Field filtering working correctly for collection endpoint');
//     });
//   });
// });
