# Permissions Module

This document details the Permissions module, which defines the granular permissions that control what actions users can perform on different resources within the application.

## Table of Contents

- [Permissions Module](#permissions-module)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Data Model](#data-model)
  - [API Endpoints](#api-endpoints)
    - [Create Permission](#create-permission)
    - [Get All Permissions](#get-all-permissions)
    - [Get Permission by ID](#get-permission-by-id)
    - [Update Permission](#update-permission)
    - [Delete Permission](#delete-permission)
  - [DTOs and Data Validation](#dtos-and-data-validation)
    - [CreatePermissionDto](#createpermissiondto)
    - [UpdatePermissionDto](#updatepermissiondto)
    - [ResponsePermissionDto](#responsepermissiondto)
  - [Permission Structure](#permission-structure)
    - [Action Types](#action-types)
    - [Subject Types](#subject-types)
    - [Fields](#fields)
    - [Conditions](#conditions)
    - [Inverted Permissions](#inverted-permissions)
  - [Example Permissions](#example-permissions)
    - [Basic Permissions](#basic-permissions)
    - [Field-Specific Permissions](#field-specific-permissions)
    - [Conditional Permissions](#conditional-permissions)
    - [Inverted Permissions (Deny Rules)](#inverted-permissions-deny-rules)
  - [Permission Evaluation](#permission-evaluation)
  - [Example Requests](#example-requests)
    - [Creating a Permission](#creating-a-permission)
    - [Getting All Permissions](#getting-all-permissions)
    - [Getting a Permission by ID](#getting-a-permission-by-id)
    - [Updating a Permission](#updating-a-permission)
    - [Deleting a Permission](#deleting-a-permission)
  - [Cache Management](#cache-management)
  - [Integration with Other Modules](#integration-with-other-modules)
  - [Related Documentation](#related-documentation)

## Overview

The Permissions module is the foundation of the application's access control system. It defines permissions that specify what actions users can perform on different resources. These permissions are assigned to roles, which are then assigned to users, creating a flexible and powerful role-based access control system.

Key features:

- Complete CRUD operations for permissions
- Support for field-level permissions
- Conditional permissions based on resource attributes
- Integration with CASL for dynamic ability creation
- Support for both "allow" and "deny" (inverted) permissions

## Data Model

The Permission entity is defined as follows:

```typescript
@Entity()
export class Permission {
  kind: 'Permission';

  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  action: string;

  @Column()
  subject: string;

  @Column({
    nullable: true,
    type: 'text',
    transformer: {
      to: (value: string[]) => (value ? JSON.stringify(value) : null),
      from: (value: string) => (value ? JSON.parse(value) : []),
    },
  })
  fields: string[];

  @Column({
    nullable: true,
    type: 'text',
    transformer: {
      to: (value: Object) => (value ? JSON.stringify(value) : null),
      from: (value: string) => (value ? JSON.parse(value) : null),
    },
  })
  conditions: Object;

  @Column({ default: false })
  inverted: boolean;

  @Column()
  reason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Role, (role) => role.permissions)
  @JoinTable({
    name: 'permission_role',
    joinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
  })
  roles: Role[];
}
```

## API Endpoints

### Create Permission

```
POST /api/permission
```

Creates a new permission in the system.

**Authentication**: Required  
**Authorization**: Requires `create` permission on `Permission` subject or `super-modify`

**Request Body**:

```json
{
  "action": "read",
  "subject": "Article",
  "fields": ["title", "content", "createdAt"],
  "conditions": { "published": true },
  "inverted": false
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
    "action": "read",
    "subject": "Article",
    "fields": ["title", "content", "createdAt"],
    "conditions": { "published": true },
    "inverted": false
  }
}
```

### Get All Permissions

```
GET /api/permission
```

Retrieves a list of all permissions.

**Authentication**: Required  
**Authorization**: Requires `read` permission on `Permission` subject or `super-modify`

**Response**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": ["عملیات با موفقیت انجام شد"],
  "data": [
    {
      "id": 1,
      "action": "read",
      "subject": "Article",
      "fields": ["title", "content", "createdAt"],
      "conditions": { "published": true },
      "inverted": false
    },
    {
      "id": 2,
      "action": "create",
      "subject": "Article",
      "fields": null,
      "conditions": null,
      "inverted": false
    }
  ]
}
```

### Get Permission by ID

```
GET /api/permission/:id
```

Retrieves a specific permission by ID.

**Authentication**: Required  
**Authorization**: Requires `read` permission on `Permission` subject or `super-modify`

**Response**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": ["عملیات با موفقیت انجام شد"],
  "data": {
    "id": 1,
    "action": "read",
    "subject": "Article",
    "fields": ["title", "content", "createdAt"],
    "conditions": { "published": true },
    "inverted": false
  }
}
```

### Update Permission

```
PUT /api/permission/:id
```

Updates an existing permission.

**Authentication**: Required  
**Authorization**: Requires `update` permission on `Permission` subject or `super-modify`

**Request Body**:

```json
{
  "action": "read",
  "subject": "Article",
  "fields": ["title", "content", "createdAt", "authorId"],
  "conditions": { "published": true },
  "inverted": false
}
```

**Response**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": ["عملیات با موفقیت انجام شد"],
  "data": {
    "id": 1,
    "action": "read",
    "subject": "Article",
    "fields": ["title", "content", "createdAt", "authorId"],
    "conditions": { "published": true },
    "inverted": false
  }
}
```

### Delete Permission

```
DELETE /api/permission/:id
```

Deletes a permission from the system.

**Authentication**: Required  
**Authorization**: Requires `delete` permission on `Permission` subject or `super-modify`

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

### CreatePermissionDto

```typescript
export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  @Expose()
  @ApiProperty({ name: 'action', example: 'read' })
  action: string;

  @IsString()
  @IsNotEmpty()
  @Expose()
  @ApiProperty({ name: 'subject', example: 'Article' })
  subject: string;

  @IsArray()
  @IsOptional()
  @Expose()
  @ApiProperty({ name: 'fields' })
  fields?: string[];

  @IsObject()
  @IsOptional()
  @Expose()
  @ApiProperty({ name: 'conditions' })
  conditions?: Object;

  @IsBoolean()
  @IsOptional()
  @Expose()
  @ApiProperty({
    name: 'inverted',
    type: Boolean,
    default: false,
    example: false,
  })
  inverted?: boolean;
}
```

### UpdatePermissionDto

```typescript
export class UpdatePermissionDto extends CreatePermissionDto {}
```

### ResponsePermissionDto

```typescript
export class ResponsePermissionDto {
  @Expose()
  id: number;

  @Expose()
  action: string;

  @Expose()
  subject: string;

  @Expose()
  fields?: string[];

  @Expose()
  conditions: Object;

  @Expose()
  inverted: boolean;
}
```

## Permission Structure

Each permission defines what actions users can perform on specific resources. Permissions have several components:

### Action Types

The `action` field specifies what operation is being permitted. Common actions include:

- `manage`: Full control (implies all other actions)
- `create`: Ability to create new resources
- `read`: Ability to view resources
- `update`: Ability to modify existing resources
- `delete`: Ability to remove resources
- `update-user-roles`: Special action for managing role assignments

Custom actions can also be defined as needed.

### Subject Types

The `subject` field specifies what resource type the permission applies to. Common subjects include:

- `User`: User accounts
- `Article`: Article content
- `Role`: Role definitions
- `Permission`: Permission definitions
- `Files`: File uploads
- `all`: All resource types (special value)

### Fields

The optional `fields` array specifies which attributes of the subject the permission applies to. This allows for field-level permissions:

```json
{
  "action": "update",
  "subject": "Article",
  "fields": ["title", "content"]
}
```

This permission would allow updating only the title and content fields of an Article, but not other fields like `publishedAt` or `status`.

Special value:

- `["*"]`: All fields

### Conditions

The optional `conditions` object specifies additional criteria that must be met for the permission to apply:

```json
{
  "action": "update",
  "subject": "Article",
  "conditions": { "authorId": "${user.id}" }
}
```

This permission would allow updating only Articles where the `authorId` matches the current user's ID.

Conditions can use special placeholders like `${user.id}` which are replaced with the actual user's values at runtime.

### Inverted Permissions

The `inverted` boolean flag, when true, turns a permission into a denial rule:

```json
{
  "action": "delete",
  "subject": "Article",
  "conditions": { "status": "published" },
  "inverted": true
}
```

This inverted permission would prevent deletion of Articles that have a status of "published", even if another permission might otherwise allow it.

## Example Permissions

### Basic Permissions

```json
// Allow creating articles
{
  "action": "create",
  "subject": "Article"
}

// Allow reading all users
{
  "action": "read",
  "subject": "User"
}

// Administrator permission (access everything)
{
  "action": "manage",
  "subject": "all"
}
```

### Field-Specific Permissions

```json
// Allow reading only specific fields of articles
{
  "action": "read",
  "subject": "Article",
  "fields": ["title", "content", "createdAt"]
}

// Allow updating only the profile fields of users
{
  "action": "update",
  "subject": "User",
  "fields": ["firstName", "lastName"]
}
```

### Conditional Permissions

```json
// Allow users to delete only their own articles
{
  "action": "delete",
  "subject": "Article",
  "conditions": { "authorId": "${user.id}" }
}

// Allow reading only published articles
{
  "action": "read",
  "subject": "Article",
  "conditions": { "status": "published" }
}
```

### Inverted Permissions (Deny Rules)

```json
// Prevent deletion of published articles
{
  "action": "delete",
  "subject": "Article",
  "conditions": { "status": "published" },
  "inverted": true
}

// Prevent users from updating admin users
{
  "action": "update",
  "subject": "User",
  "conditions": { "isAdmin": true },
  "inverted": true
}
```

## Permission Evaluation

When evaluating permissions, the system follows these rules:

1. If a user has the `super-modify` permission or is an admin, they have full access
2. Regular allow rules are processed first
3. Deny (inverted) rules are processed next and can override allow rules
4. More specific rules (with conditions or field restrictions) take precedence over general rules
5. If no matching rules are found, access is denied by default

This evaluation is performed by the CASL library, which converts the permissions into ability rules at runtime.

## Example Requests

### Creating a Permission

```bash
curl -X POST http://localhost:3000/api/permission \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "action": "read",
    "subject": "Article",
    "fields": ["title", "content", "createdAt"],
    "conditions": { "published": true },
    "inverted": false
  }'
```

### Getting All Permissions

```bash
curl -X GET http://localhost:3000/api/permission \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Getting a Permission by ID

```bash
curl -X GET http://localhost:3000/api/permission/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Updating a Permission

```bash
curl -X PUT http://localhost:3000/api/permission/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "action": "read",
    "subject": "Article",
    "fields": ["title", "content", "createdAt", "authorId"],
    "conditions": { "published": true },
    "inverted": false
  }'
```

### Deleting a Permission

```bash
curl -X DELETE http://localhost:3000/api/permission/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Cache Management

Changes to permissions can affect multiple users through role assignments. To ensure permission changes take effect immediately, the system invalidates relevant caches:

```typescript
// Example of cache invalidation when updating a permission
async update(
  id: string,
  updatePermissionDto: UpdatePermissionDto,
): Promise<ResponsePermissionDto> {
  await this.permissionRepository.update(id, updatePermissionDto);
  const { roles, ...permission } = await this.permissionRepository.findOne({
    where: { id },
    relations: {
      roles: { users: true },
    },
  });

  // Invalidate caches for all affected users
  roles.forEach(async (role) =>
    role.users.forEach(async (user) => {
      await this.cacheManager.del(`ability_rules_by_user_id_${user.id}`);
      const refreshTokenCacheKey = `refresh_tokens_by_user_id_${user.id}`;
      await this.cacheManager.del(refreshTokenCacheKey);
    }),
  );

  return plainToInstance(ResponsePermissionDto, permission, {
    excludeExtraneousValues: true,
  });
}
```

## Integration with Other Modules

The Permissions module integrates with several other modules:

1. **Roles Module**: Permissions are assigned to roles
2. **Users Module**: Users have permissions through their roles
3. **CASL Module**: Permissions are transformed into CASL abilities
4. **Auth Module**: Permission changes affect authentication tokens
5. **Cache Module**: Permission changes trigger cache invalidation

## Related Documentation

- [Roles Module](./ROLES.md) - Documentation on the roles that contain permissions
- [CASL Authorization](./CASL.md) - Learn more about the permission system
- [Users Module](./USERS.md) - Documentation on how permissions affect users
- [Authentication](./AUTH.md) - How permissions integrate with authentication
