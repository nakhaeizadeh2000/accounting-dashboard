import { TestRequest } from '../../helpers/request.helper';
import { DatabaseTestHelper } from '../../helpers/database.helper';
import { AuthTestHelper } from '../../helpers/auth-test.helper';
import { setupTestApp, teardownTestApp } from '../../setup-tests';
import { getConnection } from 'typeorm';
import { Permission } from '../../../src/permissions/entities/permission.entity';
import { Role } from '../../../src/role/entities/role.entity';
import { User } from '../../../src/modules/users/entities/user.entity';

describe('Complex Permission Scenarios (e2e)', () => {
  let request: TestRequest;
  let dbHelper: DatabaseTestHelper;
  let authHelper: AuthTestHelper;

  beforeAll(async () => {
    console.log('Setting up test environment for permissions tests');
    await setupTestApp();

    request = new TestRequest();
    // Remove the init() call since we're using supertest.agent directly

    dbHelper = new DatabaseTestHelper();
    await dbHelper.init();

    authHelper = new AuthTestHelper(request);
    console.log('Test environment ready');
  });

  beforeEach(async () => {
    console.log('Starting new transaction for test isolation');
    // Use transaction-based approach instead of clearing tables
    await dbHelper.startTransaction();
  });

  afterEach(async () => {
    console.log('Rolling back transaction');
    // Roll back transaction after each test
    await dbHelper.rollbackTransaction();
  });

  afterAll(async () => {
    console.log('Tearing down test environment');
    await teardownTestApp();
  });

  describe('Role-based access with field permissions', () => {
    let adminUser: any;
    let managerUser: any;
    let editorUser: any;
    let viewerUser: any;

    beforeEach(async () => {
      console.log('Setting up roles and permissions for test');

      const connection = getConnection();

      // Create a complete permission set with field-level specifications
      const permissions = await connection.getRepository(Permission).save([
        // Admin permissions - full access to everything
        {
          action: 'manage',
          subject: 'all',
          inverted: false,
          reason: 'Full admin access',
        },

        // Manager permissions - can create and manage users but not delete
        {
          action: 'create',
          subject: 'User',
          inverted: false,
          reason: 'Manager can create users',
        },
        {
          action: 'read',
          subject: 'User',
          inverted: false,
          reason: 'Manager can read users',
        },
        {
          action: 'update',
          subject: 'User',
          inverted: false,
          reason: 'Manager can update users',
        },

        // Editor permissions - can create and edit content
        {
          action: 'create',
          subject: 'Article',
          inverted: false,
          reason: 'Editor can create articles',
        },
        {
          action: 'read',
          subject: 'Article',
          inverted: false,
          reason: 'Editor can read articles',
        },
        {
          action: 'update',
          subject: 'Article',
          inverted: false,
          reason: 'Editor can update articles',
        },

        // Viewer permissions - read-only with field restrictions
        {
          action: 'read',
          subject: 'User',
          fields: ['id', 'firstName', 'lastName', 'email'],
          inverted: false,
          reason: 'Viewer can see basic user info',
        },
        {
          action: 'read',
          subject: 'Article',
          fields: ['title', 'summary', 'createdAt'],
          inverted: false,
          reason: 'Viewer can see article metadata but not full content',
        },
      ]);

      console.log(`Created ${permissions.length} permissions for testing`);

      // Create roles with different permission sets
      const adminRole = await connection.getRepository(Role).save({
        name: 'Admin',
        permissions: [permissions[0]], // Full manage all permission
      });

      const managerRole = await connection.getRepository(Role).save({
        name: 'Manager',
        permissions: [permissions[1], permissions[2], permissions[3]], // User management
      });

      const editorRole = await connection.getRepository(Role).save({
        name: 'Editor',
        permissions: [permissions[4], permissions[5], permissions[6]], // Article management
      });

      const viewerRole = await connection.getRepository(Role).save({
        name: 'Viewer',
        permissions: [permissions[7], permissions[8]], // Limited field access
      });

      console.log('Created roles: Admin, Manager, Editor, Viewer');

      // Create users with different roles
      adminUser = await connection.getRepository(User).save({
        email: 'complex-admin@example.com',
        password:
          '$2a$10$XqAYPPZQ8q.hg5UJASyUsOSDokBnUjNE4ZCrKa2YBvFAWOiyQRK6u', // admin123
        firstName: 'Admin',
        lastName: 'User',
        isAdmin: true,
        roles: [adminRole],
      });

      managerUser = await connection.getRepository(User).save({
        email: 'complex-manager@example.com',
        password:
          '$2a$10$XqAYPPZQ8q.hg5UJASyUsOSDokBnUjNE4ZCrKa2YBvFAWOiyQRK6u', // admin123
        firstName: 'Manager',
        lastName: 'User',
        isAdmin: false,
        roles: [managerRole],
      });

      editorUser = await connection.getRepository(User).save({
        email: 'complex-editor@example.com',
        password:
          '$2a$10$XqAYPPZQ8q.hg5UJASyUsOSDokBnUjNE4ZCrKa2YBvFAWOiyQRK6u', // admin123
        firstName: 'Editor',
        lastName: 'User',
        isAdmin: false,
        roles: [editorRole],
      });

      viewerUser = await connection.getRepository(User).save({
        email: 'complex-viewer@example.com',
        password:
          '$2a$10$XqAYPPZQ8q.hg5UJASyUsOSDokBnUjNE4ZCrKa2YBvFAWOiyQRK6u', // admin123
        firstName: 'Viewer',
        lastName: 'User',
        isAdmin: false,
        roles: [viewerRole],
      });

      console.log('Created test users with different roles');

      // Create some articles for testing
      await connection.query(
        `
        INSERT INTO articles (title, content, summary, author_id)
        VALUES
          ('Article 1', 'Full content of article 1', 'Summary of article 1', $1),
          ('Article 2', 'Full content of article 2', 'Summary of article 2', $1),
          ('Article 3', 'Full content of article 3', 'Summary of article 3', $1)
      `,
        [adminUser.id],
      );

      console.log('Created test articles for permission testing');
    });

    it('admin should have full access to all resources', async () => {
      console.log('Testing admin permissions - should have full access');

      await authHelper.login({
        email: adminUser.email,
        password: 'admin123',
      });

      console.log('Logged in as admin user');

      // Check user management
      console.log('Admin accessing users list');
      const usersResponse = await request.get('/users', {});
      console.log('Admin users response:', JSON.stringify(usersResponse.body));

      expect(usersResponse.status).toBe(200);
      expect(usersResponse.body.data.items.length).toBeGreaterThan(0);

      // Check article management
      console.log('Admin accessing articles list');
      const articlesResponse = await request.get('/articles', {});
      console.log(
        'Admin articles response:',
        JSON.stringify(articlesResponse.body),
      );

      expect(articlesResponse.status).toBe(200);
      expect(articlesResponse.body.data.items.length).toBeGreaterThan(0);

      // Check article creation
      const newArticle = {
        title: 'New Admin Article',
        content: 'Content created by admin',
        summary: 'Admin summary',
      };

      console.log('Admin creating new article:', JSON.stringify(newArticle));
      const createResponse = await request.post('/articles', newArticle, {});
      console.log(
        'Admin article creation response:',
        JSON.stringify(createResponse.body),
      );

      expect(createResponse.status).toBe(201);
    });

    it('manager should only have access to user management', async () => {
      console.log(
        'Testing manager permissions - should access users but not articles',
      );

      await authHelper.login({
        email: managerUser.email,
        password: 'admin123',
      });

      console.log('Logged in as manager user');

      // Should be able to access users
      console.log('Manager accessing users list');
      const usersResponse = await request.get('/users', {});
      console.log(
        'Manager users response:',
        JSON.stringify(usersResponse.body),
      );

      expect(usersResponse.status).toBe(200);
      expect(usersResponse.body.data.items.length).toBeGreaterThan(0);

      // Should not be able to create articles
      const newArticle = {
        title: 'New Manager Article',
        content: 'Content created by manager',
        summary: 'Manager summary',
      };

      console.log(
        'Manager attempting to create article:',
        JSON.stringify(newArticle),
      );
      const createResponse = await request.post('/articles', newArticle, {});
      console.log(
        'Manager article creation response:',
        JSON.stringify(createResponse.body),
      );

      expect(createResponse.status).toBe(403);
    });

    it('editor should only have access to article management', async () => {
      console.log(
        'Testing editor permissions - should access articles but not create users',
      );

      await authHelper.login({
        email: editorUser.email,
        password: 'admin123',
      });

      console.log('Logged in as editor user');

      // Should not be able to create users
      const newUser = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      };

      console.log('Editor attempting to create user:', JSON.stringify(newUser));
      const createUserResponse = await request.post('/users', newUser, {});
      console.log(
        'Editor user creation response:',
        JSON.stringify(createUserResponse.body),
      );

      expect(createUserResponse.status).toBe(403);

      // Should be able to create articles
      const newArticle = {
        title: 'New Editor Article',
        content: 'Content created by editor',
        summary: 'Editor summary',
      };

      console.log('Editor creating article:', JSON.stringify(newArticle));
      const createArticleResponse = await request.post(
        '/articles',
        newArticle,
        {},
      );
      console.log(
        'Editor article creation response:',
        JSON.stringify(createArticleResponse.body),
      );

      expect(createArticleResponse.status).toBe(201);
    });

    it('viewer should have read-only access with field restrictions', async () => {
      console.log(
        'Testing viewer permissions - should have read-only access with field limitations',
      );

      await authHelper.login({
        email: viewerUser.email,
        password: 'admin123',
      });

      console.log('Logged in as viewer user');

      // Should be able to read users with limited fields
      console.log('Viewer accessing users list');
      const usersResponse = await request.get('/users', {});
      console.log('Viewer users response:', JSON.stringify(usersResponse.body));

      expect(usersResponse.status).toBe(200);
      expect(usersResponse.body.data.items.length).toBeGreaterThan(0);

      // Check that sensitive fields are not included
      const user = usersResponse.body.data.items[0];
      console.log('Checking field restrictions on user objects');

      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('firstName');
      expect(user).toHaveProperty('lastName');
      expect(user).toHaveProperty('email');
      expect(user).not.toHaveProperty('password');
      expect(user).not.toHaveProperty('isAdmin');

      // Should be able to read articles with limited fields
      console.log('Viewer accessing articles list');
      const articlesResponse = await request.get('/articles', {});
      console.log(
        'Viewer articles response:',
        JSON.stringify(articlesResponse.body),
      );

      expect(articlesResponse.status).toBe(200);
      expect(articlesResponse.body.data.items.length).toBeGreaterThan(0);

      // Check that content field is not included
      const article = articlesResponse.body.data.items[0];
      console.log('Checking field restrictions on article objects');

      expect(article).toHaveProperty('title');
      expect(article).toHaveProperty('summary');
      expect(article).toHaveProperty('createdAt');
      expect(article).not.toHaveProperty('content');

      // Should not be able to create articles
      const newArticle = {
        title: 'New Viewer Article',
        content: 'Content created by viewer',
        summary: 'Viewer summary',
      };

      console.log(
        'Viewer attempting to create article:',
        JSON.stringify(newArticle),
      );
      const createResponse = await request.post('/articles', newArticle, {});
      console.log(
        'Viewer article creation response:',
        JSON.stringify(createResponse.body),
      );

      expect(createResponse.status).toBe(403);
    });
  });
});
