// This file overrides the real Redis module during tests

// Create a mock Redis client
const createMockRedisClient = () => {
  const store = new Map();

  return {
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    quit: jest.fn().mockResolvedValue('OK'),
    on: jest.fn(),
    off: jest.fn(),
    get: jest.fn(async (key) => store.get(key)),
    set: jest.fn(async (key, value) => {
      store.set(key, value);
      return 'OK';
    }),
    del: jest.fn(async (key) => {
      return store.delete(key) ? 1 : 0;
    }),
    flushDb: jest.fn().mockResolvedValue('OK'),
    flushAll: jest.fn().mockResolvedValue('OK'),
    ping: jest.fn().mockResolvedValue('PONG'),
    // Add any other Redis methods you're using
  };
};

// Export the mock
module.exports = {
  createClient: jest.fn(() => createMockRedisClient()),
};
