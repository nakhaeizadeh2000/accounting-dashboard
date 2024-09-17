import {
  applyDecorators,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
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
import { CreateArticleDto } from '../dto/create-article.dto';
import { AppAbility } from 'src/casl/casl-ability.factory/casl-ability.factory';
import { ResponseArticleDto } from '../dto/response-article.dto';
import { Article } from '../entities/article.entity';
import { PaginationApiQuery } from 'common/decorators/pagination-api-query.decorator';

// controller
export function articleControllerDecorators() {
  return applyDecorators(
    ApiTags('article'),
    Controller('article'),
    UseGuards(JwtAuthGuard, PoliciesGuard),
    ApiBearerAuth(),
  );
}

// create
export function articleCreateEndpointDecorators() {
  return applyDecorators(
    Post(),
    ApiOperation({ summary: 'Create a new article' }),
    ApiResponse({
      status: 201,
      description: 'The article as been successfully created.',
      type: ResponseArticleDto,
    }),
    ApiBody({ type: CreateArticleDto }),
    CheckPolicies(
      (ability: AppAbility) =>
        ability.can('create', 'Article') ||
        ability.can('super-modify', 'Article'),
    ),
  );
}

// findAll
export function articleFindAllEndpointDecorators() {
  return applyDecorators(
    Get(),
    ApiOperation({ summary: 'Get all articles' }),
    ApiResponse({
      status: 200,
      description: 'Return all articles.',
      type: [ResponseArticleDto],
    }),
    PaginationApiQuery(),
    CheckPolicies((ability: AppAbility) => {
      return (
        ability.can('read', 'Article') || ability.can('super-modify', 'Article')
      );
    }),
  );
}

// findOne
export function articleFindOneEndpointDecorators() {
  return applyDecorators(
    Get(':id'),
    ApiOperation({ summary: 'Get a specific article' }),
    ApiResponse({
      status: 200,
      description: 'Return the article.',
      type: ResponseArticleDto,
    }),
    ApiResponse({ status: 404, description: 'Article not found.' }),
    CheckPolicies(
      (ability: AppAbility) =>
        ability.can('read', 'Article') ||
        ability.can('super-modify', 'Article'),
    ),
  );
}

// update
export function articleUpdateEndpointDecorators() {
  return applyDecorators(
    Patch(':id'),
    ApiOperation({ summary: 'Update an article' }),
    ApiResponse({
      status: 200,
      description: 'The article has been successfully updated.',
      type: ResponseArticleDto,
    }),
    CheckPolicies(
      (ability: AppAbility) =>
        ability.can('update', 'Article') ||
        ability.can('super-modify', 'Article'),
    ),
  );
}

// delete
export function articleDeleteEndpointDecorators() {
  return applyDecorators(
    Delete(':id'),
    ApiOperation({ summary: 'Delete an article' }),
    ApiResponse({
      status: 200,
      description: 'The article has been successfully deleted.',
    }),
    CheckPolicies(
      (ability: AppAbility) =>
        ability.can('delete', 'Article') ||
        ability.can('super-modify', 'Article'),
    ),
  );
}
