# Response Format

This document outlines the standardized response format used across the entire API, ensuring consistency and predictability for client applications.

## Table of Contents

- [Response Format](#response-format)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Standard Response Structure](#standard-response-structure)
    - [Success Response](#success-response)
    - [Error Response](#error-response)
    - [Validation Error Response](#validation-error-response)
  - [HTTP Status Codes](#http-status-codes)
  - [Implementation Details](#implementation-details)
    - [Response Interceptor](#response-interceptor)
    - [DTOs and Serialization](#dtos-and-serialization)
    - [Handling Different Response Types](#handling-different-response-types)
  - [Example Usage](#example-usage)
    - [Controller Method](#controller-method)
    - [Client Integration](#client-integration)
  - [Special Response Types](#special-response-types)
    - [Paginated Responses](#paginated-responses)
    - [Streaming Responses](#streaming-responses)
    - [Empty Responses](#empty-responses)
  - [Testing Response Format](#testing-response-format)
  - [Best Practices](#best-practices)

## Overview

The API follows a consistent response format for all endpoints, making it easier for clients to handle responses predictably. This format is applied automatically through a global response interceptor, ensuring uniformity throughout the API.

The standardized format:

- Includes a success flag for quick status checking
- Provides consistent error handling
- Structures validation errors for easy client handling
- Is automatically applied to all responses

## Standard Response Structure

All API responses follow a common structure with slight variations depending on whether the operation was successful or encountered an error.

### Success Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": ["عملیات با موفقیت انجام شد"],
  "data": {
    // Response data specific to the endpoint
  }
}
```

Key properties:

- `success`: Always `true` for successful operations
- `statusCode`: HTTP status code (typically 200 for GET, 201 for POST, etc.)
- `message`: Array of success messages (usually a single message)
- `data`: The actual response data, varies by endpoint

### Error Response

```json
{
  "success": false,
  "statusCode": 400,
  "message": ["خطایی رخ داده است. به پشتیبانی اطلاع دهید!"]
}
```

Key properties:

- `success`: Always `false` for error responses
- `statusCode`: HTTP status code indicating the error type (400, 401, 403, 404, 500, etc.)
- `message`: Array of error messages describing what went wrong

### Validation Error Response

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

- `success`: Always `false` for validation errors
- `statusCode`: Typically 400 (Bad Request)
- `message`: Generic message about validation failure
- `validationErrors`: Object with field names as keys and array of error messages as values

## HTTP Status Codes

The API uses standard HTTP status codes consistently:

| Status Code | Description           | Typical Use                                          |
| ----------- | --------------------- | ---------------------------------------------------- |
| 200         | OK                    | Successful GET, PUT, or DELETE                       |
| 201         | Created               | Successful resource creation (POST)                  |
| 400         | Bad Request           | Input validation errors                              |
| 401         | Unauthorized          | Authentication required but not provided             |
| 403         | Forbidden             | Authentication provided but insufficient permissions |
| 404         | Not Found             | Resource not found                                   |
| 408         | Request Timeout       | Operation timed out                                  |
| 500         | Internal Server Error | Unexpected server errors                             |

## Implementation Details

### Response Interceptor

The standard response format is implemented using NestJS interceptors:

```typescript
@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ResponseData<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseData<T>> {
    const response = context.switchToHttp().getResponse<FastifyReply>();

    return next.handle().pipe(
      map((data) => {
        // Handle successful responses
        return {
          success: true,
          statusCode: response.statusCode,
          message: ['عملیات با موفقیت انجام شد'],
          data,
        };
      }),
      catchError((error) => {
        // Handle errors
        const statusCode = error.status || 500;
        let responseData: ResponseData<null> = {
          success: false,
          statusCode,
        };

        // Handle validation errors
        if (error instanceof BadRequestException) {
          // Format validation errors
          // ...
          responseData.message = [
            'لطفا اطلاعات مورد نیاز را یه شکل صحیح وارد نمایید',
          ];
        } else {
          // Handle other errors
          responseData.message = error.message
            ? [error.message]
            : ['خطایی رخ داده است. به پشتیبانی اطلاع دهید!'];
        }

        // Set the correct HTTP status code
        response.status(statusCode);

        return of(responseData);
      }),
    );
  }
}
```

This interceptor:

1. Transforms successful responses to the standard format
2. Handles errors and formats them consistently
3. Processes validation errors into a structured format
4. Sets the appropriate HTTP status code

### DTOs and Serialization

The response format works in conjunction with Data Transfer Objects (DTOs) and class-transformer:

```typescript
export class ResponseUserDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  email: string;

  // Other fields...
}
```

The system uses:

- `@Expose()` decorator to include fields in responses
- `@Exclude()` decorator to omit sensitive fields
- `plainToInstance()` for transforming entities to DTOs

```typescript
return plainToInstance(ResponseUserDto, user, {
  excludeExtraneousValues: true,
});
```

### Handling Different Response Types

The response interceptor handles different types of responses automatically:

1. **Simple data**: Wrapped in the success response format
2. **Array data**: Wrapped in the success response format
3. **Errors**: Transformed into the error response format
4. **Validation errors**: Processed into a structured validation error format

## Example Usage

### Controller Method

```typescript
@Get(':id')
async findOne(@Param('id') id: string) {
  const user = await this.usersService.findOne(id);
  // No need to manually structure the response
  // The interceptor will format it automatically
  return user;
}
```

### Client Integration

Frontend code to handle the standardized responses:

```javascript
async function fetchUser(id) {
  try {
    const response = await fetch(`/api/users/${id}`);
    const result = await response.json();

    if (result.success) {
      // Handle success case
      return result.data;
    } else {
      // Handle error case
      if (result.validationErrors) {
        // Process validation errors
        for (const [field, errors] of Object.entries(result.validationErrors)) {
          showFieldError(field, errors[0]);
        }
      } else {
        // Show general error message
        showErrorMessage(result.message[0]);
      }
      return null;
    }
  } catch (error) {
    // Handle network errors
    showErrorMessage('Network error occurred');
    return null;
  }
}
```

## Special Response Types

### Paginated Responses

Paginated data follows this structure:

```json
{
  "success": true,
  "statusCode": 200,
  "message": ["عملیات با موفقیت انجام شد"],
  "data": {
    "items": [
      // Array of items
    ],
    "total": 100,
    "currentPage": 1,
    "totalPages": 10,
    "pageSize": 10
  }
}
```

The pagination utility function:

```typescript
export function paginateResponse<T>(
  items: T[],
  total: number,
  currentPage: number,
  limit: number,
): PaginatedResponse<T> {
  const pageSize = items.length;
  const totalPages = Math.ceil(total / limit);

  return {
    items,
    total,
    currentPage,
    totalPages,
    pageSize,
  };
}
```

### Streaming Responses

For streaming responses (like file downloads), the standard format is bypassed:

```typescript
@Get('download/:id')
async downloadFile(@Param('id') id: string, @Res() response: FastifyReply) {
  const fileStream = await this.filesService.getFileStream(id);

  response.header('Content-Type', 'application/octet-stream');
  response.header('Content-Disposition', 'attachment; filename="file.pdf"');

  return response.send(fileStream);
}
```

The interceptor detects the use of `@Res()` and doesn't wrap the response.

### Empty Responses

For DELETE operations or actions that don't return data:

```json
{
  "success": true,
  "statusCode": 200,
  "message": ["عملیات با موفقیت انجام شد"]
}
```

## Testing Response Format

When writing tests, verify that responses adhere to the standard format:

```typescript
describe('UsersController', () => {
  it('should return a user with standard format', async () => {
    const result = await controller.findOne('1');

    expect(result.success).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.message).toEqual(['عملیات با موفقیت انجام شد']);
    expect(result.data).toBeDefined();
    expect(result.data.id).toBe('1');
  });

  it('should return formatted validation errors', async () => {
    // Test validation error format
  });
});
```

## Best Practices

1. **Let the interceptor do its work**: Return raw data from controllers and services without manually formatting it.

2. **Use Proper DTOs**: Define clear DTOs with `@Expose()` and `@Exclude()` decorators to control what fields are included in responses.

3. **Handle Validation Properly**: Use class-validator decorators and custom validation messages that follow the field-prefix convention for proper error formatting.

4. **Consistent Error Messages**: Use clear, user-friendly error messages that explain what went wrong and how to fix it.

5. **Document Responses**: Use Swagger decorators to document the expected response format for each endpoint.

6. **Don't Override the Format**: Avoid manually structuring responses to maintain consistency.

7. **Test Both Success and Error Cases**: Ensure tests cover both successful operations and various error scenarios.

8. **Use Field-Specific Error Messages**: For validation errors, prefix the field name to the error message:
   ```typescript
   @IsEmail({}, { message: 'email ایمیل را به شکل صحیح وارد کنید' })
   ```
   This ensures proper error categorization in responses.
