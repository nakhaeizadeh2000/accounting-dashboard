// src/article/services/article.service.ts
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource, Repository, In } from 'typeorm';
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
import { FileRepositoryService } from 'src/minio-files/services/file.repository.service';
import { MinioFilesService } from 'src/minio-files/services/minio-files.service';
import { File } from 'src/minio-files/entities/file.entity';

@Injectable()
export class ArticleService {
  private articleRepository: Repository<Article>;
  private readonly logger = new Logger(ArticleService.name);

  constructor(
    @Inject(REQUEST) private readonly request: FastifyRequest,
    private dataSource: DataSource,
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly fileRepositoryService: FileRepositoryService,
    private readonly minioFilesService: MinioFilesService,
  ) {
    this.articleRepository = this.dataSource.getRepository(Article);
  }

  async create(
    createArticleDto: CreateArticleDto,
    authorId: string,
  ): Promise<ResponseArticleDto> {
    const { fileIds, ...articleData } = createArticleDto;

    // Create the article
    const article = this.articleRepository.create({
      ...articleData,
      authorId,
    });

    // If fileIds were provided, associate them with the article
    if (fileIds && fileIds.length > 0) {
      // Now use the fileRepositoryService instead of direct repository access
      const filePromises = fileIds.map((id) =>
        this.fileRepositoryService.findOne(id),
      );
      const files = await Promise.all(filePromises);

      // Filter out any null values (files not found)
      const validFiles = files.filter((file) => file !== null);

      // Convert ResponseFileDto objects to File entities
      // We need to do this because the repository expects File entities
      const fileEntities = validFiles.map((fileDto) => {
        const fileEntity = new File();
        Object.assign(fileEntity, {
          id: fileDto.id,
          originalName: fileDto.originalName,
          uniqueName: fileDto.uniqueName,
          size: fileDto.size,
          mimetype: fileDto.mimetype,
          thumbnailName: fileDto.thumbnailName,
          url: fileDto.url,
          thumbnailUrl: fileDto.thumbnailUrl,
          bucket: fileDto.bucket,
          createdAt: fileDto.createdAt,
          updatedAt: fileDto.updatedAt,
        });
        return fileEntity;
      });

      article.files = fileEntities;
    }

    const savedArticle = await this.articleRepository.save(article);

    return plainToInstance(ResponseArticleDto, savedArticle, {
      excludeExtraneousValues: true,
    });
  }

  async update(
    id: number,
    updateArticleDto: UpdateArticleDto,
  ): Promise<ResponseArticleDto> {
    const { fileIds, ...articleData } = updateArticleDto;

    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['files'],
    });

    if (!article) {
      throw new NotFoundException(`Article with ID "${id}" not found`);
    }

    // Update the article data
    Object.assign(article, articleData);

    // Update the file associations if provided
    if (fileIds) {
      // Now use the fileRepositoryService instead of direct repository access
      const filePromises = fileIds.map((id) =>
        this.fileRepositoryService.findOne(id),
      );
      const files = await Promise.all(filePromises);

      // Filter out any null values (files not found)
      const validFiles = files.filter((file) => file !== null);

      // Convert ResponseFileDto objects to File entities
      const fileEntities = validFiles.map((fileDto) => {
        const fileEntity = new File();
        Object.assign(fileEntity, {
          id: fileDto.id,
          originalName: fileDto.originalName,
          uniqueName: fileDto.uniqueName,
          size: fileDto.size,
          mimetype: fileDto.mimetype,
          thumbnailName: fileDto.thumbnailName,
          url: fileDto.url,
          thumbnailUrl: fileDto.thumbnailUrl,
          bucket: fileDto.bucket,
          createdAt: fileDto.createdAt,
          updatedAt: fileDto.updatedAt,
        });
        return fileEntity;
      });

      article.files = fileEntities;
    }

    const savedArticle = await this.articleRepository.save(article);

    return plainToInstance(ResponseArticleDto, savedArticle, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(
    pagination: Pagination,
  ): Promise<PaginatedResponse<ResponseArticleDto>> {
    const { page, limit } = pagination;
    const ability = await this.caslAbilityFactory.defineAbility(
      this.request.user,
    );
    const permissionConditions = buildQueryforArticle(
      ability,
      'read',
      this.request.user,
    );

    const [articles, count] = await this.articleRepository.findAndCount({
      where: {
        ...permissionConditions,
      },
      take: limit,
      skip: limit * (page - 1),
      relations: ['files'], // Include files relation
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
    const ability = await this.caslAbilityFactory.defineAbility(
      this.request.user,
    );
    const permissionConditions = buildQueryforArticle(
      ability,
      'read',
      this.request.user,
      'article',
    );

    const article = await this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.files', 'files') // Include files
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

  async remove(id: number): Promise<void> {
    // Find the article with its related files
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['files'],
    });

    if (!article) {
      throw new NotFoundException(`Article with ID "${id}" not found`);
    }

    // For each file, check if it's used by other articles
    if (article.files && article.files.length > 0) {
      for (const file of article.files) {
        // Count how many articles use this file
        const usageCount = await this.articleRepository
          .createQueryBuilder('article')
          .innerJoin('article.files', 'file')
          .where('file.id = :fileId', { fileId: file.id })
          .andWhere('article.id != :articleId', { articleId: id })
          .getCount();

        // If this is the only article using the file, delete it
        if (usageCount === 0) {
          this.logger.log(
            `Deleting unused file ${file.id} (${file.originalName})`,
          );

          try {
            // Delete from MinIO using the service
            await this.minioFilesService.deleteFile(
              file.bucket,
              file.uniqueName,
            );

            // Delete from database using the repository service
            await this.fileRepositoryService.remove(file.id);
          } catch (err) {
            this.logger.error(`Error deleting file ${file.id}: ${err.message}`);
          }
        } else {
          this.logger.log(
            `File ${file.id} is used by ${usageCount} other articles, keeping it`,
          );
        }
      }
    }

    // Now delete the article
    const result = await this.articleRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Failed to delete article with ID "${id}"`);
    }

    this.logger.log(`Successfully deleted article ${id}`);
  }
}
