/**
 * Advanced cache manager mock that prevents Redis socket errors
 */
export const createCacheManagerMock = () => {
  const store = new Map<string, any>();
  let connectionStatus = 'connected'; // 'connected' | 'disconnecting' | 'disconnected'

  // Create a safe Redis client mock that won't throw socket errors
  const redisMock = {
    on: jest.fn(),
    off: jest.fn(),
    connect: jest.fn().mockResolvedValue('OK'),
    quit: jest.fn().mockImplementation(async () => {
      connectionStatus = 'disconnecting';
      return new Promise((resolve) => {
        setTimeout(() => {
          connectionStatus = 'disconnected';
          resolve('OK');
        }, 10);
      });
    }),
    disconnect: jest.fn().mockImplementation(async () => {
      connectionStatus = 'disconnected';
      return true;
    }),
    end: jest.fn().mockImplementation((flush) => {
      connectionStatus = 'disconnected';
      if (flush) store.clear();
      return true;
    }),
    // Add additional Redis client methods that might be used
    ping: jest.fn().mockResolvedValue('PONG'),
    get: jest.fn().mockImplementation(async (key) => store.get(key)),
    set: jest.fn().mockImplementation(async (key, value) => {
      store.set(key, value);
      return 'OK';
    }),
    del: jest.fn().mockImplementation(async (key) => {
      return store.delete(key) ? 1 : 0;
    }),
    // Add error handling
    listeners: jest.fn().mockReturnValue([]),
    removeAllListeners: jest.fn(),
  };

  // Ensure Redis client doesn't throw socket errors
  Object.defineProperty(redisMock, 'status', {
    get: () => connectionStatus,
  });

  return {
    get: jest.fn(async (key) => store.get(key)),
    set: jest.fn(async (key, value, ttl) => {
      store.set(key, value);
      return value;
    }),
    del: jest.fn(async (key) => store.delete(key)),
    reset: jest.fn(async () => {
      store.clear();
      return true;
    }),
    store: {
      keys: jest.fn(async () => Array.from(store.keys())),
      get client() {
        return redisMock;
      },
    },
    // Method to reset the mock
    _reset: () => {
      store.clear();
      connectionStatus = 'connected';
      jest.clearAllMocks();
    },
    // For testing status
    _getConnectionStatus: () => connectionStatus,
  };
};

// Create a singleton instance
export const cacheManagerMockInstance = createCacheManagerMock();

// Export both the factory and the singleton
export default createCacheManagerMock;
