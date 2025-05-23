// import { TestRequest } from '../../helpers/request.helper';
// import { DatabaseTestHelper } from '../../helpers/database.helper';
// import { AuthTestHelper } from '../../helpers/auth-test.helper';
// import {
//   setupTestApp,
//   teardownTestApp,
//   getTestDataSource,
// } from '../../setup-tests';
// import * as fixtures from '../../fixtures';
// import { Permission } from '../../../src/permissions/entities/permission.entity';
// import { Role } from '../../../src/role/entities/role.entity';
// import { User } from '../../../src/modules/users/entities/user.entity';
// import { Article } from '../../../src/modules/articles/entities/article.entity';
// import { DataSource, Repository } from 'typeorm';

// describe('Complex Permission Scenarios (e2e)', () => {
//   let request: TestRequest;
//   let dbHelper: DatabaseTestHelper;
//   let authHelper: AuthTestHelper;
//   let dataSource: DataSource;

//   // Repositories
//   let userRepository: Repository<User>;
//   let roleRepository: Repository<Role>;
//   let permissionRepository: Repository<Permission>;
//   let articleRepository: Repository<Article>;

//   beforeAll(async () => {
//     console.log('Setting up test environment for complex permissions tests');
//     await setupTestApp();

//     // Initialize test helpers
//     request = new TestRequest();
//     dbHelper = new DatabaseTestHelper();
//     await dbHelper.init();
//     authHelper = new AuthTestHelper(request, dbHelper);

//     // Get data source from the test environment
//     dataSource = getTestDataSource();

//     // Initialize repositories
//     userRepository = dataSource.getRepository(User);
//     roleRepository = dataSource.getRepository(Role);
//     permissionRepository = dataSource.getRepository(Permission);
//     articleRepository = dataSource.getRepository(Article);

//     console.log(
//       '✅ Test environment setup complete for complex permissions tests',
//     );
//   });

//   beforeEach(async () => {
//     console.log('Starting new transaction for test isolation');
//     await dbHelper.startTransaction();

//     // After starting transaction, we need to get transaction-specific repositories
//     userRepository = dbHelper.getRepository(User);
//     roleRepository = dbHelper.getRepository(Role);
//     permissionRepository = dbHelper.getRepository(Permission);
//     articleRepository = dbHelper.getRepository(Article);
//   });

//   afterEach(async () => {
//     console.log('Rolling back transaction');
//     await dbHelper.rollbackTransaction();
//     request.clearCookies();
//     request.clearHeaders();
//   });

//   afterAll(async () => {
//     console.log('Tearing down test environment');
//     await teardownTestApp();
//   });

//   describe('Role-based access with field permissions', () => {
//     let adminUser: User;
//     let managerUser: User;
//     let editorUser: User;
//     let viewerUser: User;
//     let articles: Article[];

//     beforeEach(async () => {
//       console.log('Setting up roles and permissions for test');

//       // Create a complete permission set with field-level specifications
//       const permissions = await permissionRepository.save([
//         // Admin permissions - full access to everything
//         {
//           action: fixtures.Action.MANAGE,
//           subject: fixtures.Subject.ALL,
//           inverted: false,
//           reason: 'Full admin access',
//         },

//         // Manager permissions - can create and manage users but not delete
//         {
//           action: fixtures.Action.CREATE,
//           subject: fixtures.Subject.USER,
//           inverted: false,
//           reason: 'Manager can create users',
//         },
//         {
//           action: fixtures.Action.READ,
//           subject: fixtures.Subject.USER,
//           inverted: false,
//           reason: 'Manager can read users',
//         },
//         {
//           action: fixtures.Action.UPDATE,
//           subject: fixtures.Subject.USER,
//           inverted: false,
//           reason: 'Manager can update users',
//         },

//         // Editor permissions - can create and edit content
//         {
//           action: fixtures.Action.CREATE,
//           subject: fixtures.Subject.ARTICLE,
//           inverted: false,
//           reason: 'Editor can create articles',
//         },
//         {
//           action: fixtures.Action.READ,
//           subject: fixtures.Subject.ARTICLE,
//           inverted: false,
//           reason: 'Editor can read articles',
//         },
//         {
//           action: fixtures.Action.UPDATE,
//           subject: fixtures.Subject.ARTICLE,
//           inverted: false,
//           reason: 'Editor can update articles',
//         },

//         // Viewer permissions - read-only with field restrictions
//         {
//           action: fixtures.Action.READ,
//           subject: fixtures.Subject.USER,
//           fields: ['id', 'firstName', 'lastName', 'email'],
//           inverted: false,
//           reason: 'Viewer can see basic user info',
//         },
//         {
//           action: fixtures.Action.READ,
//           subject: fixtures.Subject.ARTICLE,
//           fields: ['title', 'summary', 'createdAt'],
//           inverted: false,
//           reason: 'Viewer can see article metadata but not full content',
//         },
//       ]);

//       console.log(`Created ${permissions.length} permissions for testing`);

//       // Create roles with different permission sets
//       const adminRole = await roleRepository.save({
//         name: 'Admin',
//         permissions: [permissions[0]], // Full manage all permission
//       });

//       const managerRole = await roleRepository.save({
//         name: 'Manager',
//         permissions: [permissions[1], permissions[2], permissions[3]], // User management
//       });

//       const editorRole = await roleRepository.save({
//         name: 'Editor',
//         permissions: [permissions[4], permissions[5], permissions[6]], // Article management
//       });

//       const viewerRole = await roleRepository.save({
//         name: 'Viewer',
//         permissions: [permissions[7], permissions[8]], // Limited field access
//       });

//       console.log('Created roles: Admin, Manager, Editor, Viewer');

//       // Create users with different roles
//       adminUser = await userRepository.save({
//         email: 'complex-admin@example.com',
//         password:
//           '$2a$10$XqAYPPZQ8q.hg5UJASyUsOSDokBnUjNE4ZCrKa2YBvFAWOiyQRK6u', // admin123
//         firstName: 'Admin',
//         lastName: 'User',
//         isAdmin: true,
//         roles: [adminRole],
//       });

//       managerUser = await userRepository.save({
//         email: 'complex-manager@example.com',
//         password:
//           '$2a$10$XqAYPPZQ8q.hg5UJASyUsOSDokBnUjNE4ZCrKa2YBvFAWOiyQRK6u', // admin123
//         firstName: 'Manager',
//         lastName: 'User',
//         isAdmin: false,
//         roles: [managerRole],
//       });

//       editorUser = await userRepository.save({
//         email: 'complex-editor@example.com',
//         password:
//           '$2a$10$XqAYPPZQ8q.hg5UJASyUsOSDokBnUjNE4ZCrKa2YBvFAWOiyQRK6u', // admin123
//         firstName: 'Editor',
//         lastName: 'User',
//         isAdmin: false,
//         roles: [editorRole],
//       });

//       viewerUser = await userRepository.save({
//         email: 'complex-viewer@example.com',
//         password:
//           '$2a$10$XqAYPPZQ8q.hg5UJASyUsOSDokBnUjNE4ZCrKa2YBvFAWOiyQRK6u', // admin123
//         firstName: 'Viewer',
//         lastName: 'User',
//         isAdmin: false,
//         roles: [viewerRole],
//       });

//       console.log('Created test users with different roles');

//       // Create articles for testing
//       const articleData = [
//         {
//           title: 'Article 1',
//           content: 'Full content of article 1',
//           summary: 'Summary of article 1',
//           authorId: adminUser.id,
//           published: true,
//         },
//         {
//           title: 'Article 2',
//           content: 'Full content of article 2',
//           summary: 'Summary of article 2',
//           authorId: adminUser.id,
//           published: true,
//         },
//         {
//           title: 'Draft Article',
//           content: 'Full content of draft article',
//           summary: 'Summary of draft article',
//           authorId: adminUser.id,
//           published: false,
//         },
//       ];

//       // Save articles
//       articles = await Promise.all(
//         articleData.map((article) =>
//           articleRepository.save(articleRepository.create(article)),
//         ),
//       );

//       console.log(
//         `Created ${articles.length} test articles for permission testing`,
//       );
//     });

//     it('admin should have full access to all resources', async () => {
//       console.log('Testing admin permissions - should have full access');

//       // Login as admin
//       await authHelper.login({
//         email: adminUser.email,
//         password: 'admin123',
//       });

//       console.log('Logged in as admin user');

//       // Check user management
//       console.log('Admin accessing users list');
//       const usersResponse = await request.get('/users', true);

//       expect(usersResponse.statusCode).toBe(200);
//       expect(usersResponse.body.success).toBe(true);
//       expect(usersResponse.body.data.items.length).toBeGreaterThan(0);

//       // Check article management
//       console.log('Admin accessing articles list');
//       const articlesResponse = await request.get('/articles', true);

//       expect(articlesResponse.statusCode).toBe(200);
//       expect(articlesResponse.body.success).toBe(true);
//       expect(articlesResponse.body.data.items.length).toBeGreaterThan(0);

//       // Check article creation
//       const newArticle = {
//         title: 'New Admin Article',
//         content: 'Content created by admin',
//         summary: 'Admin summary',
//       };

//       console.log('Admin creating new article:', JSON.stringify(newArticle));
//       const createResponse = await request.post('/articles', newArticle, true);

//       expect(createResponse.statusCode).toBe(201);
//       expect(createResponse.body.success).toBe(true);
//       expect(createResponse.body.data).toHaveProperty('id');
//       expect(createResponse.body.data.title).toBe(newArticle.title);

//       // Check article update
//       const articleToUpdate = articles[0];
//       const updateData = {
//         title: 'Updated by Admin',
//         content: 'Content updated by admin',
//       };

//       console.log(`Admin updating article ${articleToUpdate.id}`);
//       const updateResponse = await request.put(
//         `/articles/${articleToUpdate.id}`,
//         updateData,
//         true,
//       );

//       expect(updateResponse.statusCode).toBe(200);
//       expect(updateResponse.body.success).toBe(true);
//       expect(updateResponse.body.data.title).toBe(updateData.title);

//       // Check article deletion
//       console.log(`Admin deleting article ${articleToUpdate.id}`);
//       const deleteResponse = await request.delete(
//         `/articles/${articleToUpdate.id}`,
//         true,
//       );

//       expect(deleteResponse.statusCode).toBe(200);
//       expect(deleteResponse.body.success).toBe(true);

//       // Verify article was deleted
//       const getDeletedResponse = await request.get(
//         `/articles/${articleToUpdate.id}`,
//         true,
//       );
//       expect(getDeletedResponse.statusCode).toBe(404);
//     });

//     it('manager should only have access to user management', async () => {
//       console.log(
//         'Testing manager permissions - should access users but not articles',
//       );

//       // Login as manager
//       await authHelper.login({
//         email: managerUser.email,
//         password: 'admin123',
//       });

//       console.log('Logged in as manager user');

//       // Should be able to access users
//       console.log('Manager accessing users list');
//       const usersResponse = await request.get('/users', true);

//       expect(usersResponse.statusCode).toBe(200);
//       expect(usersResponse.body.success).toBe(true);
//       expect(usersResponse.body.data.items.length).toBeGreaterThan(0);

//       // Should be able to create users
//       const newUser = fixtures.createUser({
//         email: `manager-created-${Date.now()}@example.com`,
//         password: 'Password123!',
//       });

//       console.log('Manager creating user:', JSON.stringify(newUser));
//       const createUserResponse = await request.post('/users', newUser, true);

//       expect(createUserResponse.statusCode).toBe(201);
//       expect(createUserResponse.body.success).toBe(true);

//       // Should be able to update users
//       const userToUpdate = (await userRepository.find())[0];
//       const updateUserData = {
//         firstName: 'Updated',
//         lastName: 'ByManager',
//       };

//       console.log(`Manager updating user ${userToUpdate.id}`);
//       const updateUserResponse = await request.put(
//         `/users/${userToUpdate.id}`,
//         updateUserData,
//         true,
//       );

//       expect(updateUserResponse.statusCode).toBe(200);
//       expect(updateUserResponse.body.success).toBe(true);

//       // Should not be able to create articles
//       const newArticle = {
//         title: 'New Manager Article',
//         content: 'Content created by manager',
//         summary: 'Manager summary',
//       };

//       console.log(
//         'Manager attempting to create article:',
//         JSON.stringify(newArticle),
//       );
//       const createResponse = await request.post('/articles', newArticle, true);

//       expect(createResponse.statusCode).toBe(403);
//       expect(createResponse.body.success).toBe(false);

//       // Should not be able to update articles
//       const articleToUpdate = articles[0];
//       const updateData = {
//         title: 'Updated by Manager',
//         content: 'Content updated by manager',
//       };

//       console.log(`Manager attempting to update article ${articleToUpdate.id}`);
//       const updateResponse = await request.put(
//         `/articles/${articleToUpdate.id}`,
//         updateData,
//         true,
//       );

//       expect(updateResponse.statusCode).toBe(403);
//       expect(updateResponse.body.success).toBe(false);
//     });

//     it('editor should only have access to article management', async () => {
//       console.log(
//         'Testing editor permissions - should access articles but not create users',
//       );

//       // Login as editor
//       await authHelper.login({
//         email: editorUser.email,
//         password: 'admin123',
//       });

//       console.log('Logged in as editor user');

//       // Should not be able to create users
//       const newUser = fixtures.createUser({
//         email: `editor-created-${Date.now()}@example.com`,
//         password: 'Password123!',
//       });

//       console.log('Editor attempting to create user:', JSON.stringify(newUser));
//       const createUserResponse = await request.post('/users', newUser, true);

//       console.log(
//         'Editor user creation response:',
//         JSON.stringify(createUserResponse.body),
//       );

//       expect(createUserResponse.statusCode).toBe(403);
//       expect(createUserResponse.body.success).toBe(false);

//       // Should be able to create articles
//       const newArticle = {
//         title: 'New Editor Article',
//         content: 'Content created by editor',
//         summary: 'Editor summary',
//       };

//       console.log('Editor creating article:', JSON.stringify(newArticle));
//       const createArticleResponse = await request.post(
//         '/articles',
//         newArticle,
//         true,
//       );

//       console.log(
//         'Editor article creation response:',
//         JSON.stringify(createArticleResponse.body),
//       );

//       expect(createArticleResponse.statusCode).toBe(201);
//       expect(createArticleResponse.body.success).toBe(true);
//       expect(createArticleResponse.body.data).toHaveProperty('id');
//       expect(createArticleResponse.body.data.title).toBe(newArticle.title);

//       // Should be able to update articles
//       const articleToUpdate = articles[0];
//       const updateData = {
//         title: 'Updated by Editor',
//         content: 'Content updated by editor',
//       };

//       console.log(`Editor updating article ${articleToUpdate.id}`);
//       const updateResponse = await request.put(
//         `/articles/${articleToUpdate.id}`,
//         updateData,
//         true,
//       );

//       expect(updateResponse.statusCode).toBe(200);
//       expect(updateResponse.body.success).toBe(true);
//       expect(updateResponse.body.data.title).toBe(updateData.title);

//       // Should not be able to delete articles if that permission wasn't granted
//       console.log(`Editor attempting to delete article ${articleToUpdate.id}`);
//       const deleteResponse = await request.delete(
//         `/articles/${articleToUpdate.id}`,
//         true,
//       );

//       expect(deleteResponse.statusCode).toBe(403);
//       expect(deleteResponse.body.success).toBe(false);
//     });

//     it('viewer should have read-only access with field restrictions', async () => {
//       console.log(
//         'Testing viewer permissions - should have read-only access with field limitations',
//       );

//       // Login as viewer
//       await authHelper.login({
//         email: viewerUser.email,
//         password: 'admin123',
//       });

//       console.log('Logged in as viewer user');

//       // Should be able to read users with limited fields
//       console.log('Viewer accessing users list');
//       const usersResponse = await request.get('/users', true);

//       console.log('Viewer users response:', JSON.stringify(usersResponse.body));

//       expect(usersResponse.statusCode).toBe(200);
//       expect(usersResponse.body.success).toBe(true);
//       expect(usersResponse.body.data.items.length).toBeGreaterThan(0);

//       // Check that sensitive fields are not included
//       const user = usersResponse.body.data.items[0];
//       console.log('Checking field restrictions on user objects');

//       expect(user).toHaveProperty('id');
//       expect(user).toHaveProperty('firstName');
//       expect(user).toHaveProperty('lastName');
//       expect(user).toHaveProperty('email');
//       expect(user).not.toHaveProperty('password');
//       expect(user).not.toHaveProperty('isAdmin');

//       // Should be able to read articles with limited fields
//       console.log('Viewer accessing articles list');
//       const articlesResponse = await request.get('/articles', true);

//       console.log(
//         'Viewer articles response:',
//         JSON.stringify(articlesResponse.body),
//       );

//       expect(articlesResponse.statusCode).toBe(200);
//       expect(articlesResponse.body.success).toBe(true);
//       expect(articlesResponse.body.data.items.length).toBeGreaterThan(0);

//       // Check that content field is not included
//       const article = articlesResponse.body.data.items[0];
//       console.log('Checking field restrictions on article objects');

//       expect(article).toHaveProperty('title');
//       expect(article).toHaveProperty('summary');
//       expect(article).toHaveProperty('createdAt');
//       expect(article).not.toHaveProperty('content');

//       // Should not be able to create articles
//       const newArticle = {
//         title: 'New Viewer Article',
//         content: 'Content created by viewer',
//         summary: 'Viewer summary',
//       };

//       console.log(
//         'Viewer attempting to create article:',
//         JSON.stringify(newArticle),
//       );
//       const createResponse = await request.post('/articles', newArticle, true);

//       console.log(
//         'Viewer article creation response:',
//         JSON.stringify(createResponse.body),
//       );

//       expect(createResponse.statusCode).toBe(403);
//       expect(createResponse.body.success).toBe(false);

//       // Should not be able to update articles
//       const articleToUpdate = articles[0];
//       const updateData = {
//         title: 'Updated by Viewer',
//         content: 'Content updated by viewer',
//       };

//       console.log(`Viewer attempting to update article ${articleToUpdate.id}`);
//       const updateResponse = await request.put(
//         `/articles/${articleToUpdate.id}`,
//         updateData,
//         true,
//       );

//       expect(updateResponse.statusCode).toBe(403);
//       expect(updateResponse.body.success).toBe(false);
//     });

//     it('field permissions should apply even on individual resources', async () => {
//       console.log('Testing field permissions on individual resource endpoints');

//       // Login as viewer
//       await authHelper.login({
//         email: viewerUser.email,
//         password: 'admin123',
//       });

//       // Check field restrictions on an individual article
//       const article = articles[0];
//       console.log(`Viewer accessing individual article ${article.id}`);

//       const response = await request.get(`/articles/${article.id}`, true);

//       expect(response.statusCode).toBe(200);
//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toHaveProperty('title');
//       expect(response.body.data).toHaveProperty('summary');
//       expect(response.body.data).toHaveProperty('createdAt');
//       expect(response.body.data).not.toHaveProperty('content');
//     });
//   });

//   describe('Ownership-based permissions', () => {
//     let authorUser: User;
//     let otherUser: User;
//     let authorArticle: Article;
//     let otherArticle: Article;

//     beforeEach(async () => {
//       console.log('Setting up ownership permission tests');

//       // Create author role with permissions to only manage own articles
//       const authorPermissions = await permissionRepository.save([
//         {
//           action: fixtures.Action.CREATE,
//           subject: fixtures.Subject.ARTICLE,
//           inverted: false,
//           reason: 'Authors can create articles',
//         },
//         {
//           action: fixtures.Action.READ,
//           subject: fixtures.Subject.ARTICLE,
//           inverted: false,
//           reason: 'Authors can read all articles',
//         },
//         {
//           action: fixtures.Action.UPDATE,
//           subject: fixtures.Subject.ARTICLE,
//           conditions: { authorId: '${user.id}' }, // Only update own articles
//           inverted: false,
//           reason: 'Authors can update only their own articles',
//         },
//         {
//           action: fixtures.Action.DELETE,
//           subject: fixtures.Subject.ARTICLE,
//           conditions: { authorId: '${user.id}' }, // Only delete own articles
//           inverted: false,
//           reason: 'Authors can delete only their own articles',
//         },
//       ]);

//       // Create author role
//       const authorRole = await roleRepository.save({
//         name: 'Author',
//         permissions: authorPermissions,
//       });

//       // Create test users
//       authorUser = await userRepository.save({
//         email: 'author-user@example.com',
//         password:
//           '$2a$10$XqAYPPZQ8q.hg5UJASyUsOSDokBnUjNE4ZCrKa2YBvFAWOiyQRK6u', // admin123
//         firstName: 'Author',
//         lastName: 'User',
//         isAdmin: false,
//         roles: [authorRole],
//       });

//       otherUser = await userRepository.save({
//         email: 'other-user@example.com',
//         password:
//           '$2a$10$XqAYPPZQ8q.hg5UJASyUsOSDokBnUjNE4ZCrKa2YBvFAWOiyQRK6u', // admin123
//         firstName: 'Other',
//         lastName: 'User',
//         isAdmin: false,
//         roles: [authorRole], // Same role, but different user
//       });

//       // Create articles owned by different authors
//       authorArticle = await articleRepository.save({
//         title: 'Author Article',
//         content: 'This is an article by the author',
//         summary: 'Article summary',
//         authorId: authorUser.id,
//         published: true,
//       });

//       otherArticle = await articleRepository.save({
//         title: 'Other Article',
//         content: 'This is an article by another user',
//         summary: 'Article summary',
//         authorId: otherUser.id,
//         published: true,
//       });

//       console.log('Created test users and articles for ownership tests');
//     });

//     it('authors should be able to update their own articles', async () => {
//       // Login as author
//       await authHelper.login({
//         email: authorUser.email,
//         password: 'admin123',
//       });

//       // Update own article
//       const updateData = {
//         title: 'Updated My Own Article',
//         content: 'Updated content',
//       };

//       console.log(`Author updating own article ${authorArticle.id}`);
//       const response = await request.put(
//         `/articles/${authorArticle.id}`,
//         updateData,
//         true,
//       );

//       expect(response.statusCode).toBe(200);
//       expect(response.body.success).toBe(true);
//       expect(response.body.data.title).toBe(updateData.title);
//     });

//     it('authors should not be able to update articles by others', async () => {
//       // Login as author
//       await authHelper.login({
//         email: authorUser.email,
//         password: 'admin123',
//       });

//       // Try to update someone else's article
//       const updateData = {
//         title: "Trying to Update Someone Else's Article",
//         content: 'Updated content',
//       };

//       console.log(
//         `Author attempting to update another user's article ${otherArticle.id}`,
//       );
//       const response = await request.put(
//         `/articles/${otherArticle.id}`,
//         updateData,
//         true,
//       );

//       expect(response.statusCode).toBe(403);
//       expect(response.body.success).toBe(false);
//     });

//     it('authors should be able to delete their own articles', async () => {
//       // Login as author
//       await authHelper.login({
//         email: authorUser.email,
//         password: 'admin123',
//       });

//       // Delete own article
//       console.log(`Author deleting own article ${authorArticle.id}`);
//       const response = await request.delete(
//         `/articles/${authorArticle.id}`,
//         true,
//       );

//       expect(response.statusCode).toBe(200);
//       expect(response.body.success).toBe(true);

//       // Verify article is deleted
//       const checkResponse = await request.get(
//         `/articles/${authorArticle.id}`,
//         true,
//       );
//       expect(checkResponse.statusCode).toBe(404);
//     });

//     it('authors should not be able to delete articles by others', async () => {
//       // Login as author
//       await authHelper.login({
//         email: authorUser.email,
//         password: 'admin123',
//       });

//       // Try to delete someone else's article
//       console.log(
//         `Author attempting to delete another user's article ${otherArticle.id}`,
//       );
//       const response = await request.delete(
//         `/articles/${otherArticle.id}`,
//         true,
//       );

//       expect(response.statusCode).toBe(403);
//       expect(response.body.success).toBe(false);

//       // Verify article still exists
//       const checkResponse = await request.get(
//         `/articles/${otherArticle.id}`,
//         true,
//       );
//       expect(checkResponse.statusCode).toBe(200);
//     });
//   });

//   describe('Complex condition-based permissions', () => {
//     let publisherUser: User;
//     let draftArticles: Article[];
//     let publishedArticles: Article[];

//     beforeEach(async () => {
//       console.log('Setting up complex condition-based permission tests');

//       // Create publisher role with permissions to publish only draft articles
//       const publisherPermissions = await permissionRepository.save([
//         {
//           action: fixtures.Action.READ,
//           subject: fixtures.Subject.ARTICLE,
//           inverted: false,
//           reason: 'Publishers can read all articles',
//         },
//         {
//           action: fixtures.Action.UPDATE,
//           subject: fixtures.Subject.ARTICLE,
//           conditions: { published: false }, // Can only update draft articles
//           inverted: false,
//           reason: 'Publishers can update only draft articles',
//         },
//       ]);

//       // Create publisher role
//       const publisherRole = await roleRepository.save({
//         name: 'Publisher',
//         permissions: publisherPermissions,
//       });

//       // Create publisher user
//       publisherUser = await userRepository.save({
//         email: 'publisher-user@example.com',
//         password:
//           '$2a$10$XqAYPPZQ8q.hg5UJASyUsOSDokBnUjNE4ZCrKa2YBvFAWOiyQRK6u', // admin123
//         firstName: 'Publisher',
//         lastName: 'User',
//         isAdmin: false,
//         roles: [publisherRole],
//       });

//       // Create draft and published articles
//       draftArticles = await Promise.all([
//         articleRepository.save({
//           title: 'Draft Article 1',
//           content: 'This is a draft article',
//           summary: 'Draft summary',
//           authorId: publisherUser.id,
//           published: false,
//         }),
//         articleRepository.save({
//           title: 'Draft Article 2',
//           content: 'This is another draft article',
//           summary: 'Draft summary',
//           authorId: publisherUser.id,
//           published: false,
//         }),
//       ]);

//       publishedArticles = await Promise.all([
//         articleRepository.save({
//           title: 'Published Article 1',
//           content: 'This is a published article',
//           summary: 'Published summary',
//           authorId: publisherUser.id,
//           published: true,
//         }),
//         articleRepository.save({
//           title: 'Published Article 2',
//           content: 'This is another published article',
//           summary: 'Published summary',
//           authorId: publisherUser.id,
//           published: true,
//         }),
//       ]);

//       console.log(
//         'Created publisher user and articles with different statuses',
//       );
//     });

//     it('publisher should be able to update draft articles', async () => {
//       // Login as publisher
//       // Login as publisher
//       await authHelper.login({
//         email: publisherUser.email,
//         password: 'admin123',
//       });

//       // Update a draft article
//       const draftArticle = draftArticles[0];
//       const updateData = {
//         title: 'Updated Draft Article',
//         content: 'Updated content for draft',
//         published: true, // Attempt to publish it
//       };

//       console.log(`Publisher updating draft article ${draftArticle.id}`);
//       const response = await request.put(
//         `/articles/${draftArticle.id}`,
//         updateData,
//         true,
//       );

//       expect(response.statusCode).toBe(200);
//       expect(response.body.success).toBe(true);
//       expect(response.body.data.title).toBe(updateData.title);
//       expect(response.body.data.published).toBe(true);
//     });

//     it('publisher should not be able to update published articles', async () => {
//       // Login as publisher
//       await authHelper.login({
//         email: publisherUser.email,
//         password: 'admin123',
//       });

//       // Try to update a published article
//       const publishedArticle = publishedArticles[0];
//       const updateData = {
//         title: 'Trying to Update Published Article',
//         content: 'Updated content for published article',
//       };

//       console.log(
//         `Publisher attempting to update published article ${publishedArticle.id}`,
//       );
//       const response = await request.put(
//         `/articles/${publishedArticle.id}`,
//         updateData,
//         true,
//       );

//       expect(response.statusCode).toBe(403);
//       expect(response.body.success).toBe(false);
//     });
//   });

//   describe('Negated permissions', () => {
//     let restrictedUser: User;
//     let articles: Article[];

//     beforeEach(async () => {
//       console.log('Setting up negated permission tests');

//       // Create restricted role with inverted permissions
//       const restrictedPermissions = await permissionRepository.save([
//         {
//           action: fixtures.Action.READ,
//           subject: fixtures.Subject.ARTICLE,
//           inverted: false,
//           reason: 'Can read articles',
//         },
//         {
//           action: fixtures.Action.READ,
//           subject: fixtures.Subject.USER,
//           inverted: false,
//           reason: 'Can read users',
//         },
//         {
//           action: fixtures.Action.DELETE,
//           subject: fixtures.Subject.ARTICLE,
//           inverted: true, // Important: This permission is inverted (NOT)
//           reason: 'Cannot delete articles',
//         },
//       ]);

//       // Create restricted role
//       const restrictedRole = await roleRepository.save({
//         name: 'Restricted',
//         permissions: restrictedPermissions,
//       });

//       // Create restricted user
//       restrictedUser = await userRepository.save({
//         email: 'restricted-user@example.com',
//         password:
//           '$2a$10$XqAYPPZQ8q.hg5UJASyUsOSDokBnUjNE4ZCrKa2YBvFAWOiyQRK6u', // admin123
//         firstName: 'Restricted',
//         lastName: 'User',
//         isAdmin: false,
//         roles: [restrictedRole],
//       });

//       // Create test articles
//       articles = await Promise.all([
//         articleRepository.save({
//           title: 'Article for Negated Permissions Test',
//           content: 'This is a test article',
//           summary: 'Test summary',
//           authorId: restrictedUser.id,
//           published: true,
//         }),
//       ]);

//       console.log(
//         'Created restricted user and articles for negated permission tests',
//       );
//     });

//     it('should enforce negated permissions', async () => {
//       // Login as restricted user
//       await authHelper.login({
//         email: restrictedUser.email,
//         password: 'admin123',
//       });

//       // Should be able to read articles
//       console.log('Restricted user accessing articles list');
//       const listResponse = await request.get('/articles', true);

//       expect(listResponse.statusCode).toBe(200);
//       expect(listResponse.body.success).toBe(true);

//       // Should be able to read specific article
//       const article = articles[0];
//       console.log(`Restricted user accessing specific article ${article.id}`);
//       const getResponse = await request.get(`/articles/${article.id}`, true);

//       expect(getResponse.statusCode).toBe(200);
//       expect(getResponse.body.success).toBe(true);

//       // Should NOT be able to delete articles (negated permission)
//       console.log(`Restricted user attempting to delete article ${article.id}`);
//       const deleteResponse = await request.delete(
//         `/articles/${article.id}`,
//         true,
//       );

//       expect(deleteResponse.statusCode).toBe(403);
//       expect(deleteResponse.body.success).toBe(false);
//     });
//   });

//   describe('Multi-role permissions combination', () => {
//     let multiRoleUser: User;
//     let articles: Article[];

//     beforeEach(async () => {
//       console.log('Setting up multi-role permission tests');

//       // Create two roles with different permissions
//       const readerPermissions = await permissionRepository.save([
//         {
//           action: fixtures.Action.READ,
//           subject: fixtures.Subject.ARTICLE,
//           inverted: false,
//           reason: 'Reader can read articles',
//         },
//       ]);

//       const writerPermissions = await permissionRepository.save([
//         {
//           action: fixtures.Action.CREATE,
//           subject: fixtures.Subject.ARTICLE,
//           inverted: false,
//           reason: 'Writer can create articles',
//         },
//       ]);

//       // Create roles
//       const readerRole = await roleRepository.save({
//         name: 'Reader',
//         permissions: readerPermissions,
//       });

//       const writerRole = await roleRepository.save({
//         name: 'Writer',
//         permissions: writerPermissions,
//       });

//       // Create user with both roles
//       multiRoleUser = await userRepository.save({
//         email: 'multi-role-user@example.com',
//         password:
//           '$2a$10$XqAYPPZQ8q.hg5UJASyUsOSDokBnUjNE4ZCrKa2YBvFAWOiyQRK6u', // admin123
//         firstName: 'MultiRole',
//         lastName: 'User',
//         isAdmin: false,
//         roles: [readerRole, writerRole], // User has both roles
//       });

//       // Create test articles
//       articles = await Promise.all([
//         articleRepository.save({
//           title: 'Article for Multi-Role Test',
//           content: 'This is a test article',
//           summary: 'Test summary',
//           authorId: multiRoleUser.id,
//           published: true,
//         }),
//       ]);

//       console.log('Created multi-role user and articles for permission tests');
//     });

//     it('should combine permissions from multiple roles', async () => {
//       // Login as multi-role user
//       await authHelper.login({
//         email: multiRoleUser.email,
//         password: 'admin123',
//       });

//       // Should be able to read articles (Reader role)
//       console.log('Multi-role user accessing articles list');
//       const listResponse = await request.get('/articles', true);

//       expect(listResponse.statusCode).toBe(200);
//       expect(listResponse.body.success).toBe(true);

//       // Should be able to create articles (Writer role)
//       const newArticle = {
//         title: 'New Article by Multi-Role User',
//         content: 'Content created by multi-role user',
//         summary: 'Summary by multi-role user',
//       };

//       console.log('Multi-role user creating article');
//       const createResponse = await request.post('/articles', newArticle, true);

//       expect(createResponse.statusCode).toBe(201);
//       expect(createResponse.body.success).toBe(true);
//       expect(createResponse.body.data.title).toBe(newArticle.title);

//       // Should NOT be able to update/delete articles (neither role has this permission)
//       const article = articles[0];
//       console.log(`Multi-role user attempting to update article ${article.id}`);

//       const updateResponse = await request.put(
//         `/articles/${article.id}`,
//         { title: 'Updated Title' },
//         true,
//       );

//       expect(updateResponse.statusCode).toBe(403);
//       expect(updateResponse.body.success).toBe(false);
//     });
//   });
// });
