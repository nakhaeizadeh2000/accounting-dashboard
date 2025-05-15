# Roles Module

This document details the Roles module, which provides a comprehensive system for managing role-based access control (RBAC) in the application.

## Table of Contents

- [Roles Module](#roles-module)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Data Model](#data-model)
  - [API Endpoints](#api-endpoints)
    - [Create Role](#create-role)
    - [Get All Roles](#get-all-roles)
    - [Get Role by ID](#get-role-by-id)
    - [Update Role](#update-role)
    - [Delete Role](#delete-role)
  - [DTOs and Data Validation](#dtos-and-data-validation)
    - [CreateRoleDto](#createroledto)
    - [UpdateRoleDto](#updateroledto)
    - [ResponseRoleDto](#responseroledto)
  - [Role Management](#role-management)
    - [Creating Roles](#creating-roles)
    - [Assigning Permissions](#assigning-permissions)
    - [Assigning Roles to Users](#assigning-roles-to-users)
    - [Cache Invalidation](#cache-invalidation)
  - [Example Roles](#example-roles)
    - [Administrator](#administrator)
    - [Editor](#editor)
    - [Author](#author)
    - [Reader](#reader)
  - [Example Requests](#example-requests)
    - [Creating a Role](#creating-a-role)
    - [Getting All Roles](#getting-all-roles)
    - [Getting a Role by ID](#getting-a-role-by-id)
    - [Updating a Role](#updating-a-role)
    - [Deleting a Role](#deleting-a-role)
  - [Integration with Other Modules](#integration-with-other-modules)
  - [Related Documentation](#related-documentation)

## Overview

The Roles module manages the definition and assignment of roles in the application's access control system. It allows for the creation, update, and deletion of roles that bundle sets of permissions, which in turn define what actions users can take on which resources.

Key features:

- Complete CRUD operations for roles
- Association of permissions with roles
- Assignment of roles to users
- Cache management for optimizing permissions checks
- Integration with CASL for dynamic ability creation

## Data Model

The Role entity is defined as follows:

```typescript
@Entity()
export class Role {
  kind: 'Role';

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => Permission, (permission) => permission.roles, {
    cascade: true,
    eager: true,
  })
  permissions: Permission[];

  @ManyToMany(() => User, (user) => user.roles)
  @JoinTable({
    name: 'role_user',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
  })
  users: User[];
}
```

The Role entity has many-to-many relationships with both Permissions and Users, allowing for flexible association of permissions with roles and roles with users.

## API Endpoints

### Create Role

```
POST /api/role
```

Creates a new role in the system.

**Authentication**: Required  
**Authorization**: Requires `create` permission on `Role` subject or `super-modify`

**Request Body**:

```json
{
  "name": "Editor"
}
```

**Response**:

```json
{
  "success": true,
  "statusCode": 201,
  "message": ["عملیات با موفقیت انجام شد"],
  "data": {
    "id": 1,
    "name": "Editor",
    "permissions": []
  }
}
```

### Get All Roles

```
GET /api/role
```

Retrieves a list of all roles.

**Authentication**: Required  
**Authorization**: Requires `read` permission on `Role` subject or `super-modify`

**Response**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": ["عملیات با موفقیت انجام شد"],
  "data": [
    {
      "id": 1,
      "name": "Administrator",
      "permissions": [
        {
          "id": 1,
          "action": "manage",
          "subject": "all",
          "fields": null,
          "conditions": null,
          "inverted": false
        }
      ]
    },
    {
      "id": 2,
      "name": "Editor",
      "permissions": [
        {
          "id": 2,
          "action": "read",
          "subject": "Article",
          "fields": ["*"],
          "conditions": null,
          "inverted": false
        },
        {
          "id": 3,
          "action": "update",
          "subject": "Article",
          "fields": ["title", "content"],
          "conditions": { "authorId": "${user.id}" },
          "inverted": false
        }
      ]
    }
  ]
}
```

### Get Role by ID

```
GET /api/role/:id
```

Retrieves a specific role by ID.

**Authentication**: Required  
**Authorization**: Requires `read` permission on `Role` subject or `super-modify`

**Response**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": ["عملیات با موفقیت انجام شد"],
  "data": {
    "id": 2,
    "name": "Editor",
    "permissions": [
      {
        "id": 2,
        "action": "read",
        "subject": "Article",
        "fields": ["*"],
        "conditions": null,
        "inverted": false
      },
      {
        "id": 3,
        "action": "update",
        "subject": "Article",
        "fields": ["title", "content"],
        "conditions": { "authorId": "${user.id}" },
        "inverted": false
      }
    ]
  }
}
```

### Update Role

```
PUT /api/role/:id
```

Updates an existing role, including its name and associated permissions.

**Authentication**: Required  
**Authorization**: Requires `update` permission on `Role` subject or `super-modify`

**Request Body**:

```json
{
  "name": "Content Editor",
  "permissions": [
    {
      "id": 2,
      "action": "read",
      "subject": "Article"
    },
    {
      "id": 3,
      "action": "update",
      "subject": "Article"
    },
    {
      "id": 4,
      "action": "create",
      "subject": "Article"
    }
  ]
}
```

**Response**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": ["عملیات با موفقیت انجام شد"],
  "data": {
    "id": 2,
    "name": "Content Editor",
    "permissions": [
      {
        "id": 2,
        "action": "read",
        "subject": "Article",
        "fields": ["*"],
        "conditions": null,
        "inverted": false
      },
      {
        "id": 3,
        "action": "update",
        "subject": "Article",
        "fields": ["title", "content"],
        "conditions": { "authorId": "${user.id}" },
        "inverted": false
      },
      {
        "id": 4,
        "action": "create",
        "subject": "Article",
        "fields": null,
        "conditions": null,
        "inverted": false
      }
    ]
  }
}
```

### Delete Role

```
DELETE /api/role/:id
```

Deletes a role from the system.

**Authentication**: Required  
**Authorization**: Requires `delete` permission on `Role` subject or `super-modify`

**Response**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": ["عملیات با موفقیت انجام شد"]
}
```

## DTOs and Data Validation

The module uses Data Transfer Objects (DTOs) with class-validator for input validation.

### CreateRoleDto

```typescript
export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  @Expose()
  name: string;
}
```

### UpdateRoleDto

```typescript
export class UpdateRoleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsArray()
  @Type(() => Permission)
  permissions?: Permission[];
}
```

### ResponseRoleDto

```typescript
export class ResponseRoleDto {
  @IsUUID()
  @Expose()
  id: number;

  @IsString()
  @Expose()
  name: string;

  @Type(() => ResponsePermissionDto)
  @Expose()
  permissions: ResponsePermissionDto[];
}
```

## Role Management

### Creating Roles

Roles are created with a name and can later be associated with permissions. The typical workflow is:

1. Create a role with a descriptive name
2. Create permissions that define specific abilities
3. Associate permissions with the role
4. Assign the role to users

### Assigning Permissions

Permissions can be assigned to roles during role creation or later through updates:

```typescript
// Example of updating a role with permissions
async update(id: number, updateRoleDto: UpdateRoleDto): Promise<ResponseRoleDto> {
  const role = await this.roleRepository.findOne({
    where: { id },
  });

  // Update role properties
  Object.entries(updateRoleDto).forEach(([key, value]) => {
    if (value !== undefined) {
      role[key] = value;
    }
  });

  const savedRole = await this.roleRepository.save(role);

  // Invalidate caches
  role.users.forEach(async (user) => {
    // Cache invalidation logic...
  });

  return plainToInstance(ResponseRoleDto, savedRole, {
    excludeExtraneousValues: true,
  });
}
```

### Assigning Roles to Users

Roles are assigned to users through the Users module:

```typescript
async updateUserRoles(
  userId: string,
  roles: PureRoleDto[],
): Promise<ResponseUserRoleDto> {
  const user = await this.userRepository.findOne({
    where: { id: userId },
    relations: { roles: true },
  });

  // Clear existing roles
  user.roles = [];

  // Find and add new roles
  for (const roleDto of roles) {
    const role = await this.roleRepository.findOne({
      where: { id: roleDto.id },
    });
    if (role) {
      user.roles.push(role);
    }
  }

  // Save the updated user
  const updatedUser = await this.userRepository.save(user);

  // Invalidate caches
  await this.cacheManager.del(`ability_rules_by_user_id_${userId}`);
  await this.cacheManager.del(`refresh_tokens_by_user_id_${userId}`);

  return plainToInstance(ResponseUserRoleDto, updatedUser, {
    excludeExtraneousValues: true,
  });
}
```

### Cache Invalidation

When roles are updated or deleted, or when a user's roles change, the system invalidates relevant caches to ensure permissions are correctly applied:

```typescript
// Example cache invalidation when a role is updated
role.users.forEach(async (user) => {
  const refreshTokenCacheKey = `refresh_tokens_by_user_id_${user.id}`;
  await this.cacheManager.del(refreshTokenCacheKey);
  await this.cacheManager.del(`ability_rules_by_user_id_${user.id}`);
});
```

This ensures that permission changes take effect immediately without requiring users to log out and back in.

## Example Roles

Here are some example roles that could be configured in the system:

### Administrator

Has full access to all system functions:

```json
{
  "name": "Administrator",
  "permissions": [
    {
      "action": "manage",
      "subject": "all",
      "fields": null,
      "conditions": null,
      "inverted": false
    }
  ]
}
```

### Editor

Can read all articles and update articles they authored:

```json
{
  "name": "Editor",
  "permissions": [
    {
      "action": "read",
      "subject": "Article",
      "fields": ["*"],
      "conditions": null,
      "inverted": false
    },
    {
      "action": "update",
      "subject": "Article",
      "fields": ["title", "content"],
      "conditions": { "authorId": "${user.id}" },
      "inverted": false
    },
    {
      "action": "create",
      "subject": "Article",
      "fields": null,
      "conditions": null,
      "inverted": false
    }
  ]
}
```

### Author

Can create articles and manage their own content:

```json
{
  "name": "Author",
  "permissions": [
    {
      "action": "create",
      "subject": "Article",
      "fields": null,
      "conditions": null,
      "inverted": false
    },
    {
      "action": "read",
      "subject": "Article",
      "fields": ["*"],
      "conditions": { "authorId": "${user.id}" },
      "inverted": false
    },
    {
      "action": "update",
      "subject": "Article",
      "fields": ["title", "content"],
      "conditions": { "authorId": "${user.id}" },
      "inverted": false
    },
    {
      "action": "delete",
      "subject": "Article",
      "fields": null,
      "conditions": { "authorId": "${user.id}" },
      "inverted": false
    }
  ]
}
```

### Reader

Has read-only access to articles:

```json
{
  "name": "Reader",
  "permissions": [
    {
      "action": "read",
      "subject": "Article",
      "fields": ["title", "content", "createdAt", "authorId"],
      "conditions": null,
      "inverted": false
    }
  ]
}
```

## Example Requests

### Creating a Role

```bash
curl -X POST http://localhost:3000/api/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Content Manager"
  }'
```

### Getting All Roles

```bash
curl -X GET http://localhost:3000/api/role \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Getting a Role by ID

```bash
curl -X GET http://localhost:3000/api/role/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Updating a Role

```bash
curl -X PUT http://localhost:3000/api/role/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Content Supervisor",
    "permissions": [
      {
        "id": 1
      },
      {
        "id": 2
      }
    ]
  }'
```

### Deleting a Role

```bash
curl -X DELETE http://localhost:3000/api/role/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Integration with Other Modules

The Roles module integrates with several other modules:

1. **Users Module**: Roles are assigned to users to grant them permissions
2. **Permissions Module**: Roles contain collections of permissions
3. **CASL Module**: Roles and permissions are used to define CASL abilities
4. **Auth Module**: Role information is included in refresh tokens
5. **Cache Module**: Role changes trigger cache invalidation for affected users

## Related Documentation

- [Permissions Module](./PERMISSIONS.md) - Documentation on the permissions that make up roles
- [CASL Authorization](./CASL.md) - Learn more about the permission system
- [Users Module](./USERS.md) - Documentation on how roles are assigned to users
- [Authentication](./AUTH.md) - Understanding how roles affect authentication
