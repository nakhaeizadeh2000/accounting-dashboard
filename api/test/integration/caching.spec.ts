import { TestRequest } from '../helpers/request.helper';
import { DatabaseTestHelper } from '../helpers/database.helper';
import { AuthTestHelper } from '../helpers/auth-test.helper';
import { setupTestApp, teardownTestApp, getCacheManager } from '../setup-tests';
import * as fixtures from '../fixtures';

describe('Redis Caching (integration)', () => {
  let request: TestRequest;
  let dbHelper: DatabaseTestHelper;
  let authHelper: AuthTestHelper;
  let cacheManager: any;

  beforeAll(async () => {
    console.log('Setting up test environment for Redis caching tests');
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
    console.log('Cache mock functions reset');
  });

  afterEach(async () => {
    console.log('Rolling back transaction after test');
    await dbHelper.rollbackTransaction();
  });

  afterAll(async () => {
    console.log('Tearing down test environment');
    await teardownTestApp();
  });

  describe('Caching for User data', () => {
    it('should cache user data on first request and use cache on subsequent requests', async () => {
      console.log(
        'Testing: caching user data on first request and using cache subsequently',
      );

      // Login as admin
      console.log('Logging in as admin');
      await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      // First request should hit the database
      console.log('Making first request to /users (should cache data)');
      const response1 = await request.get('/users', {});
      expect(response1.status).toBe(200);
      console.log('First response received:', JSON.stringify(response1.body));

      // Check that cache.set was called
      console.log('Verifying data was cached');
      expect(cacheManager.set).toHaveBeenCalled();
      const cacheKey = cacheManager.set.mock.calls[0][0]; // Get the cache key used
      console.log(`Cache key used: ${cacheKey}`);

      // Make the same request again
      console.log('Making second request to /users (should use cache)');
      const response2 = await request.get('/users', {});
      expect(response2.status).toBe(200);
      console.log('Second response received:', JSON.stringify(response2.body));

      // Second request should get data from cache
      console.log('Verifying cache was used for second request');
      expect(cacheManager.get).toHaveBeenCalledWith(cacheKey);
      console.log('Cache hit confirmed');
    });

    it('should invalidate cache when user data is updated', async () => {
      console.log('Testing: cache invalidation when user data is updated');

      // Login as admin
      console.log('Logging in as admin');
      await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      // First get the users to get an ID
      console.log('Getting users list to find ID to update');
      const usersResponse = await request.get('/users', {});
      const userId = usersResponse.body.data.items[1].id;
      console.log(`Selected user ID for update: ${userId}`);

      // Update the user
      const updateData = {
        firstName: 'Updated',
        lastName: 'User',
      };

      console.log(`Updating user ${userId} with:`, JSON.stringify(updateData));
      const updateResponse = await request.put(
        `/users/${userId}`,
        updateData,
        {},
      );
      expect(updateResponse.status).toBe(200);
      console.log('User updated successfully');

      // Check that cache was invalidated (cache.del was called)
      console.log('Verifying cache was invalidated');
      expect(cacheManager.del).toHaveBeenCalled();
      console.log('Cache invalidation confirmed');

      // Make another get request
      console.log('Making another request to /users (should recache)');
      await request.get('/users', {});

      // Should set cache again
      console.log('Verifying data was recached');
      expect(cacheManager.set).toHaveBeenCalled();
      console.log('Recaching confirmed');
    });
  });

  describe('Caching for Authentication tokens', () => {
    it('should store refresh tokens in cache during login', async () => {
      console.log('Testing: storing refresh tokens in cache during login');

      // Clear previous calls
      cacheManager.set.mockClear();
      console.log('Cache mock reset');

      // Login
      console.log('Performing login to check token caching');
      await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });

      // Check that a refresh token was cached
      console.log('Verifying refresh token was cached');
      expect(cacheManager.set).toHaveBeenCalled();
      const cacheCall = cacheManager.set.mock.calls[0];
      expect(cacheCall[0]).toContain('refresh_tokens');

      console.log('Refresh token cache key:', cacheCall[0]);
      console.log('Token caching confirmed');
    });

    it('should remove refresh tokens from cache during logout', async () => {
      console.log('Testing: removing refresh tokens from cache during logout');

      // Login first
      console.log('Logging in first');
      await authHelper.login({
        email: fixtures.users[0].email,
        password: 'admin123',
      });
      console.log('Login successful');

      // Clear previous calls
      cacheManager.del.mockClear();
      console.log('Cache mock reset before logout');

      // Then logout
      console.log('Performing logout');
      await request.post('/auth/logout', {}, {});
      console.log('Logout completed');

      // Check that the refresh token was removed from cache
      console.log('Verifying refresh token was removed from cache');
      expect(cacheManager.del).toHaveBeenCalled();
      const cacheCall = cacheManager.del.mock.calls[0];
      expect(cacheCall[0]).toContain('refresh_tokens');

      console.log('Refresh token removal cache key:', cacheCall[0]);
      console.log('Token removal confirmed');
    });
  });
});
