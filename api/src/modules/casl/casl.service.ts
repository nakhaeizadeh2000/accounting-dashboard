import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CaslAbilityFactory, AppAbility } from './casl-ability.factory';

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
      // Try to get from cache first
      let userAbility = await this.cacheManager.get<AppAbility>(cacheKey);

      if (!userAbility) {
        this.logger.debug(`Cache miss for user abilities: ${userId}`);

        // If not in cache, fetch from database
        const user = await this.userRepository.findOne({
          where: { id: userId },
          relations: ['roles', 'roles.permissions'],
        });

        if (!user) {
          throw new Error(`User not found: ${userId}`);
        }

        // Get all permissions from user's roles
        const permissions = user.roles.flatMap((role) => role.permissions);

        // Build ability object
        userAbility = this.caslAbilityFactory.createForUser(user, permissions);

        // Store in cache for future requests
        await this.cacheManager.set(cacheKey, userAbility, this.CACHE_TTL);
        this.logger.debug(`Cached user abilities for: ${userId}`);
      } else {
        this.logger.debug(`Cache hit for user abilities: ${userId}`);
      }

      return userAbility;
    } catch (error) {
      this.logger.error(
        `Error getting user abilities: ${error.message}`,
        error.stack,
      );
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
    action: string,
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
    action: string,
    subject: any,
    field?: string,
  ): Promise<boolean> {
    const ability = await this.getUserAbility(userId);
    return field
      ? ability.cannot(action, subject, field)
      : ability.cannot(action, subject);
  }
}
