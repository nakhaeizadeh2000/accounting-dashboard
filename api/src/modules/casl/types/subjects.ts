import { InferSubjects } from '@casl/ability';
import { Article } from 'src/modules/articles/entities/article.entity';
import { Permission } from 'src/permissions/entities/permission.entity';
import { Role } from 'src/role/entities/role.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { File } from 'src/modules/files/entities/file.entity';

/**
 * Define all possible subjects that can have permissions
 * Using InferSubjects to automatically extract type information from entity classes
 */
export type Subjects = InferSubjects<
  | typeof User
  | typeof Article
  | typeof Permission
  | typeof Role
  | typeof File
  | 'Files' // String literal for non-entity subjects
  | 'all', // Special subject for global permissions
  true // Set to true to include subclasses
>;

// Enum for better type safety with string literal subjects
export enum SubjectType {
  USER = 'User',
  ARTICLE = 'Article',
  PERMISSION = 'Permission',
  ROLE = 'Role',
  FILE = 'File',
  FILES = 'Files',
  ALL = 'all',
}

// A type that maps from SubjectType to the actual class (or keeps string literals)
export type SubjectMap = {
  [SubjectType.USER]: typeof User;
  [SubjectType.ARTICLE]: typeof Article;
  [SubjectType.PERMISSION]: typeof Permission;
  [SubjectType.ROLE]: typeof Role;
  [SubjectType.FILE]: typeof File;
  [SubjectType.FILES]: 'Files';
  [SubjectType.ALL]: 'all';
};

// Helper type for function parameters
export type SubjectType_T = keyof SubjectMap;

// For use in string-based operations
export type SubjectString =
  | 'User'
  | 'Article'
  | 'Permission'
  | 'Role'
  | 'File'
  | 'Files'
  | 'all';
