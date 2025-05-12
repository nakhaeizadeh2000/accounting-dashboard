import {
  applyDecorators,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { PoliciesGuard } from 'src/modules/casl/guards/policies.guard';
import { ResponseUserDto } from '../dto/response-user.dto';
import { AppAbility } from 'src/modules/casl/abilities/casl-ability.factory';
import { PaginationApiQuery } from 'src/common/decorators/pagination/pagination-api-query.decorator';
import { ResponseUserRoleDto } from '../dto/response-user-role.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { CheckPolicies } from 'src/modules/casl/decorators/check-policies.decorator';

// controller
export function usersControllerDecorators() {
  return applyDecorators(
    ApiTags('users'),
    Controller('users'),
    UseGuards(JwtAuthGuard, PoliciesGuard),
    ApiBearerAuth(),
  );
}

// create
export function usersCreateEndpointDecorators() {
  return applyDecorators(
    Post(),
    ApiOperation({ summary: 'Create a new user' }),
    ApiResponse({
      status: 201,
      description: 'The user as been successfully created.',
      type: ResponseUserDto,
    }),
    ApiBody({ type: CreateUserDto }),
    CheckPolicies(
      (ability: AppAbility) =>
        ability.can('create', 'User') || ability.can('super-modify', 'User'),
    ),
  );
}

// findAll
export function userFindAllEndpointDecorators() {
  return applyDecorators(
    Get(),
    ApiOperation({ summary: 'Get all users' }),
    ApiResponse({
      status: 200,
      description: 'Return all users.',
      type: [ResponseUserRoleDto],
    }),
    PaginationApiQuery(),
    CheckPolicies((ability: AppAbility) => {
      return ability.can('read', 'User') || ability.can('super-modify', 'User');
    }),
  );
}

// findOne
export function userFindOneEndpointDecorators() {
  return applyDecorators(
    Get(':id'),
    ApiOperation({ summary: 'Get a specific user' }),
    ApiResponse({
      status: 200,
      description: 'Return the user.',
      type: ResponseUserRoleDto,
    }),
    CheckPolicies(
      (ability: AppAbility) =>
        ability.can('read', 'User') || ability.can('super-modify', 'User'),
    ),
  );
}

// update
export function userUpdateEndpointDecorators() {
  return applyDecorators(
    Put(':id'),
    ApiOperation({ summary: 'Update an user' }),
    ApiBody({ type: UpdateUserDto }),
    ApiResponse({
      status: 200,
      description: 'The user has been successfully updated.',
      type: ResponseUserRoleDto,
    }),
    CheckPolicies(
      (ability: AppAbility) =>
        ability.can('update', 'User') || ability.can('super-modify', 'User'),
    ),
  );
}

// updateUserRoles;
export function updateUserRolesEndpointDecorators() {
  return applyDecorators(
    Put('update-user-roles/:id'),
    ApiOperation({ summary: 'Update roles of a user' }),
    ApiResponse({
      status: 200,
      description: 'The user roles has been successfully updated.',
      type: ResponseUserRoleDto,
    }),
    CheckPolicies((ability: AppAbility) => {
      return (
        ability.can('update-user-roles', 'User') ||
        ability.can('super-modify', 'User')
      );
    }),
  );
}

// delete
export function userDeleteEndpointDecorators() {
  return applyDecorators(
    Delete(':id'),
    ApiOperation({ summary: 'Delete an user' }),
    ApiResponse({
      status: 200,
      description: 'The user has been successfully deleted.',
    }),
    CheckPolicies(
      (ability: AppAbility) =>
        ability.can('delete', 'User') || ability.can('super-modify', 'User'),
    ),
  );
}
