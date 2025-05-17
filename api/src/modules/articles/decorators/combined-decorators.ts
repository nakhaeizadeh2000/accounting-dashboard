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
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { AbilitiesGuard } from 'src/modules/casl/guards/abilities.guard';
import { CreateArticleDto } from '../dto/create-article.dto';
import { AppAbility } from 'src/modules/casl/casl-ability.factory';
import { ResponseArticleDto } from '../dto/response-article.dto';
import { PaginationApiQuery } from 'src/common/decorators/pagination/pagination-api-query.decorator';
import { BaseResponseDto } from 'src/common/interceptors/response/response-wraper.dto';
import { ErrorDto } from 'src/common/interceptors/response/response-wraper.dto';
import {
  CheckPolicies,
  CanCreate,
  CanRead,
  CanUpdate,
  CanDelete,
} from 'src/modules/casl/decorators/check-policies.decorator';
import { ArticlePaginatedResponseDto } from '../dto/article-paginated-response.dto';
import { Action } from 'src/modules/casl/types/actions';

// controller
export function articleControllerDecorators() {
  return applyDecorators(
    ApiTags('article'),
    Controller('article'),
    UseGuards(JwtAuthGuard, AbilitiesGuard),
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
    CanCreate('Article'), // Using the new simplified decorator
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
      type: [ArticlePaginatedResponseDto],
    }),
    PaginationApiQuery(),
    CanRead('Article'), // Using the new simplified decorator
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
    CanRead('Article'), // Using the new simplified decorator
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
    CanUpdate('Article'), // Using the new simplified decorator
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
    CanDelete('Article'), // Using the new simplified decorator
  );
}

// removeFileFromArticle
export function articleRemoveFileEndpointDecorators() {
  return applyDecorators(
    Delete(':id/files/:fileId'),
    ApiOperation({ summary: 'Remove a file from an article' }),
    ApiParam({ name: 'id', description: 'Article ID' }),
    ApiParam({ name: 'fileId', description: 'File ID to remove' }),
    ApiResponse({
      status: 200,
      description: 'File successfully removed from article',
      type: BaseResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Article or file not found',
      type: ErrorDto,
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized',
      type: ErrorDto,
    }),
    CheckPolicies((ability: AppAbility) =>
      ability.can(Action.UPDATE, 'Article'),
    ),
  );
}
