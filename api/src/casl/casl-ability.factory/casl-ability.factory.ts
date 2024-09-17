import { Inject, Injectable } from '@nestjs/common';
import {
  PureAbility,
  AbilityBuilder,
  ExtractSubjectType,
  FieldMatcher,
  MatchConditions,
  SubjectRawRule,
} from '@casl/ability';
import { Subjects } from './subjects';
import { Actions } from './actions';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { UsersService } from 'src/users/services/user.service';
import { ResponseUserDto } from 'src/users/dto/response-user.dto';

export type AppAbility = PureAbility<[Actions, Subjects]>;

const fieldMatcher: FieldMatcher = (fields) => (field) =>
  fields.includes(field);
const lambdaMatcher = (matchConditions: MatchConditions) => matchConditions;

@Injectable()
export class CaslAbilityFactory {
  constructor(
    private usersService: UsersService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async defineAbility(user: ResponseUserDto | undefined) {
    if (!user) {
      return null; // or return a default ability
    }

    const cacheKey = `ability_rules_by_user_id_${user.id}`;

    const cachedRules = await this.cacheManager.get<string>(cacheKey);

    if (cachedRules) {
      // If cached rules exists, use it to generate ability and return it
      const { can, cannot, build } = new AbilityBuilder<AppAbility>(
        PureAbility,
      );

      const rules = JSON.parse(cachedRules) as SubjectRawRule<
        Actions,
        ExtractSubjectType<Subjects>,
        unknown
      >[];

      rules.forEach((rule) => {
        if (rule.inverted) {
          if (rule.fields?.length && !rule.conditions) {
            cannot(rule.action, rule.subject, rule.fields).because(rule.reason);
          }
          if (rule.conditions && !rule.fields?.length)
            cannot(rule.action, rule.subject, rule.conditions).because(
              rule.reason,
            );
          if (rule.conditions && rule.fields?.length) {
            cannot(
              rule.action,
              rule.subject,
              rule.fields,
              rule.conditions,
            ).because(rule.reason);
          }
          if (!rule.conditions && !rule.fields?.length) {
            cannot(rule.action, rule.subject).because(rule.reason);
          }
        } else {
          if (rule.fields?.length && !rule.conditions) {
            can(rule.action, rule.subject, rule.fields).because(rule.reason);
          }
          if (rule.conditions && !rule.fields?.length)
            can(rule.action, rule.subject, rule.conditions).because(
              rule.reason,
            );
          if (rule.conditions && rule.fields?.length) {
            can(
              rule.action,
              rule.subject,
              rule.fields,
              rule.conditions,
            ).because(rule.reason);
          }
          if (!rule.conditions && !rule.fields?.length) {
            can(rule.action, rule.subject).because(rule.reason);
          }
        }
      });
      return build({
        fieldMatcher: fieldMatcher,
        conditionsMatcher: lambdaMatcher,
        detectSubjectType: (item) =>
          item.constructor as ExtractSubjectType<Subjects>,
      });
    }

    const { can, cannot, build } = new AbilityBuilder<AppAbility>(PureAbility);

    const roles =
      (await this.usersService.RolesOfUserWithItsPermissions(user.id)) || [];

    if (user?.isAdmin === true) {
      can('manage', 'all');
    } else {
      for (const role of roles) {
        const rules = role.permissions as SubjectRawRule<
          Actions,
          ExtractSubjectType<Subjects>,
          unknown
        >[];

        for (const rule of rules) {
          if (rule.inverted) {
            if (rule.fields?.length && !rule.conditions) {
              cannot(rule.action, rule.subject, rule.fields).because(
                rule.reason,
              );
            }
            if (rule.conditions && !rule.fields?.length)
              cannot(rule.action, rule.subject, rule.conditions).because(
                rule.reason,
              );
            if (rule.conditions && rule.fields?.length) {
              cannot(
                rule.action,
                rule.subject,
                rule.fields,
                rule.conditions,
              ).because(rule.reason);
            }
            if (!rule.conditions && !rule.fields?.length) {
              cannot(rule.action, rule.subject).because(rule.reason);
            }
          } else {
            if (rule.fields?.length && !rule.conditions) {
              can(rule.action, rule.subject, rule.fields).because(rule.reason);
            }
            if (rule.conditions && !rule.fields?.length)
              can(rule.action, rule.subject, rule.conditions).because(
                rule.reason,
              );
            if (rule.conditions && rule.fields?.length) {
              can(
                rule.action,
                rule.subject,
                rule.fields,
                rule.conditions,
              ).because(rule.reason);
            }
            if (!rule.conditions && !rule.fields?.length) {
              can(rule.action, rule.subject).because(rule.reason);
            }
          }
        }
      }
    }

    try {
      const ability = build({
        fieldMatcher: fieldMatcher,
        conditionsMatcher: lambdaMatcher,
        detectSubjectType: (item) =>
          item.constructor as ExtractSubjectType<Subjects>,
      });

      // Cache the generated rueles
      await this.cacheManager.set(
        cacheKey,
        JSON.stringify(ability.rules),
        3600 * 24,
      );

      return ability;
    } catch (e) {
      console.error('error occured while generating ability: ', e);
    }
  }
}
