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
    const pureUser = await this.validateUserByRT(payload);
    if (!pureUser) {
      throw new UnauthorizedException('Invalid AccessToken');
    }
    return pureUser; //returned value will be set as user metadata in request
  }

  async validateUserByRT(
    payload: AccessTokenPayloadDto,
  ): Promise<ResponseUserDto | null> {
    const cacheKey = `refresh_tokens_by_user_id_${payload.user_id}`;

    try {
      const cachedRefreshTokens = await this.cacheManager.get<string>(cacheKey);

      const refreshTokens = cachedRefreshTokens
        ? plainToInstance(RefreshTokenDto, JSON.parse(cachedRefreshTokens), {
            excludeExtraneousValues: true,
          })
        : null;

      if (refreshTokens) {
        const rt = refreshTokens.refreshTokens.filter(
          (rt) => rt.id === payload.refresh_token_id,
        );

        if (rt.length === 1) {
          const currentDate = new Date();
          const expirationDate = new Date(rt[0].expiresAt);

          if (currentDate < expirationDate) {
            // Return the entire user object WITH roles
            return rt[0].user;
          }
        } else {
          throw new UnauthorizedException('Invalid RefreshToken');
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to validate user: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Authentication system error');
    }

    return null;
  }
}
