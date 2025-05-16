import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CaslAbilityFactory, AppAbility } from './casl-ability.factory';
import { Action } from './types/actions';

@Injectable()
export class CaslService {
  private readonly logger = new Logger(CaslService.name);
  private readonly CACHE_TTL = 3600000; // 1 hour in milliseconds

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(User) private userRepository: Repository<User>,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  /**
   * Get a user's ability object, using cache when available
   */
  async getUserAbility(userId: string): Promise<AppAbility> {
    const cacheKey = `user_abilities_${userId}`;

    try {
      this.logger.debug(`[CASL] Getting abilities for user ${userId}`);

      // Try to get from cache first
      let cacheData = await this.cacheManager.get<{ rules: any[] }>(cacheKey);

      if (!cacheData) {
        this.logger.debug(`[CASL] Cache miss for user abilities: ${userId}`);

        // If not in cache, fetch from database
        const user = await this.userRepository.findOne({
          where: { id: userId },
          relations: ['roles', 'roles.permissions'],
        });

        if (!user) {
          this.logger.error(`[CASL] User not found: ${userId}`);
          throw new Error(`User not found: ${userId}`);
        }

        this.logger.debug(
          `[CASL] User ${userId} has ${user.roles.length} roles`,
        );

        // Get all permissions from user's roles
        const permissions = user.roles.flatMap((role) => role.permissions);
        this.logger.debug(
          `[CASL] User ${userId} has ${permissions.length} permissions`,
        );

        // Log detailed permissions
        permissions.forEach((permission, index) => {
          this.logger.debug(
            `[CASL] Permission ${index + 1}: ${permission.action} ${permission.subject}`,
          );
        });

        // Build ability object
        const userAbility = this.caslAbilityFactory.createForUser(
          user,
          permissions,
        );
        this.logger.debug(`[CASL] Created ability for user ${userId}`);

        // Store only the rules in cache, not the whole ability object
        const rulesToCache = { rules: userAbility.rules };
        await this.cacheManager.set(cacheKey, rulesToCache, this.CACHE_TTL);
        this.logger.debug(`[CASL] Cached user abilities rules for: ${userId}`);

        return userAbility;
      } else {
        this.logger.debug(`[CASL] Cache hit for user abilities: ${userId}`);

        // Recreate the ability object from cached rules
        if (!cacheData.rules) {
          this.logger.warn(`[CASL] Invalid cache format, rebuilding ability`);
          await this.cacheManager.del(cacheKey);
          return this.getUserAbility(userId);
        }

        // Recreate the ability using the factory
        const ability = this.caslAbilityFactory.createFromRules(
          cacheData.rules,
        );
        this.logger.debug(`[CASL] Recreated ability from cached rules`);
        return ability;
      }
    } catch (error) {
      this.logger.error(
        `[CASL] Error getting user abilities: ${error.message}`,
        error.stack,
      );

      // If there's an error with cached data, invalidate and try again
      if (error.message.includes('not a function')) {
        this.logger.warn(
          `[CASL] Invalid ability object in cache, clearing and rebuilding`,
        );
        await this.cacheManager.del(cacheKey);

        // Recursive call after clearing cache - need to be careful about infinite loops
        return this.getUserAbility(userId);
      }

      throw error;
    }
  }

  /**
   * Invalidate a user's cached abilities
   */
  async invalidateUserAbilitiesCache(userId: string): Promise<void> {
    try {
      const cacheKey = `user_abilities_${userId}`;
      await this.cacheManager.del(cacheKey);
      this.logger.debug(`Invalidated cache for user: ${userId}`);
    } catch (error) {
      this.logger.error(
        `Error invalidating cache: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Check if a user can perform an action on a subject
   */
  async can(
    userId: string,
    action: Action | string,
    subject: any,
    field?: string,
  ): Promise<boolean> {
    const ability = await this.getUserAbility(userId);
    return field
      ? ability.can(action, subject, field)
      : ability.can(action, subject);
  }

  /**
   * Check if a user cannot perform an action on a subject
   */
  async cannot(
    userId: string,
    action: Action | string,
    subject: any,
    field?: string,
  ): Promise<boolean> {
    const ability = await this.getUserAbility(userId);
    return field
      ? ability.cannot(action, subject, field)
      : ability.cannot(action, subject);
  }
}
