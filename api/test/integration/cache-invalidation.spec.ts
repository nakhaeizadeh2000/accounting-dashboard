import { TestRequest } from '../helpers/request.helper';
import { DatabaseTestHelper } from '../helpers/database.helper';
import { AuthTestHelper } from '../helpers/auth-test.helper';
import { setupTestApp, teardownTestApp, getCacheManager } from '../setup-tests';
import * as fixtures from '../fixtures';

describe('Cache Invalidation (integration)', () => {
  let request: TestRequest;
  let dbHelper: DatabaseTestHelper;
  let authHelper: AuthTestHelper;
  let cacheManager: any;

  beforeAll(async () => {
    console.log('Setting up test environment for cache invalidation tests');
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

  describe('Cache invalidation on data changes', () => {
    it('should invalidate user cache when updating a user', async () => {
      console.log('Testing: cache invalidation when updating a user');

      // Login as admin
      console.log('Logging in as admin');
      await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      // First get user data to be cached
      console.log('Getting users to populate cache');
      await request.get('/users', {});
      expect(cacheManager.set).toHaveBeenCalled();
      console.log('Cache populated successfully');
      cacheManager.set.mockClear();

      // Get a specific user to update
      console.log('Getting users list to find ID to update');
      const usersResponse = await request.get('/users', {});
      const userId = usersResponse.body.data.items[1].id;
      console.log(`Selected user ID for update: ${userId}`);

      // Update the user
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      console.log(`Updating user ${userId} with:`, JSON.stringify(updateData));
      await request.put(`/users/${userId}`, updateData, {});
      console.log('User updated');

      // Verify cache was invalidated
      console.log('Checking if cache was invalidated');
      expect(cacheManager.del).toHaveBeenCalled();
      console.log('Cache invalidation confirmed');

      // Make a new request for users
      console.log('Making another request to repopulate cache');
      await request.get('/users', {});

      // Verify data was re-cached
      console.log('Verifying data was re-cached');
      expect(cacheManager.set).toHaveBeenCalled();
      console.log('Cache re-population confirmed');
    });

    it('should invalidate article cache when updating an article', async () => {
      console.log('Testing: cache invalidation when updating an article');

      // Login as admin
      console.log('Logging in as admin');
      await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      // First create an article
      const newArticle = {
        title: 'Cache Test Article',
        content: 'Content for cache testing',
        summary: 'Cache test summary',
      };

      console.log(
        'Creating new article for testing:',
        JSON.stringify(newArticle),
      );
      const createResponse = await request.post('/articles', newArticle, {});
      const articleId = createResponse.body.data.id;
      console.log(`Created article with ID: ${articleId}`);

      // Get article data to be cached
      console.log('Getting articles to populate cache');
      await request.get('/articles', {});
      console.log('Cache populated with articles');
      cacheManager.set.mockClear();

      // Update the article
      const updateData = {
        title: 'Updated Cache Test Article',
        content: 'Updated content for cache testing',
      };

      console.log(
        `Updating article ${articleId} with:`,
        JSON.stringify(updateData),
      );
      await request.put(`/articles/${articleId}`, updateData, {});
      console.log('Article updated');

      // Verify cache was invalidated
      console.log('Checking if cache was invalidated');
      expect(cacheManager.del).toHaveBeenCalled();
      console.log('Cache invalidation confirmed');

      // Make a new request for articles
      console.log('Making another request to repopulate cache');
      await request.get('/articles', {});

      // Verify data was re-cached
      console.log('Verifying data was re-cached');
      expect(cacheManager.set).toHaveBeenCalled();
      console.log('Cache re-population confirmed');
    });

    it('should invalidate multiple caches when deleting related data', async () => {
      console.log(
        'Testing: multiple cache invalidations on related data deletion',
      );

      // Login as admin
      console.log('Logging in as admin');
      await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      // Create a test category
      const categoryData = {
        name: 'Test Category',
        description: 'Category for testing cache invalidation',
      };

      console.log('Creating test category:', JSON.stringify(categoryData));
      const categoryResponse = await request.post(
        '/categories',
        categoryData,
        {},
      );
      const categoryId = categoryResponse.body.data.id;
      console.log(`Created category with ID: ${categoryId}`);

      // Create an article in that category
      const articleData = {
        title: 'Article in Test Category',
        content: 'Content for testing category relation',
        categoryId: categoryId,
      };

      console.log(
        'Creating test article in category:',
        JSON.stringify(articleData),
      );
      const articleResponse = await request.post('/articles', articleData, {});
      const articleId = articleResponse.body.data.id;
      console.log(`Created article with ID: ${articleId}`);

      // Load both resources to cache them
      console.log('Loading categories and articles to populate cache');
      await request.get('/categories', {});
      await request.get('/articles', {});
      console.log('Cache populated with categories and articles');

      cacheManager.set.mockClear();
      cacheManager.del.mockClear();

      // Delete the category
      console.log(`Deleting category: ${categoryId}`);
      await request.delete(`/categories/${categoryId}`, {});
      console.log('Category deleted');

      // Verify multiple caches were invalidated
      const delCalls = cacheManager.del.mock.calls;
      console.log(`Number of cache invalidation calls: ${delCalls.length}`);

      // Should have invalidated both article and category caches
      expect(delCalls.length).toBeGreaterThanOrEqual(2);

      // Check that both caches were invalidated
      const deletedKeys = delCalls.map((call) => call[0]);
      console.log('Invalidated cache keys:', deletedKeys);

      expect(
        deletedKeys.some((key) => key.includes('categories')),
      ).toBeTruthy();
      expect(deletedKeys.some((key) => key.includes('articles'))).toBeTruthy();

      console.log(
        'Confirmed both category and article caches were invalidated',
      );
    });
  });

  describe('Cache TTL and automated expiration', () => {
    it('should reuse cache for repeated requests within TTL', async () => {
      console.log('Testing: cache reuse for repeated requests within TTL');

      // Login as admin
      console.log('Logging in as admin');
      await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      // Make initial request to populate cache
      console.log('Making initial request to populate cache');
      await request.get('/users', {});
      expect(cacheManager.set).toHaveBeenCalled();
      console.log('Cache populated successfully');

      // Mock cache hit for subsequent requests
      console.log('Setting up cache hit simulation');
      cacheManager.get.mockImplementation((key) => {
        if (key.includes('users')) {
          console.log('Simulating cache hit for users');
          return { items: fixtures.users, total: fixtures.users.length };
        }
        return null;
      });

      // Make same request again
      console.log('Making second request (should hit cache)');
      await request.get('/users', {});

      // Verify cache was checked
      console.log('Verifying cache was checked');
      expect(cacheManager.get).toHaveBeenCalled();
      // No additional cache set should occur
      expect(cacheManager.set).toHaveBeenCalledTimes(1);
      console.log('Confirmed request was served from cache');
    });

    it('should refetch data after cache expiration', async () => {
      console.log('Testing: data refetch after cache expiration');
      // This test simulates cache expiration by manipulating the mock

      // Login as admin
      console.log('Logging in as admin');
      await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      // Make initial request to populate cache
      console.log('Making initial request to populate cache');
      await request.get('/users', {});
      expect(cacheManager.set).toHaveBeenCalled();
      console.log('Cache populated successfully');
      cacheManager.set.mockClear();

      // First simulate a cache hit
      console.log('Setting up cache hit simulation for second request');
      cacheManager.get.mockImplementationOnce((key) => {
        if (key.includes('users')) {
          console.log('Simulating cache hit for users');
          return { items: fixtures.users, total: fixtures.users.length };
        }
        return null;
      });

      // Make second request that hits the cache
      console.log('Making second request (should hit cache)');
      await request.get('/users', {});
      console.log('Second request served from cache');

      // Now simulate cache miss (expired TTL)
      console.log('Setting up cache miss simulation for third request');
      cacheManager.get.mockImplementationOnce(() => {
        console.log('Simulating cache miss (expired TTL)');
        return null;
      });

      // Make third request that should miss cache and repopulate
      console.log('Making third request (should miss cache)');
      await request.get('/users', {});

      // Verify cache was set again
      console.log('Verifying cache was repopulated');
      expect(cacheManager.set).toHaveBeenCalled();
      console.log('Confirmed cache was repopulated after expiration');
    });
  });
});
