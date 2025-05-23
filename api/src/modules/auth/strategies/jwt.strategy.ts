import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessTokenPayloadDto } from 'src/modules/auth/dto/access-token-payload.dto';
import { ResponseUserDto } from 'src/modules/users/dto/response-user.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { plainToInstance } from 'class-transformer';
import { RefreshTokenDto } from 'src/modules/auth/dto/refresh-token.dto';
import { Cache } from 'cache-manager';
import { cookieExtractor } from 'src/common/utils/cookie-extractor';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: cookieExtractor,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      // Add ignoreExpiration to handle expired tokens explicitly
      ignoreExpiration: false,
      // Add passReqToCallback to handle missing tokens
      passReqToCallback: false,
    });
  }

  async validate(payload: AccessTokenPayloadDto) {
    try {
      // First check if payload exists at all
      if (!payload) {
        throw new UnauthorizedException('فرمت توکن نامعتبر است');
      }

      const user = await this.validateUserByRT(payload);
      return user; // returned value will be set as user metadata in request
    } catch (error) {
      this.logger.debug(`JWT validation error: ${error.message}`);

      // Always throw UnauthorizedException for any JWT-related errors
      // to ensure 401 is returned instead of 500
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      // Convert any other errors to UnauthorizedException
      throw new UnauthorizedException('توکن دسترسی (access token) نامعتبر است');
    }
  }

  /**
   * Validates user by refresh token
   * @param payload JWT token payload
   * @returns User data or throws UnauthorizedException
   */
  async validateUserByRT(
    payload: AccessTokenPayloadDto,
  ): Promise<ResponseUserDto> {
    if (!payload || !payload.user_id || !payload.refresh_token_id) {
      throw new UnauthorizedException('محتوای توکن نامعتبر است');
    }

    const cacheKey = `refresh_tokens_by_user_id_${payload.user_id}`;

    try {
      const cachedRefreshTokens = await this.cacheManager.get<string>(cacheKey);

      // Handle case when no cached tokens found
      if (!cachedRefreshTokens) {
        throw new UnauthorizedException('هیچ جلسه (sessions) فعالی یافت نشد');
      }

      const refreshTokens = plainToInstance(
        RefreshTokenDto,
        JSON.parse(cachedRefreshTokens),
        { excludeExtraneousValues: true },
      );

      // Handle case when refreshTokens is missing or empty
      if (
        !refreshTokens ||
        !refreshTokens.refreshTokens ||
        refreshTokens.refreshTokens.length === 0
      ) {
        throw new UnauthorizedException('هیچ جلسه (sessions) فعالی یافت نشد');
      }

      // Find matching refresh token
      const matchedTokens = refreshTokens.refreshTokens.filter(
        (rt) => rt.id === payload.refresh_token_id,
      );

      // Handle case when no matching token found
      if (matchedTokens.length === 0) {
        throw new UnauthorizedException(
          'توکن دسترسی (refresh token) نامعتبر است',
        );
      }

      const refreshToken = matchedTokens[0];

      // Handle case when token is expired
      const currentDate = new Date();
      const expirationDate = new Date(refreshToken.expiresAt);

      if (currentDate >= expirationDate) {
        throw new UnauthorizedException('جلسه (session) منقضی شده است');
      }

      // User validation successful
      if (!refreshToken.user) {
        throw new UnauthorizedException('اطلاعات کاربر نامعتبر است');
      }

      return refreshToken.user;
    } catch (error) {
      // Pass through unauthorized exceptions
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      // Convert all other errors to UnauthorizedException instead of InternalServerErrorException
      this.logger.error(
        `Failed to validate user: ${error.message}`,
        error.stack,
      );
      throw new UnauthorizedException('احراز هویت ناموفق بود');
    }
  }
}
