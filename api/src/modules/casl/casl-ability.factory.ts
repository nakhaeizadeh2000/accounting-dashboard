import {
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  PureAbility,
  subject,
  FieldMatcher,
} from '@casl/ability';
import { Injectable, Logger } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { Action } from './types/actions';
import { Permission } from '../../permissions/entities/permission.entity';
import { Subjects, SubjectString } from './types/subjects';

// This is the key change - defining the ability type more precisely
export type AppAbility = PureAbility<[Action | string, any]>;

@Injectable()
export class CaslAbilityFactory {
  private readonly logger = new Logger(CaslAbilityFactory.name);

  /**
   * Creates an ability object for a user based on their permissions
   */
  createForUser(user: User, permissions: Permission[]): AppAbility {
    this.logger.debug(
      `[CASL] Creating ability for user ${user.id} with ${permissions.length} permissions`,
    );

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

      this.logger.debug(
        `[CASL] Adding permission: ${action} ${subjectName} (inverted: ${inverted})`,
      );

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
    this.logger.debug(`[CASL] Adding default permissions`);
    if (user.isAdmin) {
      // can(Action.MANAGE, 'all');
    }
    // can('update', 'Article', ['title']);

    // Define the fieldMatcher function
    const fieldMatcher: FieldMatcher = (fields) => (field) =>
      fields.includes(field);

    const ability = build({
      // Ensure subject types are correctly detected
      detectSubjectType: (item) => {
        if (typeof item === 'string') {
          return item;
        }

        // For subject() wrapped objects
        if (item && item.__caslSubjectType__) {
          return item.__caslSubjectType__;
        }

        // Check for entity discriminator
        if (item && item.kind) {
          return item.kind;
        }

        // Last resort, use constructor
        return item.constructor as ExtractSubjectType<Subjects>;
      },
      fieldMatcher, // Keep this
    });
    this.logger.debug(
      `[CASL] Built ability with ${ability.rules.length} rules`,
    );
    return ability;
  }

  /**
   * Creates an ability object from cached rules
   */
  createFromRules(rules: any[]): AppAbility {
    this.logger.debug(
      `[CASL] Recreating ability from ${rules.length} cached rules`,
    );

    // Define the fieldMatcher function here too
    const fieldMatcher: FieldMatcher = (fields) => (field) =>
      fields.includes(field);

    return new PureAbility(rules, {
      detectSubjectType: (item) => {
        if (typeof item === 'string') {
          return item;
        }

        // For subject() wrapped objects
        if (item && item.__caslSubjectType__) {
          return item.__caslSubjectType__;
        }

        // Check for entity discriminator
        if (item && item.kind) {
          return item.kind;
        }

        return item.constructor as ExtractSubjectType<Subjects>;
      },
      fieldMatcher, // Add it here as well for consistency
    });
  }
}
