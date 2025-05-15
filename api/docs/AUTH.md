# Authentication Module

The authentication module provides a complete JWT-based authentication system with refresh tokens stored in Redis.

## Table of Contents

- [Authentication Module](#authentication-module)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Module Structure](#module-structure)
  - [Authentication Flow](#authentication-flow)
  - [API Endpoints](#api-endpoints)
    - [Login](#login)
    - [Register](#register)
    - [Logout](#logout)
    - [Refresh Token](#refresh-token)
  - [JWT Token Structure](#jwt-token-structure)
    - [Access Token Payload](#access-token-payload)
    - [Refresh Token Payload](#refresh-token-payload)
  - [Refresh Token Mechanism](#refresh-token-mechanism)
  - [Security Considerations](#security-considerations)
  - [Integration Guide](#integration-guide)
    - [Frontend Integration](#frontend-integration)
    - [Securing API Endpoints](#securing-api-endpoints)
    - [Accessing User Data](#accessing-user-data)

## Overview

The authentication system uses:

- JWT tokens for access control (Access Tokens)
- Redis for storing refresh tokens
- Passport.js for authentication strategies
- HTTP-only cookies for secure token storage
- Multiple refresh tokens per user for multi-device support

## Module Structure

The Authentication module follows the standard NestJS module structure and is organized as follows:

```
src/
└── modules/
    └── auth/
        ├── controllers/           # HTTP request handlers
        │   └── auth.controller.ts
        ├── dto/                   # Data Transfer Objects
        │   ├── login.dto.ts
        │   ├── register.dto.ts
        │   ├── access-token-payload.dto.ts
        │   ├── refresh-token-payload.dto.ts
        │   └── response-login.dto.ts
        ├── guards/                # Authentication guards
        │   ├── jwt-auth.guard.ts
        │   └── local-auth.guard.ts
        ├── strategies/            # Passport strategies
        │   ├── jwt.strategy.ts
        │   └── local.strategy.ts
        ├── services/              # Business logic
        │   └── auth.service.ts
        └── auth.module.ts         # Module definition
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant Redis
    
    Client->>Server: POST /auth/login (credentials)
    Server->>Server: Validate credentials
    alt Invalid credentials
        Server-->>Client: 401 Unauthorized
    else Valid credentials
        Server->>Redis: Generate & Store refresh token
        Note over Server,Redis: Store RT with user data, expiry time
        Server->>Server: Generate access token (JWT)
        Server->>Client: Return JWT & Set HTTP-only cookie
    end
    
    Client->>Server: Request with valid JWT
    Server->>Server: Validate JWT signature & expiry
    Server->>Client: Return protected resource
    
    Client->>Server: Request with expired JWT
    Server->>Server: Detect expired JWT
    Server->>Redis: Extract refresh_token_id & check in Redis
    alt Valid refresh token found
        Redis-->>Server: Return refresh token data
        Server->>Server: Generate new access token
        Server->>Redis: Update refresh token timestamp (optional)
        Server->>Client: Return new JWT & response
    else No valid refresh token
        Redis-->>Server: Token not found or expired
        Server->>Client: 401 Unauthorized
    end
    
    Client->>Server: Login from new device
    Server->>Redis: Add new refresh token to user's token array
    Server->>Client: Return new JWT for new device
    
    Client->>Server: POST /auth/logout (with token)
    Server->>Redis: Remove specific refresh token
    Server->>Client: Clear cookie & confirm logout
    
    Client->>Server: POST /auth/logout-all (with token)
    Server->>Redis: Remove all refresh tokens for user
    Server->>Client: Clear cookie & confirm logout from all devices
```

## API Endpoints

### Login

```
POST /api/auth/login
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": ["User login has been successfully"],
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "cookie_expires_in": 18000
  }
}
```

The server also sets an HTTP-only cookie named `access_token` with the JWT.

### Register

```
POST /api/auth/register
```

**Request Body:**

```json
{
  "email": "newuser@example.com",
  "password": "securepassword",
  "firstName": "First",
  "lastName": "Last"
}
```

**Response:**

```json
{
  "success": true,
  "statusCode": 201,
  "message": ["User registered successfully"],
  "data": {
    "id": "uuid-here",
    "email": "newuser@example.com",
    "firstName": "First",
    "lastName": "Last",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Logout

```
POST /api/auth/logout
```

**Request:**
The JWT token is extracted from the cookie or Authorization header.

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": ["Logout successful"]
}
```

The server also clears the `access_token` cookie and removes the specific refresh token from Redis.

### Refresh Token

The token refresh happens automatically when an expired JWT is detected. There's no need for a separate endpoint call from the client.

## JWT Token Structure

### Access Token Payload

```typescript
{
  "user_id": "uuid-of-user",
  "refresh_token_id": "uuid-of-refresh-token",
  "iat": 1618939806, // Issued at
  "exp": 1618943406  // Expiration
}
```

### Refresh Token Payload

```typescript
{
  "id": "uuid-of-token",
  "userId": "uuid-of-user",
  "user": {
    "id": "uuid-of-user",
    "email": "user@example.com",
    "roles": [
      {
        "id": 1,
        "name": "user"
      }
    ]
  },
  "createdAt": "2023-01-01T00:00:00.000Z",
  "expiresAt": "2023-01-02T00:00:00.000Z"
}
```

## Refresh Token Mechanism

Refresh tokens are stored in Redis with a structure that allows multiple tokens per user:

```typescript
// Redis key: `refresh_tokens_by_user_id_${userId}`
{
  "refreshTokens": [
    {
      "id": "uuid-of-token-1",
      "userId": "uuid-of-user",
      "user": {
        // User data including roles
      },
      "createdAt": "2023-01-01T00:00:00.000Z",
      "expiresAt": "2023-01-06T00:00:00.000Z"
    },
    {
      "id": "uuid-of-token-2",
      "userId": "uuid-of-user",
      "user": {
        // User data including roles
      },
      "createdAt": "2023-01-02T00:00:00.000Z",
      "expiresAt": "2023-01-07T00:00:00.000Z"
    }
  ]
}
```

When an access token expires:

1. The system extracts the refresh token ID from the expired JWT
2. Checks Redis for a valid refresh token with that ID
3. If found and not expired, issues a new JWT with the same refresh token ID
4. Sets the new JWT as a cookie

This happens automatically via the `JwtAuthGuard` and doesn't require client-side action.

The implementation in `jwt-auth.guard.ts`:

```typescript
private handleToken = async (
  request: FastifyRequest,
  response: FastifyReply,
): Promise<void> => {
  const token = request.cookies?.['access_token'];
  if (token) {
    try {
      this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch (error) {
      await this.reSignToken(
        await this.jwtService.verifyAsync(token, {
          ignoreExpiration: true,
          secret: this.configService.get<string>('JWT_SECRET'),
        }),
        request,
        response,
      );
    }
  }
};
```

## Security Considerations

- JWT tokens are short-lived (typically 15 minutes)
- Refresh tokens have a longer lifespan (typically 5 days)
- All tokens are invalidated on password change
- Tokens are stored as HTTP-only cookies to prevent XSS attacks
- Multiple refresh tokens are allowed per user for multiple devices
- CSRF protection is implemented for cookie-based authentication
- Rate limiting is applied to authentication endpoints to prevent brute force attacks
- Refresh tokens are stored with user context to enable quick revocation
- Each login generates a unique refresh token, allowing for device-specific management

## Integration Guide

### Frontend Integration

1. Make a POST request to `/api/auth/login` with credentials
2. The JWT will be automatically stored as a cookie
3. For subsequent requests, the cookie will be sent automatically
4. No additional configuration is needed for token renewal

Example using fetch API:

```javascript
// Login
async function login(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include', // Important: this sends cookies with the request
  });
  
  return await response.json();
}

// Making authenticated requests
async function fetchProtectedData() {
  const response = await fetch('/api/protected-endpoint', {
    credentials: 'include', // Important: this sends cookies with the request
  });
  
  return await response.json();
}

// Logout
async function logout() {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
  
  return await response.json();
}
```

### Securing API Endpoints

Use the `JwtAuthGuard` to protect your controllers or routes:

```typescript
@Controller('example')
@UseGuards(JwtAuthGuard)
export class ExampleController {
  // Protected routes
}
```

Or for specific endpoints:

```typescript
@Get('protected')
@UseGuards(JwtAuthGuard)
getProtectedData() {
  // Protected route
}
```

### Accessing User Data

The authenticated user is available in the request object:

```typescript
@Get('profile')
@UseGuards(JwtAuthGuard)
getProfile(@Request() req) {
  return req.user; // Contains the authenticated user data
}
```

For more complex authorization, see the [CASL Authorization](./CASL.md) documentation.
