import {
  applyDecorators,
  Controller,
  Delete,
  Get,
  Patch,
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
import { JwtAuthGuard } from 'common/guards/jwt-auth.guard';
import { CheckPolicies } from 'src/casl/check-policies.decorator';
import { PoliciesGuard } from 'src/casl/policies.guard';
import { AppAbility } from 'src/casl/casl-ability.factory/casl-ability.factory';
import { Actions } from 'src/casl/casl-ability.factory/actions';
import { PaginationApiQuery } from 'common/decorators/pagination-api-query.decorator';
import { CreateRoleDto } from '../dto/create-role.dto';
import { Role } from '../entities/role.entity';
import { ResponseRoleDto } from '../dto/response-role.dto';

// controller
export function roleControllerDecorators() {
  return applyDecorators(
    ApiTags('role'),
    Controller('role'),
    UseGuards(JwtAuthGuard, PoliciesGuard),
    ApiBearerAuth(),
  );
}

// create
export function roleCreateEndpointDecorators() {
  return applyDecorators(
    Post(),
    ApiOperation({ summary: 'Create a new role' }),
    ApiResponse({
      status: 201,
      description: 'The role as been successfully created.',
      type: ResponseRoleDto,
    }),
    ApiBody({ type: CreateRoleDto }),
    CheckPolicies(
      (ability: AppAbility) =>
        ability.can('create', 'Role') || ability.can('super-modify', 'Role'),
    ),
  );
}

// findAll
export function roleFindAllEndpointDecorators() {
  return applyDecorators(
    Get(),
    ApiOperation({ summary: 'Get all roles' }),
    ApiResponse({
      status: 200,
      description: 'Return all roles.',
      type: [ResponseRoleDto],
    }),
    PaginationApiQuery(),
    CheckPolicies((ability: AppAbility) => {
      return ability.can('read', 'Role') || ability.can('super-modify', 'Role');
    }),
  );
}

// findOne
export function roleFindOneEndpointDecorators() {
  return applyDecorators(
    Get(':id'),
    ApiOperation({ summary: 'Get a specific role' }),
    ApiResponse({
      status: 200,
      description: 'Return the role.',
      type: ResponseRoleDto,
    }),
    ApiResponse({ status: 404, description: 'Role not found.' }),
    CheckPolicies(
      (ability: AppAbility) =>
        ability.can('read', 'Role') || ability.can('super-modify', 'Role'),
    ),
  );
}

// update
export function roleUpdateEndpointDecorators() {
  return applyDecorators(
    Put(':id'),
    ApiOperation({ summary: 'Update an role' }),
    ApiResponse({
      status: 200,
      description: 'The role has been successfully updated.',
      type: ResponseRoleDto,
    }),
    CheckPolicies(
      (ability: AppAbility) =>
        ability.can('update', 'Role') || ability.can('super-modify', 'Role'),
    ),
  );
}

// delete
export function roleDeleteEndpointDecorators() {
  return applyDecorators(
    Delete(':id'),
    ApiOperation({ summary: 'Delete an role' }),
    ApiResponse({
      status: 200,
      description: 'The role has been successfully deleted.',
    }),
    CheckPolicies(
      (ability: AppAbility) =>
        ability.can('delete', 'Role') || ability.can('super-modify', 'Role'),
    ),
  );
}
