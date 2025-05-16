import {
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  PureAbility,
  subject,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { Action } from './types/actions';
import { Permission } from '../../permissions/entities/permission.entity';
import { Subjects, SubjectString } from './types/subjects';

// This is the key change - defining the ability type more precisely
export type AppAbility = PureAbility<[Action | string, any]>;

@Injectable()
export class CaslAbilityFactory {
  /**
   * Creates an ability object for a user based on their permissions
   */
  createForUser(user: User, permissions: Permission[]): AppAbility {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      PureAbility as AbilityClass<AppAbility>,
    );

    // Process all permissions
    for (const permission of permissions) {
      const {
        action,
        subject: subjectName,
        conditions,
        fields,
        inverted,
      } = permission;

      if (inverted) {
        cannot(
          action,
          subjectName,
          fields || undefined,
          conditions || undefined,
        );
      } else {
        can(action, subjectName, fields || undefined, conditions || undefined);
      }
    }

    // Add any default permissions
    can(Action.READ, 'all');

    return build({
      // Ensure subject types are correctly detected
      detectSubjectType: (item) => {
        if (typeof item === 'string') {
          return item;
        }
        return item.constructor as ExtractSubjectType<Subjects>;
      },
    });
  }
}
