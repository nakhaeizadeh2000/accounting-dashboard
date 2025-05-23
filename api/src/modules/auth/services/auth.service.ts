import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';
import { ResponseUserDto } from 'src/modules/users/dto/response-user.dto';
import { User } from 'src/modules/users/entities/user.entity';
import { RefreshTokenPayloadDto } from '../dto/refresh-token-payload.dto';
import { randomUUID } from 'crypto';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { ConfigService } from '@nestjs/config';
import { FastifyReply } from 'fastify';
import { ResponseUserRoleDto } from 'src/modules/users/dto/response-user-role.dto';
import { ResponseLoginDto } from '../dto/response-login.dto';
import { AccessTokenPayloadDto } from '../dto/access-token-payload.dto';
import { UsersService } from 'src/modules/users/services/user.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly refreshTokenExpirationTimeInSeconds: number;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.refreshTokenExpirationTimeInSeconds =
      +this.configService.get<string>('REFRESH_TOKEN_TTL');
  }

  async login(user: User, response: FastifyReply): Promise<ResponseLoginDto> {
    const cacheKey = `refresh_tokens_by_user_id_${user.id}`;

    const refreshTokenExpirationTimeInSeconds =
      +this.configService.get<string>('REFRESH_TOKEN_TTL');
    const accessTokenExpirationTimeInSeconds =
      +this.configService.get<string>('ACCESS_TOKEN_TTL');

    // Create new refresh token
    const newRefreshTokenPayload: RefreshTokenPayloadDto = {
      id: randomUUID(),
      userId: user.id,
      user: plainToInstance(ResponseUserRoleDto, user, {
        excludeExtraneousValues: true,
      }),
      createdAt: new Date(Date.now()).toISOString(),
      expiresAt: new Date(
        Date.now() + refreshTokenExpirationTimeInSeconds * 1000,
      ).toISOString(),
    };

    try {
      // Atomic update using a Redis-like pattern (if your cache supports it)
      await this.updateRefreshTokensAtomically(
        cacheKey,
        newRefreshTokenPayload,
      );

      // Generate access token
      const accessTokenPayload: AccessTokenPayloadDto = {
        user_id: user.id,
        refresh_token_id: newRefreshTokenPayload.id,
      };

      const access_token = this.jwtService.sign(accessTokenPayload, {
        expiresIn: accessTokenExpirationTimeInSeconds,
      });

      response.setCookie('access_token', access_token, {
        signed: false,
        maxAge: refreshTokenExpirationTimeInSeconds,
      });

      return {
        access_token,
        cookie_expires_in: refreshTokenExpirationTimeInSeconds,
      };
    } catch (error) {
      this.logger.error(`Failed to login user: ${error.message}`, error.stack);
      throw new InternalServerErrorException('احراز هویت ناموفق بود');
    }
  }

  // Helper method for atomic update
  private async updateRefreshTokensAtomically(
    cacheKey: string,
    newToken: RefreshTokenPayloadDto,
  ): Promise<void> {
    let retries = 3;

    while (retries > 0) {
      try {
        const cachedRefreshTokens =
          await this.cacheManager.get<string>(cacheKey);

        const newRefreshTokens: RefreshTokenDto = {
          refreshTokens: [newToken],
        };

        if (cachedRefreshTokens) {
          const oldRefreshTokens = plainToInstance(
            RefreshTokenDto,
            JSON.parse(cachedRefreshTokens),
            { excludeExtraneousValues: true },
          );

          // Clean up expired tokens
          const validOldTokens = oldRefreshTokens.refreshTokens.filter(
            (token) => !this.isTokenExpired(token.expiresAt),
          );

          // Add valid old tokens
          newRefreshTokens.refreshTokens.push(...validOldTokens);

          // Limit to max 10 active sessions per user
          if (newRefreshTokens.refreshTokens.length > 10) {
            // Sort by creation date and remove oldest
            newRefreshTokens.refreshTokens.sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime(),
            );
            newRefreshTokens.refreshTokens =
              newRefreshTokens.refreshTokens.slice(-10);
          }
        }

        await this.cacheManager.set(
          cacheKey,
          JSON.stringify(newRefreshTokens),
          this.refreshTokenExpirationTimeInSeconds,
        );

        return;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay before retry
      }
    }
  }

  private isTokenExpired(expiresAt: string): boolean {
    return new Date() > new Date(expiresAt);
  }

  async register(user: CreateUserDto): Promise<ResponseUserDto> {
    const existingUser = await this.usersService.findByEmail(user.email);

    if (existingUser) {
      throw new ConflictException('ایمیل مورد نظر قبلا استفاده شده است');
    } else {
      return await this.usersService.create(user);
    }
  }

  async logout(accessToken: string, response: FastifyReply) {
    const accessTokenPayload: AccessTokenPayloadDto =
      await this.jwtService.verifyAsync(accessToken, {
        ignoreExpiration: true,
      });

    const cacheKey = `refresh_tokens_by_user_id_${accessTokenPayload.user_id}`;
    const cachedRefreshTokens = await this.cacheManager.get<string>(cacheKey);
    if (cachedRefreshTokens) {
      await this.cacheManager.del(cacheKey);
      const oldRefreshTokens = plainToInstance(
        RefreshTokenDto,
        JSON.parse(cachedRefreshTokens),
        { excludeExtraneousValues: true },
      );

      const filteredRefreshTokenDto = oldRefreshTokens.refreshTokens.filter(
        (rt) => rt.id !== accessTokenPayload.refresh_token_id,
      );

      const newRefreshTokens: RefreshTokenDto = {
        refreshTokens: [...filteredRefreshTokenDto],
      };
      await this.cacheManager.del(cacheKey);
      await this.cacheManager.set(cacheKey, JSON.stringify(newRefreshTokens));
      response.clearCookie('access_token');
    }
  }

  async cleanupExpiredTokens(userId: string): Promise<void> {
    const cacheKey = `refresh_tokens_by_user_id_${userId}`;

    try {
      const cachedRefreshTokens = await this.cacheManager.get<string>(cacheKey);
      if (!cachedRefreshTokens) return;

      const refreshTokens = plainToInstance(
        RefreshTokenDto,
        JSON.parse(cachedRefreshTokens),
        { excludeExtraneousValues: true },
      );

      const now = new Date();
      const validTokens = refreshTokens.refreshTokens.filter(
        (token) => new Date(token.expiresAt) > now,
      );

      // If no change in token count, return early
      if (validTokens.length === refreshTokens.refreshTokens.length) return;

      // Update cache with valid tokens only
      await this.cacheManager.set(
        cacheKey,
        JSON.stringify({ refreshTokens: validTokens }),
        this.refreshTokenExpirationTimeInSeconds,
      );
    } catch (error) {
      this.logger.error(
        `Failed to cleanup tokens for user ${userId}: ${error.message}`,
      );
    }
  }

  async getActiveSessions(userId: string) {
    const cacheKey = `refresh_tokens_by_user_id_${userId}`;

    try {
      await this.cleanupExpiredTokens(userId);

      const cachedRefreshTokens = await this.cacheManager.get<string>(cacheKey);
      if (!cachedRefreshTokens) return { sessions: [] };

      const refreshTokens = plainToInstance(
        RefreshTokenDto,
        JSON.parse(cachedRefreshTokens),
        { excludeExtraneousValues: true },
      );

      // Return sanitized session data
      return {
        sessions: refreshTokens.refreshTokens.map((token) => ({
          id: token.id,
          createdAt: token.createdAt,
          expiresAt: token.expiresAt,
        })),
      };
    } catch (error) {
      this.logger.error(
        `Failed to get sessions for user ${userId}: ${error.message}`,
      );
      throw new InternalServerErrorException('خطا در بازیابی نشست‌های فعال');
    }
  }

  async terminateSession(userId: string, sessionId: string) {
    const cacheKey = `refresh_tokens_by_user_id_${userId}`;

    try {
      const cachedRefreshTokens = await this.cacheManager.get<string>(cacheKey);
      if (!cachedRefreshTokens)
        return { success: false, message: ['هیچ نشست فعالی وجود ندارد'] };

      const refreshTokens = plainToInstance(
        RefreshTokenDto,
        JSON.parse(cachedRefreshTokens),
        { excludeExtraneousValues: true },
      );

      const filteredTokens = refreshTokens.refreshTokens.filter(
        (token) => token.id !== sessionId,
      );

      if (filteredTokens.length === refreshTokens.refreshTokens.length) {
        return { success: false, message: ['نشست مورد نظر یافت نشد'] };
      }

      await this.cacheManager.set(
        cacheKey,
        JSON.stringify({ refreshTokens: filteredTokens }),
        this.refreshTokenExpirationTimeInSeconds,
      );

      return { success: true, message: ['نشست با موفقیت خاتمه یافت'] };
    } catch (error) {
      this.logger.error(
        `Failed to terminate session for user ${userId}: ${error.message}`,
      );
      throw new InternalServerErrorException('خطا در خاتمه دادن به نشست');
    }
  }
}
