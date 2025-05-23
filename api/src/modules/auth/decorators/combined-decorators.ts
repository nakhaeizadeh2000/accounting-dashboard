import {
  applyDecorators,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard } from 'src/modules/auth/guards/local-auth.guard';
import { LoginBodyDto } from '../dto/login-body.dto';
import { ResponseUserDto } from 'src/modules/users/dto/response-user.dto';
import { RegisterDto } from '../dto/register.dto';
import { LogoutBodyDto } from '../dto/logout-body.dto';
import { SwaggerLoginResponseDto } from '../dto/swagger-login-response.dto';

// controller
export function authControllerDecorators() {
  return applyDecorators(ApiTags('auth'), Controller('auth'));
}

// login
export function loginEndpointDecorators() {
  return applyDecorators(
    UseGuards(LocalAuthGuard),
    Post('login'),
    ApiOperation({ summary: 'login' }),
    ApiBody({ type: LoginBodyDto }),
    ApiResponse({
      status: 201,
      description: 'User login has been successfully.',
      type: SwaggerLoginResponseDto,
    }),
  );
}

// register
export function registerEndpointDecorators() {
  return applyDecorators(
    Post('register'),
    ApiOperation({ summary: 'register' }),
    ApiBody({ type: RegisterDto }),
    ApiResponse({
      type: ResponseUserDto,
    }),
  );
}

// logout
export function logoutEndpointDecorators() {
  return applyDecorators(
    Post('logout'),
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'logout' }),
    ApiBody({ type: LogoutBodyDto }),
  );
}
