import {
  Controller,
  Get,
  Param,
  Delete,
  UseGuards,
  Post,
  Body,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { PoliciesGuard } from 'src/modules/casl/guards/policies.guard';
import { AppAbility } from 'src/modules/casl/abilities/casl-ability.factory';
import { FileRepositoryService } from '../services/file.repository.service';
import { ResponseFileDto } from '../dto/response-file.dto';
import { CheckPolicies } from 'src/modules/casl/decorators/check-policies.decorator';

@ApiTags('files-db')
@Controller('files-db')
@UseGuards(JwtAuthGuard, PoliciesGuard)
@ApiBearerAuth()
export class FilesController {
  constructor(private readonly fileService: FileRepositoryService) { }

  @Get()
  @ApiOperation({ summary: 'Get all files metadata from database' })
  @ApiResponse({
    status: 200,
    description: 'Return all files metadata.',
    type: [ResponseFileDto],
  })
  @CheckPolicies(
    (ability: AppAbility) =>
      ability.can('read', 'Files') || ability.can('super-modify', 'Files'),
  )
  async findAll() {
    return this.fileService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file metadata by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the file metadata.',
    type: ResponseFileDto,
  })
  @CheckPolicies(
    (ability: AppAbility) =>
      ability.can('read', 'Files') || ability.can('super-modify', 'Files'),
  )
  findOne(@Param('id') id: string) {
    return this.fileService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete file metadata by ID' })
  @ApiResponse({
    status: 200,
    description: 'File metadata deleted successfully.',
  })
  @CheckPolicies(
    (ability: AppAbility) =>
      ability.can('delete', 'Files') || ability.can('super-modify', 'Files'),
  )
  remove(@Param('id') id: string) {
    return this.fileService.remove(id);
  }

  @Get('article/:articleId')
  @ApiOperation({ summary: 'Get files by article ID' })
  @ApiResponse({
    status: 200,
    description: 'Return files for the article.',
    type: [ResponseFileDto],
  })
  @CheckPolicies(
    (ability: AppAbility) =>
      ability.can('read', 'Files') || ability.can('super-modify', 'Files'),
  )
  getFilesByArticleId(@Param('articleId') articleId: string) {
    return this.fileService.getFilesByArticleId(+articleId);
  }

  @Post(':fileId/article/:articleId')
  @ApiOperation({ summary: 'Add file to article' })
  @ApiResponse({
    status: 200,
    description: 'File added to article successfully.',
  })
  @CheckPolicies(
    (ability: AppAbility) =>
      ability.can('update', 'Files') || ability.can('super-modify', 'Files'),
  )
  addFileToArticle(
    @Param('fileId') fileId: string,
    @Param('articleId') articleId: string,
  ) {
    return this.fileService.addFileToArticle(fileId, +articleId);
  }

  @Delete(':fileId/article/:articleId')
  @ApiOperation({ summary: 'Remove file from article' })
  @ApiResponse({
    status: 200,
    description: 'File removed from article successfully.',
  })
  @CheckPolicies(
    (ability: AppAbility) =>
      ability.can('delete', 'Files') || ability.can('super-modify', 'Files'),
  )
  removeFileFromArticle(
    @Param('fileId') fileId: string,
    @Param('articleId') articleId: string,
  ) {
    return this.fileService.removeFileFromArticle(fileId, +articleId);
  }
}
