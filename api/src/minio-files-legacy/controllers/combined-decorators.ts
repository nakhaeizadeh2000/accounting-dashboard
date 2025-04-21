import {
  applyDecorators,
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'common/guards/jwt-auth.guard';
import { CheckPolicies } from 'src/casl/check-policies.decorator';
import { PoliciesGuard } from 'src/casl/policies.guard';
import { AppAbility } from 'src/casl/casl-ability.factory/casl-ability.factory';

// controller
export function filesControllerDecorators() {
  return applyDecorators(
    ApiTags('files'),
    Controller('files'),
    UseGuards(JwtAuthGuard, PoliciesGuard),
    ApiBearerAuth(),
  );
}

// create
// export function permissionCreateEndpointDecorators() {
//   return applyDecorators(
//     Post(),
//     ApiOperation({ summary: 'Create a new permissions' }),
//     ApiResponse({
//       status: 201,
//       description: 'The permissions as been successfully created.',
//       type: ResponsePermissionDto,
//     }),
//     ApiBody({ type: CreatePermissionDto }),
//     CheckPolicies(
//       (ability: AppAbility) =>
//         ability.can('create', 'Permission') ||
//         ability.can('super-modify', 'Permission'),
//     ),
//   );
// }

// findAll
// export function permissionFindAllEndpointDecorators() {
//   return applyDecorators(
//     Get(),
//     ApiOperation({ summary: 'Get all permissionss' }),
//     ApiResponse({
//       status: 200,
//       description: 'Return all permissionss.',
//       type: [ResponsePermissionDto],
//     }),
//     PaginationApiQuery(),
//     CheckPolicies(
//       (ability: AppAbility) =>
//         ability.can('read', 'Permission') ||
//         ability.can('super-modify', 'Permission'),
//     ),
//   );
// }

// findOne
export function filesFindOneEndpointDecorators() {
  return applyDecorators(
    Get(':filename'),
    ApiOperation({ summary: 'Get a specific file' }),
    ApiResponse({
      status: 200,
      description: 'Return the file.',
    }),
    ApiResponse({ status: 404, description: 'file not found.' }),
    CheckPolicies(
      (ability: AppAbility) =>
        ability.can('read', 'Files') ||
        ability.can('super-modify', 'Files'),
    ),
  );
}

// update
// export function permissionUpdateEndpointDecorators() {
//   return applyDecorators(
//     Put(':id'),
//     ApiOperation({ summary: 'Update an permissions' }),
//     ApiBody({ type: UpdatePermissionDto }),
//     ApiResponse({
//       status: 200,
//       description: 'The permissions has been successfully updated.',
//       type: ResponsePermissionDto,
//     }),
//     CheckPolicies(
//       (ability: AppAbility) =>
//         ability.can('update', 'Permission') ||
//         ability.can('super-modify', 'Permission'),
//     ),
//   );
// }

// delete
// export function permissionDeleteEndpointDecorators() {
//   return applyDecorators(
//     Delete(':id'),
//     ApiOperation({ summary: 'Delete an permissions' }),
//     ApiResponse({
//       status: 200,
//       description: 'The permissions has been successfully deleted.',
//     }),
//     CheckPolicies(
//       (ability: AppAbility) =>
//         ability.can('delete', 'Permission') ||
//         ability.can('super-modify', 'Permission'),
//     ),
//   );
// }
