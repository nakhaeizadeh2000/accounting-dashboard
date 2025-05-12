import { Request, Body, Res, Response } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import {
  authControllerDecorators,
  loginEndpointDecorators,
  logoutEndpointDecorators,
  registerEndpointDecorators,
} from '../decorators/combined-decorators';
import { FastifyRequest, FastifyReply } from 'fastify';

@authControllerDecorators()
export class AuthController {
  constructor(private authService: AuthService) { }

  @loginEndpointDecorators()
  async login(
    @Request() req,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    return this.authService.login(req.user, response);
  }

  @registerEndpointDecorators()
  async register(@Body() body: RegisterDto) {
    return this.authService.register({ ...body, isAdmin: false });
  }

  @logoutEndpointDecorators()
  async logout(
    @Request() req: FastifyRequest,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    return this.authService.logout(
      req.cookies['access_token'] ||
      req.headers.authorization?.split(' ')[1] ||
      null,
      response,
    ); // pass accessToken to logout service.
  }
}
