import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_ADMIN_KEY } from '../decorators/roles.decorator';

@Injectable()
export class IsAdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requireToBeAdmin = this.reflector.getAllAndOverride<boolean>(
      IS_ADMIN_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requireToBeAdmin) {
      return true; // its not need to be admin
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new UnauthorizedException(
        'لطفا ابتدا اهراز هویت خود را انجام دهید',
      );
    } else if (!requireToBeAdmin) {
      throw new ForbiddenException('شما دسترسی لازم را ندارید');
    }

    return true; // User is Admin
  }
}
