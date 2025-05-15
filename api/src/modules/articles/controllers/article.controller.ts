import { Body, Param, Request } from '@nestjs/common';
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

@articleControllerDecorators()
export class ArticleController {
  constructor(private readonly articlesService: ArticleService) { }

  @articleCreateEndpointDecorators()
  create(@Body() createArticleDto: CreateArticleDto, @Request() req) {
    return this.articlesService.create(createArticleDto, req.user.id);
  }

  @articleFindAllEndpointDecorators()
  findAll(@PaginationParams() paginationParams: Pagination) {
    return this.articlesService.findAll(paginationParams);
  }

  @articleFindOneEndpointDecorators()
  findOne(@Param('id') id: string) {
    return this.articlesService.findOne(+id);
  }

  @articleUpdateEndpointDecorators()
  update(@Param('id') id: string, @Body() updateArticleDto: UpdateArticleDto) {
    return this.articlesService.update(+id, updateArticleDto);
  }

  @articleDeleteEndpointDecorators()
  remove(@Param('id') id: string) {
    return this.articlesService.remove(+id);
  }

  @articleRemoveFileEndpointDecorators()
  removeFileFromArticle(
    @Param('id') articleId: string,
    @Param('fileId') fileId: string
  ) {
    return this.articlesService.removeFileFromArticle(+articleId, fileId);
  }
}
