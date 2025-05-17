import { ConflictException, Inject, Injectable } from '@nestjs/common';
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
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async login(user: User, response: FastifyReply): Promise<ResponseLoginDto> {
    const cacheKey = `refresh_tokens_by_user_id_${user.id}`;
    const cachedRefreshTokens = await this.cacheManager.get<string>(cacheKey);

    const refreshTokenExpirationTimeInSeconds =
      +this.configService.get<string>('REFRESH_TOKEN_TTL');
    const accessTokenExpirationTimeInSeconds =
      +this.configService.get<string>('ACCESS_TOKEN_TTL');

    // TODO: should add device and browser informations to each generated RT in each login proccess.

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
    const newRefreshTokens: RefreshTokenDto = {
      refreshTokens: [newRefreshTokenPayload],
    };

    if (cachedRefreshTokens) {
      await this.cacheManager.del(cacheKey);
      const oldRefreshTokens = plainToInstance(
        RefreshTokenDto,
        JSON.parse(cachedRefreshTokens),
        { excludeExtraneousValues: true },
      );
      newRefreshTokens.refreshTokens.push(...oldRefreshTokens.refreshTokens);
    }
    await this.cacheManager.set(cacheKey, JSON.stringify(newRefreshTokens));

    const accessTokenPayload: AccessTokenPayloadDto = {
      user_id: user.id,
      refresh_token_id: newRefreshTokenPayload.id,
    };

    const access_token = this.jwtService.sign(accessTokenPayload, {
      expiresIn: accessTokenExpirationTimeInSeconds,
    });
    // TODO: test this in production mode
    response.setCookie('access_token', access_token, {
      signed: false,
      maxAge: refreshTokenExpirationTimeInSeconds,
    });
    return {
      access_token,
      cookie_expires_in: refreshTokenExpirationTimeInSeconds,
    };
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
}
