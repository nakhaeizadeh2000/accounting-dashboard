import { SetMetadata } from '@nestjs/common';
import { AppAbility } from '../casl-ability.factory';
import { Action } from '../types/actions';
import { SubjectString } from '../types/subjects';

export const CHECK_POLICIES_KEY = 'check_policy';

export type PolicyHandler = (ability: AppAbility) => boolean;

export class PolicyHandlerObject {
  handle(ability: AppAbility): boolean {
    return true;
  }
}

export type PolicyHandlerType = PolicyHandler | PolicyHandlerObject;

/**
 * Decorator to check if user has required ability
 */
export const CheckPolicies = (...handlers: PolicyHandlerType[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers);

/**
 * Helper function to create a policy handler that checks a specific action and subject
 */
export const createPolicyHandler = (
  action: Action,
  subject: SubjectString,
): PolicyHandler => {
  return (ability: AppAbility) => {
    // This cast is necessary to make TypeScript happy
    const subjectType = subject as unknown as any;
    return ability.can(action, subjectType);
  };
};

/**
 * Pre-defined policy decorators for common operations
 */
export const CanRead = (subject: SubjectString) =>
  CheckPolicies(createPolicyHandler(Action.READ, subject));

export const CanCreate = (subject: SubjectString) =>
  CheckPolicies(createPolicyHandler(Action.CREATE, subject));

export const CanUpdate = (subject: SubjectString) =>
  CheckPolicies(createPolicyHandler(Action.UPDATE, subject));

export const CanDelete = (subject: SubjectString) =>
  CheckPolicies(createPolicyHandler(Action.DELETE, subject));
