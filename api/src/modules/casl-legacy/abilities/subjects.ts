import { InferSubjects } from '@casl/ability';
import { Article } from 'src/modules/articles/entities/article.entity';
import { Permission } from 'src/permissions/entities/permission.entity';
import { Role } from 'src/role/entities/role.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { File } from 'src/modules/files/entities/file.entity';

export type Subjects = InferSubjects<
  | typeof User
  | typeof Article
  | typeof Permission
  | typeof Role
  | typeof File
  // ... other entities
  | 'Files'
  | 'all',
  true
>;
