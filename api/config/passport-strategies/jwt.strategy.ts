import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessTokenPayloadDto } from 'src/auth/dto/access-token-payload.dto';
import { ResponseUserDto } from 'src/users/dto/response-user.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { plainToInstance } from 'class-transformer';
import { RefreshTokenDto } from 'src/auth/dto/refresh-token.dto';
import { Cache } from 'cache-manager';
import { cookieExtractor } from 'common/functions/cookie-extractor';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
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
          const { roles, ...pureUser } = rt[0].user;
          return pureUser; //  Return the user object cause both user and refreshToken found and refreshToken is valid
        }
      } else {
        // TODO: if RT was valid but AT was expired, should remove previous AT cookie and set new generated AT and AT must be at first place set as cookie at the end of login (instead of returning AT to user that right now happens)
        throw new UnauthorizedException('Invalid RefreshToken');
      }
    }

    return null; // Return the null cause user or refreshToken is not found or refreshToken is not valid
  }
}
