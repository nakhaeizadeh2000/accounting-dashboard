import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Article } from '../entities/article.entity';
import { CreateArticleDto } from '../dto/create-article.dto';
import { UpdateArticleDto } from '../dto/update-article.dto';
import { plainToInstance } from 'class-transformer';
import { ResponseArticleDto } from '../dto/response-article.dto';
import { Pagination } from 'src/common/decorators/pagination/pagination-params.decorator';
import {
  PaginatedResponse,
  paginateResponse,
} from 'src/common/utils/pagination.util';
import { CaslAbilityFactory } from 'src/modules/casl-legacy/abilities/casl-ability.factory';
import { FastifyRequest } from 'fastify';
import { REQUEST } from '@nestjs/core';
import { FileRepositoryService } from 'src/modules/files/services/file.repository.service';
import { MinioFilesService } from 'src/modules/files/services/minio-files.service';
import { File } from 'src/modules/files/entities/file.entity';

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

  /**
   * Creates a new article with optional file attachments
   *
   * This method creates a new article in the database with the provided data
   * and associates it with the specified author. If file IDs are provided,
   * it fetches those files and associates them with the article. Any files
   * that were previously unused will have their usage status updated to reflect
   * that they are now being used.
   *
   * @param createArticleDto - The DTO containing article data and optional file IDs to attach
   * @param authorId - The unique identifier of the user who is creating the article
   * @returns A promise that resolves to a ResponseArticleDto containing the created article data
   */
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

      // Update isUsed status for previously unused files
      const unusedFiles = validFiles.filter((file) => !file.isUsed);
      if (unusedFiles.length > 0) {
        const unusedFileIds = unusedFiles.map((file) => file.id);
        // Update each file's isUsed status to true
        for (const fileId of unusedFileIds) {
          await this.fileRepositoryService.updateUsageStatus(fileId, true);
        }
      }
    }

    const savedArticle = await this.articleRepository.save(article);

    return plainToInstance(ResponseArticleDto, savedArticle, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Updates an existing article with new data and file associations
   *
   * This method updates an article's properties and its associated files.
   * It fetches the article by ID, applies the updates from the DTO,
   * and handles file associations by converting file DTOs to entities.
   * Any previously unused files that are now associated with the article
   * will have their usage status updated.
   *
   * @param id - The numeric ID of the article to update
   * @param updateArticleDto - The DTO containing the updated article data and optional file IDs
   * @throws NotFoundException - If no article with the specified ID exists
   * @returns A promise that resolves to a ResponseArticleDto containing the updated article data
   */
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

      // Update isUsed status for previously unused files
      const unusedFiles = validFiles.filter((file) => !file.isUsed);
      if (unusedFiles.length > 0) {
        const unusedFileIds = unusedFiles.map((file) => file.id);
        // Update each file's isUsed status to true
        for (const fileId of unusedFileIds) {
          await this.fileRepositoryService.updateUsageStatus(fileId, true);
        }
      }
    }

    const savedArticle = await this.articleRepository.save(article);

    return plainToInstance(ResponseArticleDto, savedArticle, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Retrieves a paginated list of all articles with their authors
   *
   * This method fetches articles from the database with pagination support,
   * including the related author data for each article. The results are ordered
   * by creation date (newest first) and transformed into DTOs that exclude
   * sensitive or unnecessary data.
   *
   * @param pagination - An object containing pagination parameters (page number and limit)
   * @returns A promise that resolves to a paginated response containing article DTOs,
   *          total count, and pagination metadata
   */
  async findAll(
    pagination: Pagination,
  ): Promise<PaginatedResponse<ResponseArticleDto>> {
    const [articles, total] = await this.articleRepository.findAndCount({
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      relations: ['author'], // Add this to include author data
      order: {
        createdAt: 'DESC',
      },
    });

    const responseArticles = articles.map((article) => {
      const responseArticle = plainToInstance(ResponseArticleDto, article, {
        excludeExtraneousValues: true,
      });
      return responseArticle;
    });

    return paginateResponse(
      responseArticles,
      total,
      pagination.page,
      pagination.limit,
    );
  }

  /**
   * Retrieves a single article by its ID with associated author and files
   *
   * This method fetches a specific article from the database along with its
   * related author and file information. The response is transformed into a DTO
   * that excludes sensitive or unnecessary data.
   *
   * @param id - The numeric ID of the article to retrieve
   * @throws NotFoundException - If no article with the specified ID exists
   * @returns A promise that resolves to a ResponseArticleDto containing the article data
   */
  async findOne(id: number): Promise<ResponseArticleDto> {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['author', 'files'], // Ensure files are included in the relation
    });

    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    return plainToInstance(ResponseArticleDto, article, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Deletes an article and handles cleanup of associated files
   *
   * This method removes an article from the database and then checks if any
   * associated files are still being used by other entities. If not, those
   * files will be completely removed from storage to prevent orphaned files.
   *
   * @param id - The numeric ID of the article to be deleted
   * @throws NotFoundException - If the article doesn't exist or if the deletion operation fails
   * @returns A promise that resolves when the article and any unused files are successfully deleted
   */
  async remove(id: number): Promise<void> {
    // Find the article to check if it exists
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['files'],
    });

    if (!article) {
      throw new NotFoundException(`Article with ID "${id}" not found`);
    }

    // Store file IDs for cleanup after article deletion
    const fileIds = article.files ? article.files.map((file) => file.id) : [];

    // Delete the article - the cascade will handle removing entries from the join table
    const result = await this.articleRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Failed to delete article with ID "${id}"`);
    }

    // After article is deleted, check each file to see if it's still used
    if (fileIds.length > 0) {
      for (const fileId of fileIds) {
        // Use the centralized method to check if file is used and delete if not
        await this.fileRepositoryService.removeCompletely(fileId, false);
      }
    }

    this.logger.log(`Successfully deleted article ${id}`);
  }

  /**
   * Removes a specific file from an article and checks if the file should be deleted
   *
   * This method disassociates a file from an article and then checks if the file
   * is still being used elsewhere. If not, the file will be completely removed from storage.
   *
   * @param articleId - The numeric ID of the article from which to remove the file
   * @param fileId - The string ID of the file to be removed from the article
   * @returns A promise that resolves to an object with a success boolean indicating the operation completed successfully
   * @throws NotFoundException - If the article doesn't exist or the file is not associated with the article
   */
  async removeFileFromArticle(
    articleId: number,
    fileId: string,
  ): Promise<{ success: boolean }> {
    // Verify the article exists
    const article = await this.articleRepository.findOne({
      where: { id: articleId },
      relations: ['files'],
    });

    if (!article) {
      throw new NotFoundException(`Article with ID ${articleId} not found`);
    }

    // Check if the file is associated with this article
    const fileIndex = article.files.findIndex((file) => file.id === fileId);
    if (fileIndex === -1) {
      throw new NotFoundException(
        `File with ID ${fileId} not found in article ${articleId}`,
      );
    }

    // Remove the file from the article's files array
    article.files.splice(fileIndex, 1);

    // Save the article with the updated files array
    await this.articleRepository.save(article);

    // Check if the file is still used by any entity and delete if not
    await this.fileRepositoryService.removeCompletely(fileId, false);

    return { success: true };
  }
}
