import { Injectable } from '@nestjs/common';
import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
} from '@casl/ability';
import { User } from '../users/entities/user.entity';
import { Permission } from '../../permissions/entities/permission.entity';

// Define the subject types your app will use
type Subjects = InferSubjects<any> | 'all';

// Define the actions
export type Action =
  | 'manage'
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | string;

// Define the AppAbility type
export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User, permissions: Permission[]): AppAbility {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      Ability as AbilityClass<AppAbility>,
    );

    // Process permissions
    for (const permission of permissions) {
      const { action, subject, fields, conditions, inverted } = permission;

      if (inverted) {
        cannot(action, subject, conditions);
      } else {
        can(action, subject, fields, conditions);
      }
    }

    // Add default permissions - user can always read their own data
    can('read', 'User', { id: user.id });

    return build({
      // Use type detection
      detectSubjectType: (item) => {
        if (typeof item === 'string') {
          return item;
        }
        return item.constructor as ExtractSubjectType<Subjects>;
      },
    });
  }
}
