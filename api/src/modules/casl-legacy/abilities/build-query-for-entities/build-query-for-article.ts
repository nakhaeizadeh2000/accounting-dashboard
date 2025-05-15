import { FindOptionsWhere } from 'typeorm';
import { AppAbility } from '../casl-ability.factory';
import { Actions } from '../actions';
import { Article } from 'src/modules/articles/entities/article.entity';
import { ResponseUserDto } from 'src/modules/users/dto/response-user.dto';

// Overload signatures
export function buildQueryforArticle(
  ability: AppAbility,
  action: Actions,
  user: ResponseUserDto,
): FindOptionsWhere<Article>;

export function buildQueryforArticle(
  ability: AppAbility,
  action: Actions,
  user: ResponseUserDto,
  alias: string,
): [string, object];

// Implementation
export function buildQueryforArticle(
  ability: AppAbility,
  action: Actions,
  user: ResponseUserDto,
  alias?: string,
): FindOptionsWhere<Article> | [string, object] {
  const conditions: FindOptionsWhere<Article> = {};

  if (user.isAdmin || ability.can('super-modify', 'Article')) {
    return conditions; // No conditions needed for admin or super-modify
  }

  if (ability.can(action, 'Article')) {
    conditions.authorId = user.id;

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
      return [
        `${alias}.authorId = :authorId`,
        { authorId: conditions.authorId },
      ];
    }
  }

  return conditions; // Return conditions for repository method
}
