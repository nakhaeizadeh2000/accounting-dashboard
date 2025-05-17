import { SetMetadata } from '@nestjs/common';
import { Action } from '../types/actions';

export const ABILITY_METADATA_KEY = 'required_ability';

/**
 * Simple decorator to check if a user has permission to perform an action on a subject
 * @param action The action to check (create, read, update, delete, etc.)
 * @param subject The subject to check (Article, User, etc.)
 */
export const RequireAbility = (action: Action, subject: string) =>
  SetMetadata(ABILITY_METADATA_KEY, { action, subject });
