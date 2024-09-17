import { FindOptionsWhere } from 'typeorm';
import { AppAbility } from '../casl-ability.factory';
import { Actions } from '../actions';
import { User } from 'src/users/entities/user.entity';
import { ResponseUserDto } from 'src/users/dto/response-user.dto';

// Overload signatures
export function buildQueryforUser(
  ability: AppAbility,
  action: Actions,
  user: ResponseUserDto,
): FindOptionsWhere<User>;

export function buildQueryforUser(
  ability: AppAbility,
  action: Actions,
  user: ResponseUserDto,
  alias: string,
): [string, object];

// Implementation
export function buildQueryforUser(
  ability: AppAbility,
  action: Actions,
  user: ResponseUserDto,
  alias?: string,
): FindOptionsWhere<User> | [string, object] {
  const conditions: FindOptionsWhere<User> = {};

  if (user.isAdmin || ability.can('super-modify', 'User')) {
    return conditions; // No conditions needed for admin or super-modify
  }

  if (ability.can(action, 'User')) {
    conditions.id = user.id;

    // define advanced and specific conditions for each action
    switch (action) {
      case 'read':
        // statement
        break;
      case 'update':
        // statement
        break;
      case 'delete':
        // statement
        break;
    }

    if (alias) {
      // Automatically create the condition for the query builder
      return [`${alias}.id = :userId`, { userId: conditions.id }];
    }
  }

  return conditions; // Return conditions for repository method
}
