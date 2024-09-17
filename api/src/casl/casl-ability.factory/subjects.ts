import { InferSubjects } from '@casl/ability';
import { Article } from 'src/article/entities/article.entity';
import { Permission } from 'src/permissions/entities/permission.entity';
import { Role } from 'src/role/entities/role.entity';
import { User } from 'src/users/entities/user.entity';

export type Subjects = InferSubjects<
  | typeof User
  | typeof Article
  | typeof Permission
  | typeof Role
  // ... other entities
  | 'all',
  true
>;
