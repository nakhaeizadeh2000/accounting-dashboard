import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaslAbilityFactory } from '../casl-ability.factory';
import {
  CHECK_POLICIES_KEY,
  PolicyHandlerType,
} from '../decorators/check-policies.decorator';

@Injectable()
export class AbilitiesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers =
      this.reflector.get<PolicyHandlerType[]>(
        CHECK_POLICIES_KEY,
        context.getHandler(),
      ) || [];

    if (policyHandlers.length === 0) {
      return true; // No policies to check
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get all user's permissions from roles
    const permissions = user.roles?.flatMap((role) => role.permissions) || [];

    // Create the ability object
    const ability = this.caslAbilityFactory.createForUser(user, permissions);

    // Check if the user meets all the required policies
    const results = policyHandlers.map((handler) =>
      typeof handler === 'function'
        ? handler(ability)
        : handler.handle(ability),
    );

    // User must pass all policy checks
    return results.every((result) => result === true);
  }
}
