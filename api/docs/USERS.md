# Users Module

The Users module provides comprehensive user management functionality, including CRUD operations, role assignment, and integration with the authentication system.

## Table of Contents

- [Users Module](#users-module)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Data Model](#data-model)
  - [API Endpoints](#api-endpoints)
    - [Create User](#create-user)
    - [Get All Users](#get-all-users)
    - [Get User by ID](#get-user-by-id)
    - [Update User](#update-user)
    - [Update User Roles](#update-user-roles)
    - [Delete User](#delete-user)
  - [DTOs and Data Validation](#dtos-and-data-validation)
    - [CreateUserDto](#createuserdto)
    - [UpdateUserDto](#updateuserdto)
    - [ResponseUserDto](#responseuserdto)
    - [ResponseUserRoleDto](#responseuserroledto)
  - [Role Management](#role-management)
  - [Password Handling](#password-handling)
  - [Caching Strategy](#caching-strategy)
  - [Security Considerations](#security-considerations)
  - [Example Requests](#example-requests)
    - [Creating a User](#creating-a-user)
    - [Getting a User](#getting-a-user)
    - [Updating a User](#updating-a-user)
    - [Assigning Roles](#assigning-roles)
  - [Integration with Other Modules](#integration-with-other-modules)

## Overview

The Users module manages all user-related operations in the system. It provides secure user creation, profile management, and role assignment while maintaining proper access control through CASL integration.

Key features:

- Complete CRUD operations for user accounts
- Secure password handling with bcrypt
- Role-based access control integration
- Proper data validation and sanitization
- Efficient caching of frequently accessed data

## Data Model

The User entity is defined as follows:

```typescript
@Entity('users')
@Expose()
export class User {
  kind: 'User';

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  isAdmin: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @OneToMany(() => Article, (article) => article.author, { cascade: true })
  articles: Article[];

  @ManyToMany(() => Role, (role) => role.users, { cascade: true, eager: true })
  roles: Role[];

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
```

## API Endpoints

### Create User

```
POST /api/users
```

Creates a new user in the system.

**Authentication**: Required  
**Authorization**: Requires `create` permission on `User` subject or `super-modify`

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "First",
  "lastName": "Last",
  "isAdmin": false
}
```

**Response**:

```json
{
  "success": true,
  "statusCode": 201,
  "message": ["User created successfully"],
  "data": {
    "id": "uuid-here",
    "email": "user@example.com",
    "firstName": "First",
    "lastName": "Last",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Get All Users

```
GET /api/users
```

Retrieves a paginated list of all users.

**Authentication**: Required  
**Authorization**: Requires `read` permission on `User` subject or `super-modify`

**Query Parameters**:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Response**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": ["Operation successful"],
  "data": {
    "items": [
      {
        "id": "uuid-here",
        "email": "user@example.com",
        "firstName": "First",
        "lastName": "Last",
        "roles": [
          {
            "id": 1,
            "name": "Editor"
          }
        ],
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z"
      }
    ],
    "total": 100,
    "currentPage": 1,
    "totalPages": 10,
    "pageSize": 10
  }
}
```

### Get User by ID

```
GET /api/users/:id
```

Retrieves a specific user by ID.

**Authentication**: Required  
**Authorization**: Requires `read` permission on `User` subject or `super-modify`

**Response**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": ["Operation successful"],
  "data": {
    "id": "uuid-here",
    "email": "user@example.com",
    "firstName": "First",
    "lastName": "Last",
    "roles": [
      {
        "id": 1,
        "name": "Editor",
        "permissions": [
          {
            "id": 1,
            "action": "read",
            "subject": "Article",
            "fields": ["title", "content", "createdAt"],
            "conditions": { "authorId": "${user.id}" },
            "inverted": false
          }
        ]
      }
    ],
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Update User

```
PUT /api/users/:id
```

Updates a user's profile information, including password if provided.

**Authentication**: Required  
**Authorization**: Requires `update` permission on `User` subject or `super-modify`

**Request Body**:

```json
{
  "firstName": "Updated First",
  "lastName": "Updated Last",
  "oldPassword": "currentPassword",
  "password": "newPassword",
  "repeatPassword": "newPassword"
}
```

**Response**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": ["User updated successfully"],
  "data": {
    "id": "uuid-here",
    "email": "user@example.com",
    "firstName": "Updated First",
    "lastName": "Updated Last",
    "roles": [
      {
        "id": 1,
        "name": "Editor"
      }
    ],
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Update User Roles

```
PUT /api/users/update-user-roles/:id
```

Updates the roles assigned to a user.

**Authentication**: Required  
**Authorization**: Requires `update-user-roles` permission on `User` subject or `super-modify`

**Request Body**:

```json
{
  "roles": [
    {
      "id": 1,
      "name": "Editor"
    },
    {
      "id": 2,
      "name": "Author"
    }
  ]
}
```

**Response**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": ["User roles updated successfully"],
  "data": {
    "id": "uuid-here",
    "email": "user@example.com",
    "firstName": "First",
    "lastName": "Last",
    "roles": [
      {
        "id": 1,
        "name": "Editor"
      },
      {
        "id": 2,
        "name": "Author"
      }
    ],
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Delete User

```
DELETE /api/users/:id
```

Deletes a user from the system.

**Authentication**: Required  
**Authorization**: Requires `delete` permission on `User` subject or `super-modify`

**Response**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": ["User deleted successfully"]
}
```

## DTOs and Data Validation

The module uses Data Transfer Objects (DTOs) with class-validator for input validation.

### CreateUserDto

```typescript
export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'email ایمیل را به شکل صحیح وارد کنید ' })
  @Expose()
  email: string;

  @ApiProperty({ example: 'securepassword' })
  @IsString({ message: 'password باید شامل کارکتر و حروف و اعداد باشد' })
  @MinLength(8, { message: 'password باید حداقل شامل ۸ کارکتر باشد' })
  @Exclude({ toPlainOnly: true })
  password: string;

  @ApiProperty({ example: 'First Name' })
  @IsString({ message: 'firstName باید شامل کارکتر و حروف باشد' })
  @Expose()
  firstName: string;

  @ApiProperty({ example: 'Last Name' })
  @IsString({ message: 'lastName باید شامل کارکتر و حروف باشد' })
  @Expose()
  lastName: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  @IsBoolean({ message: 'isAdmin باید شامل بلی یا خیر باشد' })
  @Exclude({ toClassOnly: true })
  isAdmin: boolean;
}
```

### UpdateUserDto

```typescript
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['email'] as const),
) {
  @IsOptional()
  @IsString()
  @MinLength(8)
  @NotMatch('password')
  @AllowIfPropertyExists('password')
  @AllowIfPropertyExists('repeatPassword')
  @ApiProperty({ example: 'currentPassword' })
  @Expose()
  oldPassword?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @Match('repeatPassword')
  @AllowIfPropertyExists('oldPassword')
  @AllowIfPropertyExists('repeatPassword')
  @ApiProperty({ example: 'newPassword' })
  @Expose()
  password?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @Match('password')
  @AllowIfPropertyExists('oldPassword')
  @AllowIfPropertyExists('password')
  @ApiProperty({ example: 'newPassword' })
  @Expose()
  repeatPassword?: string;
}
```

### ResponseUserDto

```typescript
export class ResponseUserDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  email: string;

  @IsOptional()
  @ApiProperty()
  @Expose()
  firstName?: string;

  @IsOptional()
  @ApiProperty()
  @Expose()
  lastName?: string;

  @IsBoolean()
  @Exclude({ toClassOnly: true })
  isAdmin: boolean;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
```

### ResponseUserRoleDto

```typescript
export class ResponseUserRoleDto {
  @Expose()
  @ApiProperty()
  id: string;

  @IsEmail()
  @ApiProperty()
  @Expose()
  email: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  @Expose()
  firstName?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  @Expose()
  lastName?: string;

  @IsBoolean()
  @Exclude({ toClassOnly: true })
  isAdmin: boolean;

  @IsOptional()
  @ApiProperty()
  @IsArray()
  @Type(() => ResponseRoleDto)
  @Expose()
  roles?: ResponseRoleDto[];

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
```

## Role Management

The Users module integrates with the Roles module to manage user permissions:

1. Each user can have multiple roles
2. Roles define what permissions the user has
3. When updating a user's roles, the system:
   - Clears current role assignments
   - Assigns the new roles
   - Invalidates CASL ability cache in Redis
   - Invalidates refresh token cache to enforce new permissions

Role assignment requires the specialized `update-user-roles` permission.

## Password Handling

Passwords are securely handled throughout the system:

1. Passwords are never stored in plain text
2. Passwords are hashed using bcrypt with a salt factor of 10
3. Password updates require the current password for verification
4. Password validation enforces a minimum length of 8 characters
5. When changing passwords, all refresh tokens are invalidated

Example password update flow:

```typescript
async update(id: string, { oldPassword, password, ...updateUserDto }: UpdateUserDto) {
  const user = await this.userRepository.findOne({ where: { id } });

  if (password) {
    if (await compareSync(oldPassword, user.password)) {
      const hashedNewPassword = await hashSync(password, 10);
      user.password = hashedNewPassword;
    } else {
      throw new ValidationException(['oldPassword : Old password is not correct!']);
    }
  }

  // Update other fields...

  // Invalidate tokens if password changed
  if (password && password !== updatedUser.password) {
    // Clear tokens logic...
  }
}
```

## Caching Strategy

The Users module uses Redis for caching to improve performance:

1. User lookup by ID is cached for 2000ms
2. User abilities are cached in the `ability_rules_by_user_id_{id}` key
3. Refresh tokens are cached in the `refresh_tokens_by_user_id_{id}` key
4. Cache is invalidated on:
   - User updates
   - Role changes
   - User deletion
   - Password changes

This improves performance while ensuring security by invalidating caches when data changes.

## Security Considerations

The Users module implements several security measures:

1. **Password Security**: Secure hashing with bcrypt
2. **Access Control**: CASL integration for permission checks
3. **Data Protection**: Password and sensitive fields excluded from responses
4. **Input Validation**: Strict validation rules for all inputs
5. **Cache Invalidation**: Proper invalidation on security-relevant changes
6. **Role Separation**: Special permission for role management

## Example Requests

### Creating a User

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "email": "newuser@example.com",
    "password": "securepassword",
    "firstName": "New",
    "lastName": "User",
    "isAdmin": false
  }'
```

### Getting a User

```bash
curl -X GET http://localhost:3000/api/users/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Updating a User

```bash
curl -X PUT http://localhost:3000/api/users/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "firstName": "Updated",
    "lastName": "Name",
    "oldPassword": "currentPassword",
    "password": "newPassword",
    "repeatPassword": "newPassword"
  }'
```

### Assigning Roles

```bash
curl -X PUT http://localhost:3000/api/users/update-user-roles/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "roles": [
      {
        "id": 1,
        "name": "Editor"
      },
      {
        "id": 2,
        "name": "Author"
      }
    ]
  }'
```

## Integration with Other Modules

The Users module integrates with several other modules:

1. **Auth Module**: For authentication and token management
2. **Role Module**: For role assignment and permission management
3. **CASL Module**: For permission checking and ability generation
4. **Article Module**: Users own articles and permissions are checked
5. **Cache Module**: For performance optimization through Redis

These integrations ensure that users are properly authenticated, authorized, and can access only the resources they are permitted to use.
