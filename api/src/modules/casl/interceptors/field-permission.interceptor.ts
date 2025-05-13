import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CaslService } from '../casl.service';

@Injectable()
export class FieldPermissionInterceptor implements NestInterceptor {
  constructor(private caslService: CaslService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) {
      return next.handle(); // No user, no filtering
    }

    // Get the entity type from the route
    const entityType = this.getEntityTypeFromRoute(request);

    if (!entityType) {
      return next.handle(); // No entity type, no filtering
    }

    // Get the user's ability
    const ability = await this.caslService.getUserAbility(userId);

    return next
      .handle()
      .pipe(map((data) => this.filterResponseData(data, ability, entityType)));
  }

  /**
   * Extract entity type from the route
   * This is a simple implementation - you might need to customize this
   * based on your routing conventions
   */
  private getEntityTypeFromRoute(request: any): string | null {
    // Example: for /articles route, return 'Article'
    const path = request.route.path;
    const segments = path.split('/').filter(Boolean);

    if (segments.length > 0) {
      // Convert 'articles' to 'Article'
      const entityName = segments[0];
      return entityName.charAt(0).toUpperCase() + entityName.slice(1, -1);
    }

    return null;
  }

  /**
   * Filter response data based on field permissions
   */
  private filterResponseData(data: any, ability: any, entityType: string): any {
    if (!data) return data;

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map((item) => this.filterObject(item, ability, entityType));
    }

    // Handle pagination objects
    if (data.items && Array.isArray(data.items)) {
      return {
        ...data,
        items: data.items.map((item) =>
          this.filterObject(item, ability, entityType),
        ),
      };
    }

    // Handle single objects
    return this.filterObject(data, ability, entityType);
  }

  /**
   * Filter a single object's fields based on permissions
   */
  private filterObject(obj: any, ability: any, entityType: string): any {
    if (!obj || typeof obj !== 'object') return obj;

    const result = { ...obj };

    for (const field of Object.keys(obj)) {
      if (ability.cannot('read', entityType, field)) {
        delete result[field];
      }
    }

    return result;
  }
}
