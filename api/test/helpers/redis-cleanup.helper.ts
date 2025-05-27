/**
 * Helper to safely handle Redis client cleanup
 * This prevents "Socket closed unexpectedly" errors during test teardown
 */
export class RedisCleanupHelper {
  /**
   * Flush the current Redis database only
   * @param redisClient The Redis client to use for flushing
   * @param explicitDbNumber Optional database number to flush (for cache-manager compatibility)
   */
  static async flushCurrentDatabase(redisClient: any, explicitDbNumber?: number): Promise<void> {
    if (!redisClient) return;

    try {
      // Check if client is available
      if (
        redisClient.status === 'end' ||
        redisClient.status === 'close' ||
        redisClient.status === 'disconnected' ||
        redisClient.isClose === true ||
        redisClient.isOpen === false
      ) {
        console.log('Redis client not available for flushing');
        return;
      }

      // Get current database info for debugging
      let currentDb = explicitDbNumber;
      if (currentDb === undefined) {
        try {
          // Try multiple ways to get the database number
          if (redisClient.options?.database !== undefined) {
            currentDb = redisClient.options.database;
          } else if (redisClient.selectedDB !== undefined) {
            currentDb = redisClient.selectedDB;
          } else {
            // Try client info command
            const clientInfo = await redisClient.clientInfo();
            const dbMatch = clientInfo.match(/db=(\d+)/);
            currentDb = dbMatch ? parseInt(dbMatch[1]) : null;
          }
        } catch {
          currentDb = null;
        }
      }

      console.log(`🗑️ Flushing Redis database: ${currentDb ?? 'current'}`);

      // If we have an explicit database number, select it first
      if (currentDb !== null && currentDb !== undefined) {
        try {
          await redisClient.select(currentDb);
          console.log(`📍 Selected Redis database: ${currentDb}`);
        } catch (error) {
          console.log(`⚠️ Could not select DB ${currentDb}:`, error.message);
        }
      }

      // Get keys count before flush for verification
      const keysBefore = await redisClient.dbSize();
      console.log(`📊 Keys before flush: ${keysBefore}`);

      // Flush only the current database
      await redisClient.flushDb();

      // Verify flush worked
      const keysAfter = await redisClient.dbSize();
      console.log(`📊 Keys after flush: ${keysAfter}`);
      console.log(`✅ Redis database ${currentDb ?? 'current'} flushed (${keysBefore} -> ${keysAfter} keys)`);
    } catch (error) {
      console.log('⚠️ Redis flush error (ignored):', error.message);
    }
  }

  /**
   * Flush all Redis databases (0-15) for complete isolation
   * @param redisClient The Redis client to use for flushing
   */
  static async flushAllDatabases(redisClient: any): Promise<void> {
    if (!redisClient) return;

    try {
      // Check if client is available
      if (
        redisClient.status === 'end' ||
        redisClient.status === 'close' ||
        redisClient.status === 'disconnected' ||
        redisClient.isClose === true ||
        redisClient.isOpen === false
      ) {
        console.log('Redis client not available for flushing');
        return;
      }

      // Flush all databases (0-15)
      for (let db = 0; db <= 15; db++) {
        try {
          await redisClient.select(db);
          await redisClient.flushDb();
        } catch (error) {
          // Ignore errors for individual databases
          console.log(`⚠️ Could not flush Redis DB ${db} (ignored):`, error.message);
        }
      }

      // Return to default database
      await redisClient.select(0);
      console.log('✅ All Redis databases flushed');
    } catch (error) {
      console.log('⚠️ Redis flush error (ignored):', error.message);
    }
  }
  /**
   * Safely disconnect a Redis client
   * @param redisClient The Redis client to disconnect
   */
  static async safeDisconnect(redisClient: any): Promise<void> {
    if (!redisClient) return;

    try {
      // Check if client is already closed/disconnected
      if (
        redisClient.status === 'end' ||
        redisClient.status === 'close' ||
        redisClient.status === 'disconnected' ||
        redisClient.isClose === true ||
        redisClient.isOpen === false
      ) {
        console.log('Redis client already closed, skipping disconnect');
        return;
      }

      // Check if the client has a quit method
      if (typeof redisClient.quit === 'function') {
        try {
          // Try to quit gracefully with a timeout
          const quitPromise = redisClient.quit().catch(() => {});
          const timeoutPromise = new Promise<void>((resolve) => {
            setTimeout(() => {
              console.log(
                'Redis quit timed out, skipping further disconnect attempts',
              );
              resolve();
            }, 300);
          });

          await Promise.race([quitPromise, timeoutPromise]);
        } catch (e) {
          console.log('Error during Redis quit (ignored):', e.message);
        }
      }
      // Don't try to disconnect if we already tried quit
      // This prevents the "client is closed" error
    } catch (error) {
      // Ignore errors during Redis cleanup
      console.log('Non-critical Redis cleanup error (ignored):', error.message);
    }
  }

  /**
   * Wrap a Redis client to make it more resilient to socket errors
   * @param redisClient The Redis client to wrap
   */
  static makeResilient(redisClient: any): any {
    if (!redisClient) return redisClient;

    // Add error handler if it doesn't have one
    if (typeof redisClient.on === 'function') {
      // Remove any existing error handlers to prevent duplicates
      if (typeof redisClient.removeAllListeners === 'function') {
        redisClient.removeAllListeners('error');
      }

      // Add our error handler
      redisClient.on('error', (err) => {
        if (
          err.message?.includes('Socket closed unexpectedly') ||
          err.message?.includes('Connection is closed') ||
          err.message?.includes('The client is closed')
        ) {
          console.log('⚠️ Redis socket error (handled):', err.message);
        } else {
          console.error('❌ Redis error:', err);
        }
      });
    }

    return redisClient;
  }

  /**
   * Test Redis connection and add some test data for verification
   * @param redisClient The Redis client to test
   * @param explicitDbNumber Optional database number to test (for cache-manager compatibility)
   */
  static async testRedisConnection(redisClient: any, explicitDbNumber?: number): Promise<void> {
    if (!redisClient) {
      console.log('❌ No Redis client provided');
      return;
    }

    try {
      console.log('🔍 Redis client type:', redisClient.constructor.name);
      console.log('🔍 Redis client properties:', Object.keys(redisClient));
      
      // Check if it's actually a Redis client or a mock
      if (redisClient.constructor.name.includes('Mock')) {
        console.log('⚠️ Using Mock Redis client - data won\'t persist');
      }

      // Select the correct database if specified
      if (explicitDbNumber !== undefined) {
        try {
          await redisClient.select(explicitDbNumber);
          console.log(`📍 Selected Redis database: ${explicitDbNumber}`);
        } catch (error) {
          console.log(`⚠️ Could not select DB ${explicitDbNumber}:`, error.message);
        }
      }

      // Set a test key
      await redisClient.set('test:flush:verification', 'test-data', 'EX', 60);
      
      // Get current database for logging
      let currentDb = explicitDbNumber ?? 'unknown';
      try {
        if (currentDb === 'unknown' && redisClient.options?.database !== undefined) {
          currentDb = redisClient.options.database;
        }
      } catch {}

      const keyCount = await redisClient.dbSize();
      console.log(`🔍 Redis DB ${currentDb} test: Added test key, total keys: ${keyCount}`);
      
      // Verify the key was actually set
      const testValue = await redisClient.get('test:flush:verification');
      console.log(`🔍 Test key value: ${testValue}`);
    } catch (error) {
      console.log('⚠️ Redis test error (ignored):', error.message);
    }
  }
}
