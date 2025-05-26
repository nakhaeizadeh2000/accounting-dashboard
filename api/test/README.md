# Test System Documentation

This document describes the refactored test system architecture and how to use it effectively.

## Key Features

- **Isolated Test Contexts**: Each test suite runs in its own isolated database schema
- **Parallel Test Execution**: Tests can run in parallel without interfering with each other
- **Dynamic Port Assignment**: Each test app gets a unique port to avoid conflicts
- **Resource Cleanup**: Proper cleanup of resources after tests complete
- **Simplified Mocks**: Streamlined mocking system for external dependencies

## Running Tests

### Standard Test Run

```bash
npm run test:e2e
```

### Parallel Test Run

```bash
npm run test:parallel
```

## Test Architecture

The test system uses a context-based approach where each test suite gets its own:

1. **TestContext**: A class that encapsulates all test resources
2. **Isolated Database Schema**: Each test suite gets its own PostgreSQL schema
3. **NestJS Application**: Each test suite gets its own NestJS app instance
4. **HTTP Server**: Each test app runs on a unique port
5. **Mocked Redis Cache**: Redis operations are mocked for testing

## Writing Tests

Here's an example of how to write a test:

```typescript
import { TestContext } from '../test-context';

describe('My Feature (e2e)', () => {
  // Create a test context for this test suite
  const testContext = new TestContext();

  // Setup and teardown
  beforeAll(async () => {
    await testContext.initialize();
  }, 30000);

  afterAll(async () => {
    await testContext.cleanup();
  }, 10000);

  // Reset between tests
  beforeEach(async () => {
    await testContext.reset();
  });

  it('should do something', async () => {
    // Your test code here using testContext.request
    const response = await testContext.request.get('/some-endpoint');
    expect(response.statusCode).toBe(200);
  });
});
```

## Best Practices

1. Always create a new TestContext for each test suite
2. Reset the database before each test with testContext.reset()
3. Clean up resources after all tests with testContext.cleanup()
4. Use the provided helpers for
