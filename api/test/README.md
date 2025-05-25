# Test System Documentation

This document describes the test system architecture and how to use it effectively.

## Key Features

- **Isolated Test Contexts**: Each test suite runs in its own isolated database schema
- **Parallel Test Execution**: Tests can run in parallel without interfering with each other
- **Dynamic Table Management**: Tables are truncated dynamically based on entity metadata
- **Resource Cleanup**: Proper cleanup of resources after tests complete
- **Docker Support**: Tests can run in Docker containers

## Running Tests

### Standard Test Run

```bash
npm run test:e2e
```

### Parallel Test Run

```bash
npm run test:parallel
```

### Running Tests in Docker

```bash
npm run test:docker
```

### Clean Docker Environment and Run Tests

```bash
npm run test:docker:clean
```

## Test Architecture

The test system uses a context-based approach where each test suite gets its own:

1. Isolated database schema
2. NestJS application instance
3. HTTP server on a unique port
4. Redis cache mock

This ensures that tests can run in parallel without interfering with each other.

## Writing Tests

Here's an example of how to write a test:

```typescript
import {
  createTestContext,
  setupTestApp,
  teardownTestApp,
  resetTestDatabase,
} from '../setup-tests';
import { TestRequest } from '../helpers/request.helper';
import { DatabaseTestHelper } from '../helpers/database.helper';
import { TestContext } from '../test-context';

describe('My Feature (e2e)', () => {
  let context: TestContext;
  let dbHelper: DatabaseTestHelper;
  let request: TestRequest;

  // Set up test context
  beforeAll(async () => {
    context = createTestContext();
    await setupTestApp(context);

    dbHelper = new DatabaseTestHelper(context);
    await dbHelper.init();

    request = new TestRequest(context);
  });

  // Clean up after tests
  afterAll(async () => {
    await teardownTestApp(context);
  });

  // Reset database before each test
  beforeEach(async () => {
    await resetTestDatabase(context);
  });

  it('should do something', async () => {
    // Your test code here
    const response = await request.get('/some-endpoint');
    expect(response.statusCode).toBe(200);
  });
});
```

## Best Practices

1. Always create a new context for each test suite
2. Reset the database before each test
3. Clean up resources after all tests
4. Use the provided helpers for database operations and HTTP requests
5. Avoid global state
