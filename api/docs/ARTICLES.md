# Articles Module

This document details the Articles module, which provides a complete system for creating, retrieving, updating, and deleting articles with access control based on user roles and permissions.

## Table of Contents

- [Articles Module](#articles-module)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Data Model](#data-model)
  - [API Endpoints](#api-endpoints)
    - [Create Article](#create-article)
    - [Get All Articles](#get-all-articles)
    - [Get Article by ID](#get-article-by-id)
    - [Update Article](#update-article)
    - [Delete Article](#delete-article)
  - [DTOs and Data Validation](#dtos-and-data-validation)
    - [CreateArticleDto](#createarticledto)
    - [UpdateArticleDto](#updatearticledto)
    - [ResponseArticleDto](#responsearticledto)
  - [Access Control](#access-control)
    - [CASL Integration](#casl-integration)
    - [Query Filtering](#query-filtering)
  - [Example Requests](#example-requests)
    - [Creating an Article](#creating-an-article)
    - [Getting All Articles](#getting-all-articles)
    - [Getting an Article by ID](#getting-an-article-by-id)
    - [Updating an Article](#updating-an-article)
    - [Deleting an Article](#deleting-an-article)
  - [Related Documentation](#related-documentation)

## Overview

The Articles module manages all article-related operations in the system. It provides article creation, editing, deletion, and retrieval with appropriate access control through CASL integration. The module ensures that users can only perform actions they have permission for and can only access articles they're authorized to see.

Key features:

- Complete CRUD operations for articles
- Role-based access control
- Content filtering based on user permissions
- Pagination support for listing articles
- Proper validation of all inputs

## Data Model

The Article entity is defined as follows:

```typescript
@Entity({
  name: 'articles',
})
export class Article {
  kind: 'Article';

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.articles)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column({ type: 'uuid' })
  authorId: string;
}
```

## API Endpoints

### Create Article

```
POST /api/article
```

Creates a new article.

**Authentication**: Required  
**Authorization**: Requires `create` permission on `Article` subject or `super-modify`

**Request Body**:

```json
{
  "title": "Example Article Title",
  "content": "This is the content of the article. It can be quite long and detailed.",
  "authorId": "123e4567-e89b-12d3-a456-426614174000"
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
    "title": "Example Article Title",
    "content": "This is the content of the article. It can be quite long and detailed.",
    "authorId": "123e4567-e89b-12d3-a456-426614174000",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Get All Articles

```
GET /api/article
```

Retrieves a paginated list of articles. The results are filtered based on the user's permissions, so users will only see articles they're authorized to view (either all articles for administrators or only their own articles for regular users).

**Authentication**: Required  
**Authorization**: Requires `read` permission on `Article` subject or `super-modify`

**Query Parameters**:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Response**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": ["عملیات با موفقیت انجام شد"],
  "data": {
    "items": [
      {
        "id": 1,
        "title": "Example Article Title",
        "content": "This is the content of the article. It can be quite long and detailed.",
        "authorId": "123e4567-e89b-12d3-a456-426614174000",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z"
      },
      {
        "id": 2,
        "title": "Another Article Title",
        "content": "This is another article's content.",
        "authorId": "123e4567-e89b-12d3-a456-426614174000",
        "createdAt": "2023-01-02T00:00:00.000Z",
        "updatedAt": "2023-01-02T00:00:00.000Z"
      }
    ],
    "total": 50,
    "currentPage": 1,
    "totalPages": 5,
    "pageSize": 10
  }
}
```

### Get Article by ID

```
GET /api/article/:id
```

Retrieves a specific article by ID.

**Authentication**: Required  
**Authorization**: Requires `read` permission on `Article` subject or `super-modify`

**Response**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": ["عملیات با موفقیت انجام شد"],
  "data": {
    "id": 1,
    "title": "Example Article Title",
    "content": "This is the content of the article. It can be quite long and detailed.",
    "authorId": "123e4567-e89b-12d3-a456-426614174000",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Update Article

```
PATCH /api/article/:id
```

Updates an existing article. Users can only update their own articles unless they have administrative privileges.

**Authentication**: Required  
**Authorization**: Requires `update` permission on `Article` subject or `super-modify`

**Request Body**:

```json
{
  "title": "Updated Article Title",
  "content": "This is the updated content of the article."
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
    "title": "Updated Article Title",
    "content": "This is the updated content of the article.",
    "authorId": "123e4567-e89b-12d3-a456-426614174000",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Delete Article

```
DELETE /api/article/:id
```

Deletes an article by ID. Users can only delete their own articles unless they have administrative privileges.

**Authentication**: Required  
**Authorization**: Requires `delete` permission on `Article` subject or `super-modify`

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

### CreateArticleDto

```typescript
export class CreateArticleDto {
  @ApiProperty({ description: 'The title of the article' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @Expose()
  title: string;

  @ApiProperty({ description: 'The content of the article' })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @Expose()
  content: string;

  @ApiProperty({
    description: 'The ID of the author (user)',
    type: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  authorId: string;
}
```

### UpdateArticleDto

```typescript
export class UpdateArticleDto extends PartialType(CreateArticleDto) {}
```

### ResponseArticleDto

```typescript
export class ResponseArticleDto {
  @Expose()
  @IsNumber()
  @ApiProperty({
    description: 'The unique identifier of the article',
    example: 1,
  })
  id: number;

  @Expose()
  @IsString()
  @Length(1, 255)
  @ApiProperty({
    description: 'The title of the article',
    example: 'Introduction to NestJS',
    minLength: 1,
    maxLength: 255,
  })
  title: string;

  @Expose()
  @IsString()
  @ApiProperty({
    description: 'The main content of the article',
    example: 'NestJS is a progressive Node.js framework...',
  })
  content: string;

  @Expose()
  @IsNumber()
  @ApiProperty({
    description: 'The ID of the author who wrote the article',
    example: 1,
  })
  authorId: string;

  @Expose()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  @ApiProperty({
    description: 'The date and time when the article was created',
    example: '2024-08-16T12:00:00Z',
  })
  createdAt: Date;

  @Expose()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  @ApiProperty({
    description: 'The date and time when the article was last updated',
    example: '2024-08-16T14:30:00Z',
  })
  updatedAt: Date;
}
```

## Access Control

### CASL Integration

The Articles module integrates with CASL for permission-based access control:

1. Users can create articles only if they have the `create` permission on `Article`
2. Users can read all articles if they have the global `read` permission on `Article`, or only their own articles if they have a conditional `read` permission
3. Users can update only their own articles unless they have administrative privileges
4. Users can delete only their own articles unless they have administrative privileges

Example CASL ability definition for articles:

```typescript
// User with limited access - can only manage their own articles
if (ability.can('read', 'Article')) {
  // Build conditions to only show articles where the user is the author
  const permissionConditions = buildQueryforArticle(
    await ability,
    'read',
    this.request.user,
  );

  const [articles, count] = await this.articleRepository.findAndCount({
    where: {
      ...permissionConditions,
    },
    // pagination options...
  });
}
```

### Query Filtering

The service uses dynamic query building based on user permissions:

```typescript
// This function generates the appropriate WHERE conditions based on user permissions
const permissionConditions = buildQueryforArticle(
  await ability,
  'read',
  this.request.user,
);

// Example output for a regular user might restrict to their own articles
// { authorId: 'user-uuid-here' }

// For an admin or user with full access, it would return an empty object
// allowing access to all articles
// { }
```

This approach ensures that database queries only return records the user is authorized to access.

## Example Requests

### Creating an Article

```bash
curl -X POST http://localhost:3000/api/article \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Example Article Title",
    "content": "This is the content of the article. It can be quite long and detailed.",
    "authorId": "123e4567-e89b-12d3-a456-426614174000"
  }'
```

### Getting All Articles

```bash
curl -X GET "http://localhost:3000/api/article?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Getting an Article by ID

```bash
curl -X GET http://localhost:3000/api/article/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Updating an Article

```bash
curl -X PATCH http://localhost:3000/api/article/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Updated Article Title",
    "content": "This is the updated content of the article."
  }'
```

### Deleting an Article

```bash
curl -X DELETE http://localhost:3000/api/article/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Related Documentation

- [CASL Authorization](./CASL.md) - Learn more about the permission system
- [Users Module](./USERS.md) - Documentation on the Users module that articles are linked to
- [Error Handling](./ERRORS.md) - Understand how errors are handled and formatted
- [Response Format](./RESPONSE.md) - Details on the standardized response format
