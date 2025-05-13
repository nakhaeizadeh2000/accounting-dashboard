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
import { PoliciesGuard } from 'src/modules/casl-legacy/guards/policies.guard';
import { AppAbility } from 'src/modules/casl-legacy/abilities/casl-ability.factory';
import { PaginationApiQuery } from 'src/common/decorators/pagination/pagination-api-query.decorator';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { ResponsePermissionDto } from '../dto/response-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { CheckPolicies } from 'src/modules/casl-legacy/decorators/check-policies.decorator';

// controller
export function permissionControllerDecorators() {
  return applyDecorators(
    ApiTags('permission'),
    Controller('permission'),
    UseGuards(JwtAuthGuard, PoliciesGuard),
    ApiBearerAuth(),
  );
}

// create
export function permissionCreateEndpointDecorators() {
  return applyDecorators(
    Post(),
    ApiOperation({ summary: 'Create a new permissions' }),
    ApiResponse({
      status: 201,
      description: 'The permissions as been successfully created.',
      type: ResponsePermissionDto,
    }),
    ApiBody({ type: CreatePermissionDto }),
    CheckPolicies(
      (ability: AppAbility) =>
        ability.can('create', 'Permission') ||
        ability.can('super-modify', 'Permission'),
    ),
  );
}

// findAll
export function permissionFindAllEndpointDecorators() {
  return applyDecorators(
    Get(),
    ApiOperation({ summary: 'Get all permissionss' }),
    ApiResponse({
      status: 200,
      description: 'Return all permissionss.',
      type: [ResponsePermissionDto],
    }),
    PaginationApiQuery(),
    CheckPolicies(
      (ability: AppAbility) =>
        ability.can('read', 'Permission') ||
        ability.can('super-modify', 'Permission'),
    ),
  );
}

// findOne
export function permissionFindOneEndpointDecorators() {
  return applyDecorators(
    Get(':id'),
    ApiOperation({ summary: 'Get a specific permissions' }),
    ApiResponse({
      status: 200,
      description: 'Return the permissions.',
      type: ResponsePermissionDto,
    }),
    ApiResponse({ status: 404, description: 'Permissions not found.' }),
    CheckPolicies(
      (ability: AppAbility) =>
        ability.can('read', 'Permission') ||
        ability.can('super-modify', 'Permission'),
    ),
  );
}

// update
export function permissionUpdateEndpointDecorators() {
  return applyDecorators(
    Put(':id'),
    ApiOperation({ summary: 'Update an permissions' }),
    ApiBody({ type: UpdatePermissionDto }),
    ApiResponse({
      status: 200,
      description: 'The permissions has been successfully updated.',
      type: ResponsePermissionDto,
    }),
    CheckPolicies(
      (ability: AppAbility) =>
        ability.can('update', 'Permission') ||
        ability.can('super-modify', 'Permission'),
    ),
  );
}

// delete
export function permissionDeleteEndpointDecorators() {
  return applyDecorators(
    Delete(':id'),
    ApiOperation({ summary: 'Delete an permissions' }),
    ApiResponse({
      status: 200,
      description: 'The permissions has been successfully deleted.',
    }),
    CheckPolicies(
      (ability: AppAbility) =>
        ability.can('delete', 'Permission') ||
        ability.can('super-modify', 'Permission'),
    ),
  );
}
