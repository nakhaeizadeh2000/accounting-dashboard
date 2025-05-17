import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
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
    });
  }

  async validate(payload: AccessTokenPayloadDto) {
    try {
      const user = await this.validateUserByRT(payload);
      return user; // returned value will be set as user metadata in request
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid access token');
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
      throw new UnauthorizedException('Invalid token payload');
    }

    const cacheKey = `refresh_tokens_by_user_id_${payload.user_id}`;

    try {
      const cachedRefreshTokens = await this.cacheManager.get<string>(cacheKey);

      // Handle case when no cached tokens found
      if (!cachedRefreshTokens) {
        throw new UnauthorizedException('No active sessions found');
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
        throw new UnauthorizedException('No active sessions found');
      }

      // Find matching refresh token
      const matchedTokens = refreshTokens.refreshTokens.filter(
        (rt) => rt.id === payload.refresh_token_id,
      );

      // Handle case when no matching token found
      if (matchedTokens.length === 0) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const refreshToken = matchedTokens[0];

      // Handle case when token is expired
      const currentDate = new Date();
      const expirationDate = new Date(refreshToken.expiresAt);

      if (currentDate >= expirationDate) {
        throw new UnauthorizedException('Session expired');
      }

      // User validation successful
      if (!refreshToken.user) {
        throw new UnauthorizedException('Invalid user data');
      }

      return refreshToken.user;
    } catch (error) {
      // Pass through unauthorized exceptions
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      // Handle unexpected errors
      this.logger.error(
        `Failed to validate user: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Authentication system error');
    }
  }
}
