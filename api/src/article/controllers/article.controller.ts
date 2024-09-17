import { Body, Param, Request } from '@nestjs/common';
import { ArticleService } from '../services/article.service';
import { CreateArticleDto } from '../dto/create-article.dto';
import { UpdateArticleDto } from '../dto/update-article.dto';
import {
  articleFindOneEndpointDecorators,
  articleUpdateEndpointDecorators,
  articleDeleteEndpointDecorators,
} from './combined-decorators';
import {
  articleControllerDecorators,
  articleCreateEndpointDecorators,
  articleFindAllEndpointDecorators,
} from './combined-decorators';
import {
  Pagination,
  PaginationParams,
} from 'common/decorators/pagination-params.decorator';

@articleControllerDecorators()
export class ArticleController {
  constructor(private readonly articlesService: ArticleService) {}

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
}
