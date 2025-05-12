import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { FastifyRequest, FastifyReply } from 'fastify';
import { Observable, from, mergeMap } from 'rxjs';
import { AccessTokenPayloadDto } from 'src/modules/auth/dto/access-token-payload.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { RefreshTokenDto } from 'src/modules/auth/dto/refresh-token.dto';
import { plainToInstance } from 'class-transformer';
import { RefreshTokenPayloadDto } from 'src/modules/auth/dto/refresh-token-payload.dto';
import { isIsoDateStringExpired } from 'src/common/utils/isIsoDateStringExpired';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const response = context.switchToHttp().getResponse<FastifyReply>();

    return from(this.handleToken(request, response)).pipe(
      mergeMap(() => super.canActivate(context) as Observable<boolean>),
    );
  }

  private handleToken = async (
    request: FastifyRequest,
    response: FastifyReply,
  ): Promise<void> => {
    const token = request.cookies?.['access_token'];
    if (token) {
      try {
        this.jwtService.verify(token, {
          secret: this.configService.get<string>('JWT_SECRET'),
        });
      } catch (error) {
        await this.reSignToken(
          await this.jwtService.verifyAsync(token, {
            ignoreExpiration: true,
            secret: this.configService.get<string>('JWT_SECRET'),
          }),
          request,
          response,
        );
      }
    }
  };

  private async reSignToken(
    accessToken: AccessTokenPayloadDto,
    request: FastifyRequest,
    response: FastifyReply,
  ): Promise<void> {
    const cacheKey = `refresh_tokens_by_user_id_${accessToken.user_id}`;
    const rtString = await this.cacheManager.get<string>(cacheKey);

    const verifiedRt = this.checkRefreshToken(
      rtString,
      accessToken.refresh_token_id,
    );

    if (verifiedRt) {
      const accessTokenExpirationTimeInSeconds =
        +this.configService.get<string>('ACCESS_TOKEN_TTL');
      response.clearCookie('access_token');
      const access_token = this.jwtService.sign(
        {
          refresh_token_id: accessToken.refresh_token_id,
          user_id: accessToken.user_id,
        },
        {
          expiresIn: accessTokenExpirationTimeInSeconds,
          secret: this.configService.get<string>('JWT_SECRET'),
        },
      );

      // TODO: test this in production mode
      response.setCookie('access_token', access_token, {
        maxAge: Math.floor(
          (new Date(verifiedRt.expiresAt).getTime() - Date.now()) / 1000,
        ),
        signed: false,
      });
      // Update the request object with the new token in the cookies
      request.cookies['access_token'] = access_token;
    } else {
      response.clearCookie('access_token');
      throw new UnauthorizedException('Login please');
    }
  }

  checkRefreshToken(
    refreshTokensString: string,
    refreshTokenId: string,
  ): RefreshTokenPayloadDto | void {
    const refreshTokesPlain = JSON.parse(refreshTokensString);
    if (refreshTokesPlain) {
      const refreshTokesInstance = plainToInstance(
        RefreshTokenDto,
        refreshTokesPlain,
        {
          excludeExtraneousValues: true,
        },
      );
      const targetRt = refreshTokesInstance.refreshTokens.filter(
        (rt) => rt.id === refreshTokenId,
      );
      if (
        targetRt.length === 1 &&
        !isIsoDateStringExpired(targetRt[0].expiresAt)
      ) {
        return targetRt[0];
      }
    }
  }

  handleRequest(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
