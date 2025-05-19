export const createCacheManagerMock = () => {
  const store = new Map<string, any>();

  return {
    get: jest.fn(async (key: string) => store.get(key)),
    set: jest.fn(async (key: string, value: any, ttl?: number) => {
      store.set(key, value);
      return value;
    }),
    del: jest.fn(async (key: string) => {
      store.delete(key);
      return true;
    }),
    reset: jest.fn(async () => {
      store.clear();
      return true;
    }),
    store,
  };
};
