import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Article } from '../entities/article.entity';
import { CreateArticleDto } from '../dto/create-article.dto';
import { UpdateArticleDto } from '../dto/update-article.dto';
import { plainToInstance } from 'class-transformer';
import { ResponseArticleDto } from '../dto/response-article.dto';
import { Pagination } from 'common/decorators/pagination-params.decorator';
import {
  PaginatedResponse,
  paginateResponse,
} from 'common/functions/pagination.util';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory/casl-ability.factory';
import { FastifyRequest } from 'fastify';
import { REQUEST } from '@nestjs/core';
import { buildQueryforArticle } from 'src/casl/casl-ability.factory/build-query-for-entities/build-query-for-article';

@Injectable()
export class ArticleService {
  private articleRepository: Repository<Article>;
  constructor(
    @Inject(REQUEST) private readonly request: FastifyRequest,
    private dataSource: DataSource,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {
    // get users table repository to interact with the database
    this.articleRepository = this.dataSource.getRepository(Article);
  }

  async create(
    createArticleDto: CreateArticleDto,
    authorId: number,
  ): Promise<ResponseArticleDto> {
    const article = this.articleRepository.create({
      ...createArticleDto,
      authorId: authorId.toString(),
    });
    const savedArticle = await this.articleRepository.save(article);
    return plainToInstance(ResponseArticleDto, savedArticle, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(
    pagination: Pagination,
  ): Promise<PaginatedResponse<ResponseArticleDto>> {
    const { page, limit } = pagination;
    const ability = this.caslAbilityFactory.defineAbility(this.request.user);
    const permissionConditions = buildQueryforArticle(
      await ability,
      'read',
      this.request.user,
    );
    const [articles, count] = await this.articleRepository.findAndCount({
      where: {
        ...permissionConditions,
        //  rest of conditions if needed
      },
      take: limit,
      skip: limit * (page - 1),
    });
    const convertedArticles = articles.map((article) =>
      plainToInstance(ResponseArticleDto, article, {
        excludeExtraneousValues: true,
      }),
    );
    const standardResponse = paginateResponse<ResponseArticleDto>(
      convertedArticles,
      count,
      page,
      limit,
    );
    return standardResponse;
  }

  async findOne(id: number): Promise<ResponseArticleDto> {
    const ability = this.caslAbilityFactory.defineAbility(this.request.user);
    const permissionConditions = buildQueryforArticle(
      await ability,
      'read',
      this.request.user,
      'article',
    );

    const article = await this.articleRepository
      .createQueryBuilder('article')
      .where('article.id = :id', { id })
      .andWhere(...permissionConditions)
      .getOne();

    if (!article) {
      throw new NotFoundException(`Article with ID "${id}" not found`);
    }

    return plainToInstance(ResponseArticleDto, article, {
      excludeExtraneousValues: true,
    });
  }

  async update(
    id: number,
    updateArticleDto: UpdateArticleDto,
  ): Promise<ResponseArticleDto> {
    const article = await this.findOne(id);
    Object.assign(article, updateArticleDto);
    const savedArticle = await this.articleRepository.save(article);
    return plainToInstance(ResponseArticleDto, savedArticle, {
      excludeExtraneousValues: true,
    });
  }

  async remove(id: number): Promise<void> {
    const result = await this.articleRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Article with ID "${id}" not found`);
    }
  }
}
