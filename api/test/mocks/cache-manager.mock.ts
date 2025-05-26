/**
 * Simplified cache manager mock
 */
export const createCacheManagerMock = () => {
  const store = new Map<string, any>();

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
    },
    // Method to reset the mock
    _reset: () => {
      store.clear();
      jest.clearAllMocks();
    },
  };
};

// Create a singleton instance
export const cacheManagerMockInstance = createCacheManagerMock();

// Export both the factory and the singleton
export default createCacheManagerMock;
