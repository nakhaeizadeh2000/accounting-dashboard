import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaslService } from '../casl.service';
import { ABILITY_METADATA_KEY } from '../decorators/ability.decorator';

@Injectable()
export class AbilitiesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslService: CaslService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get the required ability from the handler metadata
    const requiredAbility = this.reflector.get<{
      action: string;
      subject: string;
    }>(ABILITY_METADATA_KEY, context.getHandler());

    // If no ability is required, allow access
    if (!requiredAbility) {
      return true;
    }

    // Get the user from the request
    const { user } = context.switchToHttp().getRequest();
    if (!user?.id) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if the user has the required ability
    const { action, subject } = requiredAbility;
    const hasAbility = await this.caslService.can(user.id, action, subject);

    if (!hasAbility) {
      throw new ForbiddenException(
        `You don't have permission to ${action} ${subject}`,
      );
    }

    return true;
  }
}
