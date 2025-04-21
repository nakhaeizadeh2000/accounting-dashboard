# Error Handling

This document describes the error handling strategy used throughout the API, providing developers with clear guidance on how errors are managed, formatted, and returned to clients.

## Table of Contents

- [Error Handling](#error-handling)
  - [Table of Contents](#table-of-contents)
  - [Error Handling Philosophy](#error-handling-philosophy)
  - [Error Response Format](#error-response-format)
    - [Standard Error Response](#standard-error-response)
    - [Validation Error Response](#validation-error-response)
  - [Error Types](#error-types)
    - [Built-in Exceptions](#built-in-exceptions)
    - [Custom Exceptions](#custom-exceptions)
  - [Global Exception Filter](#global-exception-filter)
  - [Validation Pipeline](#validation-pipeline)
  - [Error Handling Strategy](#error-handling-strategy)
    - [Controller Layer](#controller-layer)
    - [Service Layer](#service-layer)
    - [Database Layer](#database-layer)
    - [Third-party Services](#third-party-services)
  - [Custom Validation Decorators](#custom-validation-decorators)
  - [Best Practices](#best-practices)
  - [Client Error Handling](#client-error-handling)
  - [Error Codes and Messages](#error-codes-and-messages)
  - [Testing Error Scenarios](#testing-error-scenarios)

## Error Handling Philosophy

The API follows these key principles for error handling:

1. **Predictable Format**: All errors follow a consistent response format
2. **Informative Messages**: Error responses provide clear guidance on what went wrong
3. **Appropriate Status Codes**: HTTP status codes accurately reflect the error type
4. **Validation Focus**: Special attention to input validation with detailed feedback
5. **Security Aware**: Avoids exposing sensitive internal details in error messages

These principles ensure that clients can reliably handle errors and users receive appropriate guidance when issues occur.

## Error Response Format

### Standard Error Response

All error responses follow this structure:

```json
{
  "success": false,
  "statusCode": 400,
  "message": ["خطایی رخ داده است. به پشتیبانی اطلاع دهید!"]
}
```

Key properties:

- `success`: Always `false` for error responses
- `statusCode`: HTTP status code indicating the error type
- `message`: Array of error messages describing what went wrong

### Validation Error Response

Validation errors provide additional field-specific details:

```json
{
  "success": false,
  "statusCode": 400,
  "message": ["لطفا اطلاعات مورد نیاز را یه شکل صحیح وارد نمایید"],
  "validationErrors": {
    "email": ["must be a valid email"],
    "password": ["must be at least 8 characters"]
  }
}
```

Key properties:

- `validationErrors`: Object with field names as keys and array of error messages as values

## Error Types

### Built-in Exceptions

The API uses NestJS's built-in HTTP exceptions:

| Exception                      | HTTP Status | Use Case                                                    |
| ------------------------------ | ----------- | ----------------------------------------------------------- |
| `BadRequestException`          | 400         | Invalid input that isn't a validation error                 |
| `UnauthorizedException`        | 401         | Missing or invalid authentication                           |
| `ForbiddenException`           | 403         | Authentication provided but insufficient permissions        |
| `NotFoundException`            | 404         | Requested resource doesn't exist                            |
| `ConflictException`            | 409         | Request conflicts with server state (e.g., duplicate email) |
| `InternalServerErrorException` | 500         | Unexpected server errors                                    |

### Custom Exceptions

The API extends the built-in exceptions with custom ones:

**ValidationException**

```typescript
export class ValidationException extends BadRequestException {
  /**
   * @param messages Array of strings in format: ['fieldName message text errors']
   * Field name should have a space after itself (between itself and error messages)
   */
  constructor(messages: string[]) {
    super({ statusCode: 400, message: messages });
  }
}
```

This provides a specialized way to handle validation errors with field-specific messages.

## Global Exception Filter

The API implements a global exception filter to ensure consistent error formatting:

```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const status = exception.getStatus();

    let mappedResponse: ResponseData<never> = {
      statusCode: status,
      success: false,
      message: Array.isArray(exception.message)
        ? exception.message
        : [exception.message],
    };

    response.status(status).send(mappedResponse);
  }
}
```

This filter:

1. Catches all HTTP exceptions
2. Formats them according to the standard error format
3. Sets the appropriate HTTP status code
4. Returns the formatted response to the client

## Validation Pipeline

The API uses a global validation pipe for all input validation:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
);
```

Key features:

- `transform: true`: Automatically converts input data to DTO instances
- `whitelist: true`: Strips properties not defined in the DTO
- `forbidNonWhitelisted: true`: Throws an error if non-whitelisted properties are present

This ensures all input is properly validated and transformed before reaching the controllers.

## Error Handling Strategy

### Controller Layer

Controllers focus on HTTP-specific error handling:

```typescript
@Controller('users')
export class UsersController {
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.usersService.create(createUserDto);
    } catch (error) {
      if (error instanceof ConflictException) {
        // Re-throw HTTP exceptions directly
        throw error;
      }
      // Log and convert unknown errors to InternalServerErrorException
      this.logger.error(`Error creating user: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create user');
    }
  }
}
```

Best practices:

- Let validation pipe handle input validation
- Re-throw HTTP exceptions as-is
- Convert non-HTTP errors to appropriate HTTP exceptions
- Use detailed error messages without exposing sensitive information
- Log detailed error information for debugging

### Service Layer

Services handle business logic errors and data access errors:

```typescript
@Injectable()
export class UsersService {
  async create(createUserDto: CreateUserDto): Promise<ResponseUserDto> {
    try {
      const existingUser = await this.usersRepository.findOneBy({
        email: createUserDto.email,
      });

      if (existingUser) {
        throw new ConflictException('ایمیل مورد نظر قبلا استفاده شده است');
      }

      // Create user logic...
    } catch (error) {
      if (error instanceof HttpException) {
        // Re-throw HTTP exceptions
        throw error;
      }

      if (error.code === '23505') {
        // PostgreSQL unique violation
        throw new ConflictException('ایمیل مورد نظر قبلا استفاده شده است');
      }

      // Log and re-throw unknown errors
      this.logger.error(`Service error: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

Best practices:

- Convert database-specific errors to domain-appropriate exceptions
- Use specific HTTP exceptions for different error types
- Add context to errors for better debugging
- Handle expected errors explicitly

### Database Layer

Handle database errors consistently:

```typescript
// TypeORM-specific error handling
try {
  await this.repository.save(entity);
} catch (error) {
  if (error.code === '23505') {
    // PostgreSQL unique violation
    throw new ConflictException('Duplicate entry');
  }
  if (error.code === '23503') {
    // Foreign key violation
    throw new BadRequestException('Referenced entity does not exist');
  }
  throw error;
}
```

Common database error codes (PostgreSQL):

- `23505`: Unique constraint violation
- `23503`: Foreign key constraint violation
- `23502`: Not null constraint violation
- `42P01`: Undefined table
- `42703`: Undefined column

### Third-party Services

When integrating with external services:

```typescript
async uploadToMinio(file: Buffer, filename: string): Promise<string> {
  try {
    return await this.minioClient.putObject('bucket', filename, file);
  } catch (error) {
    if (error.code === 'NoSuchBucket') {
      throw new BadRequestException('Storage bucket does not exist');
    }
    this.logger.error(`MinIO error: ${error.message}`, error.stack);
    throw new InternalServerErrorException('File storage service unavailable');
  }
}
```

Best practices:

- Handle service-specific errors with appropriate HTTP exceptions
- Don't expose third-party service details in error messages
- Include retry logic for transient errors when appropriate
- Log detailed error information for debugging

## Custom Validation Decorators

The API includes custom validation decorators for common patterns:

**Match Decorator**

```typescript
export function Match(property: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'match',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return (
            value === relatedValue ||
            (value === undefined && relatedValue === undefined)
          );
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return `${propertyName} must match ${relatedPropertyName}`;
        },
      },
    });
  };
}
```

**NotMatch Decorator**

```typescript
export function NotMatch(
  property: string,
  validationOptions?: ValidationOptions,
) {
  // Similar implementation to Match decorator, but with inverse logic
}
```

**AllowIfPropertyExists Decorator**

```typescript
export function AllowIfPropertyExists(
  property: string,
  validationOptions?: ValidationOptions,
) {
  // Validates only if the related property exists
}
```

These custom decorators enable complex validation scenarios while maintaining consistent error messages.

## Best Practices

1. **Consistent Error Format**: Always use the standard error format.

2. **Descriptive Messages**: Error messages should clearly indicate:

   - What went wrong
   - Why it happened
   - How to fix it (when possible)

3. **Field-Prefixed Validation Errors**: Format validation error messages with field name prefix and space:

   ```typescript
   @IsEmail({}, { message: 'email ایمیل را به شکل صحیح وارد کنید' })
   ```

4. **Appropriate Status Codes**: Use the correct HTTP status code for each error type.

5. **Error Isolation**: Handle errors at the appropriate layer:

   - Validation errors: Use DTOs and validation pipe
   - Business logic errors: Handle in service layer
   - HTTP-specific errors: Handle in controller layer

6. **Security Considerations**:

   - Never expose stack traces to clients
   - Don't include sensitive information in error messages
   - Avoid exposing internal implementation details

7. **Comprehensive Logging**: Log detailed error information for debugging while keeping client responses secure and user-friendly.

## Client Error Handling

Frontend applications should handle API errors consistently:

```javascript
async function callApi(url, method, data) {
  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    });

    const result = await response.json();

    if (!result.success) {
      // Handle different error types
      if (result.validationErrors) {
        // Process validation errors
        return { success: false, validationErrors: result.validationErrors };
      } else {
        // Handle general errors
        return { success: false, message: result.message[0] };
      }
    }

    return result;
  } catch (error) {
    // Handle network errors
    return { success: false, message: 'Network error occurred' };
  }
}
```

## Error Codes and Messages

Common error messages with translations:

| Error Type               | English                                      | Persian                                             |
| ------------------------ | -------------------------------------------- | --------------------------------------------------- |
| Validation Error         | "Please provide valid information"           | "لطفا اطلاعات مورد نیاز را یه شکل صحیح وارد نمایید" |
| Authentication Required  | "Authentication required"                    | "لطفا ابتدا اهراز هویت خود را انجام دهید"           |
| Insufficient Permissions | "Insufficient permissions"                   | "شما دسترسی لازم را ندارید"                         |
| Resource Not Found       | "Resource not found"                         | "منبع مورد نظر یافت نشد"                            |
| Duplicate Entry          | "This entry already exists"                  | "این مورد قبلا ثبت شده است"                         |
| Server Error             | "An error occurred. Please contact support." | "خطایی رخ داده است. به پشتیبانی اطلاع دهید!"        |

## Testing Error Scenarios

Write tests for error scenarios:

```typescript
describe('UsersController', () => {
  it('should return 400 for invalid input', async () => {
    const createUserDto = { email: 'invalid-email' };

    const response = await request(app.getHttpServer())
      .post('/users')
      .send(createUserDto)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.validationErrors).toBeDefined();
    expect(response.body.validationErrors.email).toBeDefined();
  });

  it('should return 409 for duplicate email', async () => {
    // Test conflict error scenario
  });

  it('should return 404 for non-existent user', async () => {
    // Test not found error scenario
  });
});
```

Make sure to test:

- Validation errors for each endpoint
- Business logic errors
- Authentication and authorization errors
- Resource not found scenarios
- Conflict scenarios
- Error format consistency
