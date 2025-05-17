import {
  Body,
  Param,
  Request,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  Pagination,
  PaginationParams,
} from 'src/common/decorators/pagination/pagination-params.decorator';
import { UpdateArticleDto } from '../dto/update-article.dto';
import {
  articleControllerDecorators,
  articleCreateEndpointDecorators,
  articleFindAllEndpointDecorators,
  articleFindOneEndpointDecorators,
  articleUpdateEndpointDecorators,
  articleDeleteEndpointDecorators,
  articleRemoveFileEndpointDecorators,
} from '../decorators/combined-decorators';
import { ArticleService } from '../services/article.service';
import { CreateArticleDto } from '../dto/create-article.dto';
import { CaslService } from 'src/modules/casl/casl.service';
import { Action } from 'src/modules/casl/types/actions';
import { subject } from '@casl/ability';

@articleControllerDecorators()
export class ArticleController {
  constructor(
    private readonly articlesService: ArticleService,
    private readonly caslService: CaslService, // Inject the CASL service
  ) {}

  @articleCreateEndpointDecorators()
  create(@Body() createArticleDto: CreateArticleDto, @Request() req) {
    return this.articlesService.create(createArticleDto, req.user.id);
  }

  @articleFindAllEndpointDecorators()
  findAll(@PaginationParams() paginationParams: Pagination, @Request() req) {
    // Now using the user ID for permission-filtered queries
    return this.articlesService.findAll(paginationParams, req.user.id);
  }

  @articleFindOneEndpointDecorators()
  async findOne(@Param('id') id: string, @Request() req) {
    const article = await this.articlesService.findOne(+id, req.user.id);

    // Additional explicit permission check for specific article instance
    const canRead = await this.caslService.can(
      req.user.id,
      Action.READ,
      article,
    );

    if (!canRead) {
      throw new ForbiddenException(
        'You do not have permission to view this article',
      );
    }

    return article;
  }

  @articleUpdateEndpointDecorators()
  async update(
    @Param('id') id: string,
    @Body() updateArticleDto: UpdateArticleDto,
    @Request() req,
  ) {
    // Get the article
    const article = await this.articlesService.findOne(+id);

    // Get user ability
    const ability = await this.caslService.getUserAbility(req.user.id);

    // Debug CASL subject detection
    console.log('Article object:', article);
    console.log('Article constructor:', article.constructor?.name);
    console.log('Object keys:', Object.keys(article));

    // Use CASL's subject helper for explicit subject type declaration
    const articleSubject = subject('Article', article);

    console.log(
      'Using string check:',
      ability.can(Action.UPDATE, 'Article', 'title'),
    );
    console.log(
      'Using direct object check:',
      ability.can(Action.UPDATE, article, 'title'),
    );
    console.log(
      'Using subject helper:',
      ability.can(Action.UPDATE, articleSubject, 'title'),
    );

    // Try both approaches
    const canUpdateWithSubject = ability.can(
      Action.UPDATE,
      articleSubject,
      'title',
    );
    if (!canUpdateWithSubject) {
      throw new ForbiddenException('You cannot update this article title');
    }

    // Continue with update if authorized
    return this.articlesService.update(+id, updateArticleDto);
  }

  @articleDeleteEndpointDecorators()
  async remove(@Param('id') id: string, @Request() req) {
    // First get the article to check ownership
    const article = await this.articlesService.findOne(+id);

    // Check permissions on the specific article instance
    const ability = await this.caslService.getUserAbility(req.user.id);
    if (ability.cannot(Action.DELETE, article)) {
      throw new ForbiddenException(
        'You do not have permission to delete this article',
      );
    }

    return this.articlesService.remove(+id);
  }

  @articleRemoveFileEndpointDecorators()
  async removeFileFromArticle(
    @Param('id') articleId: string,
    @Param('fileId') fileId: string,
    @Request() req,
  ) {
    // First get the article to check ownership
    const article = await this.articlesService.findOne(+articleId);

    // Check permissions on the specific article instance
    const ability = await this.caslService.getUserAbility(req.user.id);
    if (ability.cannot(Action.UPDATE, article)) {
      throw new ForbiddenException(
        'You do not have permission to modify this article',
      );
    }

    return this.articlesService.removeFileFromArticle(+articleId, fileId);
  }
}
