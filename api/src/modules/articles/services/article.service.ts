import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
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
import { REQUEST } from '@nestjs/core';
import { FastifyRequest } from 'fastify';
import { FileRepositoryService } from 'src/modules/files/services/file.repository.service';
import { MinioFilesService } from 'src/modules/files/services/minio-files.service';
import { File } from 'src/modules/files/entities/file.entity';
import {
  PermissionQueryBuilder,
  EntityFieldSelector,
} from 'src/modules/casl/services/permission-query-builder.service';
import { CaslService } from 'src/modules/casl/casl.service';
import { Action } from 'src/modules/casl/types/actions';
import { User } from 'src/modules/users/entities/user.entity';

@Injectable()
export class ArticleService {
  private articleRepository: Repository<Article>;
  private readonly logger = new Logger(ArticleService.name);

  constructor(
    @Inject(REQUEST) private readonly request: FastifyRequest,
    private dataSource: DataSource,
    private readonly fileRepositoryService: FileRepositoryService,
    private readonly minioFilesService: MinioFilesService,
    private readonly permissionQueryBuilder: PermissionQueryBuilder,
    private readonly caslService: CaslService,
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
   * Retrieves a paginated list of all articles with their authors
   * using permission-based filtering
   *
   * This method fetches articles from the database with pagination support,
   * applying permission filters based on the user's abilities. It ensures
   * users only see articles they are authorized to view and only the fields
   * they are allowed to see.
   *
   * @param pagination - An object containing pagination parameters (page number and limit)
   * @param userId - The ID of the user making the request, used for permission filtering
   * @returns A promise that resolves to a paginated response containing article DTOs,
   *          total count, and pagination metadata
   */
  async findAll(
    pagination: Pagination,
    userId: string,
  ): Promise<PaginatedResponse<ResponseArticleDto>> {
    try {
      const { page, limit } = pagination;
      this.logger.debug(
        `[CASL] findAll called for user ${userId} with page ${page}, limit ${limit}`,
      );

      // Create a query builder with joins
      const queryBuilder = this.articleRepository
        .createQueryBuilder('article')
        .leftJoinAndSelect('article.author', 'author')
        .leftJoinAndSelect('article.files', 'files');

      this.logger.debug(`[CASL] Created query builder for findAll`);

      // Apply type-safe field selection with permissions
      this.logger.debug(
        `[CASL] Applying permission filters for user ${userId}`,
      );
      const permissionQueryWrapper =
        this.permissionQueryBuilder.withPermissions(
          queryBuilder,
          userId,
          Action.READ,
        );

      // Continue using the fluent API as before
      this.logger.debug(`[CASL] Selecting fields for permissionWrapper`);
      const permissionFilteredQuery = await permissionQueryWrapper
        .selectFields<Article>('article', [
          'id',
          'title',
          'content',
          'createdAt',
          'updatedAt',
          'authorId',
        ])
        .selectFields<User>('author', ['id', 'firstName', 'lastName', 'email'])
        .selectFields<File>('files', [
          'id',
          'originalName',
          'uniqueName',
          'size',
          'mimetype',
          'thumbnailName',
          'url',
          'thumbnailUrl',
          'bucket',
          'createdAt',
          'updatedAt',
          'isUsed',
        ])
        .apply();

      this.logger.debug(`[CASL] Permission filters applied, adding pagination`);

      // Apply pagination to the filtered query, not the original
      permissionFilteredQuery
        .orderBy('article.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      // Log the SQL for debugging
      this.logger.debug(
        `[CASL] Final SQL: ${permissionFilteredQuery.getSql()}`,
      );

      // Execute the query
      this.logger.debug(`[CASL] Executing query`);
      const [articles, total] = await permissionFilteredQuery.getManyAndCount();
      this.logger.debug(
        `[CASL] Query returned ${articles.length} articles out of ${total} total`,
      );

      // Transform to DTOs with proper field exclusion
      const responseArticles = articles.map((article) => {
        return plainToInstance(ResponseArticleDto, article, {
          excludeExtraneousValues: true,
        });
      });

      return paginateResponse(responseArticles, total, page, limit);
    } catch (error) {
      this.logger.error(
        `[CASL] Error finding articles: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Retrieves a single article by its ID with associated author and files
   * using permission-based filtering if a userId is provided
   *
   * @param id - The numeric ID of the article to retrieve
   * @param userId - Optional user ID for permission filtering
   * @throws NotFoundException - If no article with the specified ID exists
   * @throws ForbiddenException - If the user doesn't have permission to view the article
   * @returns A promise that resolves to a ResponseArticleDto containing the article data
   */
  async findOne(id: number, userId?: string): Promise<ResponseArticleDto> {
    // Create a query builder with joins
    const queryBuilder = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .leftJoinAndSelect('article.files', 'files')
      .where('article.id = :id', { id });

    // If userId is provided, apply permission filtering
    if (userId) {
      // Use permissionQueryBuilder.withPermissions instead
      const permissionQueryWrapper =
        this.permissionQueryBuilder.withPermissions(
          queryBuilder,
          userId,
          Action.READ,
        );

      const permissionFilteredQuery = await permissionQueryWrapper
        .selectFields<Article>('article', [
          'id',
          'title',
          'content',
          'createdAt',
          'updatedAt',
          'authorId',
        ])
        .selectFields<User>('author', ['id', 'firstName', 'lastName', 'email'])
        .selectFields<File>('files', [
          'id',
          'originalName',
          'uniqueName',
          'size',
          'mimetype',
          'thumbnailName',
          'url',
          'thumbnailUrl',
          'bucket',
          'createdAt',
          'updatedAt',
          'isUsed',
        ])
        .apply();

      // Use the filtered query
      const article = await permissionFilteredQuery.getOne();

      if (!article) {
        throw new NotFoundException(`Article with ID ${id} not found`);
      }

      // Additional explicit permission check
      const ability = await this.caslService.getUserAbility(userId);
      if (ability.cannot(Action.READ, article)) {
        throw new ForbiddenException(
          `You don't have permission to view article ${id}`,
        );
      }

      return plainToInstance(ResponseArticleDto, article, {
        excludeExtraneousValues: true,
      });
    } else {
      // If no userId, just execute the original query
      const article = await queryBuilder.getOne();

      if (!article) {
        throw new NotFoundException(`Article with ID ${id} not found`);
      }

      return plainToInstance(ResponseArticleDto, article, {
        excludeExtraneousValues: true,
      });
    }
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
    if (fileIds !== undefined) {
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
   * Retrieves all articles authored by a specific user with permission filtering
   *
   * This method fetches articles from a specific author with pagination support,
   * applying permission filters based on the requesting user's abilities.
   *
   * @param authorId - The ID of the author whose articles to retrieve
   * @param pagination - An object containing pagination parameters
   * @param requestingUserId - The ID of the user making the request, for permission filtering
   * @returns A promise that resolves to a paginated response containing article DTOs
   */
  async getByAuthor(
    authorId: string,
    pagination: Pagination,
    requestingUserId: string,
  ): Promise<PaginatedResponse<ResponseArticleDto>> {
    try {
      const { page, limit } = pagination;

      // Create a query builder with joins
      const queryBuilder = this.articleRepository
        .createQueryBuilder('article')
        .leftJoinAndSelect('article.author', 'author')
        .leftJoinAndSelect('article.files', 'files')
        .where('article.authorId = :authorId', { authorId });

      // Apply permission filtering with field selection
      // Use permissionQueryBuilder.withPermissions instead
      const permissionQueryWrapper =
        this.permissionQueryBuilder.withPermissions(
          queryBuilder,
          requestingUserId,
          Action.READ,
        );

      const permissionFilteredQuery = await permissionQueryWrapper
        .selectFields<Article>('article', [
          'id',
          'title',
          'content',
          'createdAt',
          'updatedAt',
          'authorId',
        ])
        .selectFields<User>('author', ['id', 'firstName', 'lastName', 'email'])
        .selectFields<File>('files', [
          'id',
          'originalName',
          'uniqueName',
          'size',
          'mimetype',
          'thumbnailName',
          'url',
          'thumbnailUrl',
          'bucket',
          'createdAt',
          'updatedAt',
          'isUsed',
        ])
        .apply();

      // Apply pagination to the filtered query
      permissionFilteredQuery
        .orderBy('article.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      const [articles, total] = await permissionFilteredQuery.getManyAndCount();

      const responseArticles = articles.map((article) => {
        return plainToInstance(ResponseArticleDto, article, {
          excludeExtraneousValues: true,
        });
      });

      return paginateResponse(responseArticles, total, page, limit);
    } catch (error) {
      this.logger.error(
        `Error finding articles by author: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Searches for articles based on a search term with permission filtering
   *
   * This method searches the article repository for articles that match
   * a given search term in their title or content, applying permission
   * filters based on the requesting user's abilities.
   *
   * @param searchTerm - The term to search for in article titles and content
   * @param pagination - An object containing pagination parameters
   * @param userId - The ID of the user making the request, for permission filtering
   * @returns A promise that resolves to a paginated response containing matching article DTOs
   */
  async search(
    searchTerm: string,
    pagination: Pagination,
    userId: string,
  ): Promise<PaginatedResponse<ResponseArticleDto>> {
    try {
      const { page, limit } = pagination;

      // Create a query builder with joins and search condition
      const queryBuilder = this.articleRepository
        .createQueryBuilder('article')
        .leftJoinAndSelect('article.author', 'author')
        .leftJoinAndSelect('article.files', 'files')
        .where('article.title ILIKE :searchTerm', {
          searchTerm: `%${searchTerm}%`,
        })
        .orWhere('article.content ILIKE :searchTerm', {
          searchTerm: `%${searchTerm}%`,
        });

      // Apply permission filtering with field selection
      // Use permissionQueryBuilder.withPermissions instead
      const permissionQueryWrapper =
        this.permissionQueryBuilder.withPermissions(
          queryBuilder,
          userId,
          Action.READ,
        );

      const permissionFilteredQuery = await permissionQueryWrapper
        .selectFields<Article>('article', [
          'id',
          'title',
          'content',
          'createdAt',
          'updatedAt',
          'authorId',
        ])
        .selectFields<User>('author', ['id', 'firstName', 'lastName', 'email'])
        .selectFields<File>('files', [
          'id',
          'originalName',
          'uniqueName',
          'size',
          'mimetype',
          'thumbnailName',
          'url',
          'thumbnailUrl',
          'bucket',
          'createdAt',
          'updatedAt',
          'isUsed',
        ])
        .apply();

      // Apply pagination to the filtered query
      permissionFilteredQuery
        .orderBy('article.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      const [articles, total] = await permissionFilteredQuery.getManyAndCount();

      const responseArticles = articles.map((article) => {
        return plainToInstance(ResponseArticleDto, article, {
          excludeExtraneousValues: true,
        });
      });

      return paginateResponse(responseArticles, total, page, limit);
    } catch (error) {
      this.logger.error(
        `Error searching articles: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Manages file associations for an article
   *
   * This method updates the files associated with an article, adding
   * new files and removing ones that should no longer be associated.
   * It also updates the usage status of files accordingly.
   *
   * @param articleId - The ID of the article to update files for
   * @param fileIds - Array of file IDs to associate with the article
   * @returns A promise that resolves to the updated article
   */
  async manageArticleFiles(
    articleId: number,
    fileIds: string[],
  ): Promise<ResponseArticleDto> {
    const article = await this.articleRepository.findOne({
      where: { id: articleId },
      relations: ['files'],
    });

    if (!article) {
      throw new NotFoundException(`Article with ID "${articleId}" not found`);
    }

    // Get current file IDs
    const currentFileIds = article.files.map((file) => file.id);

    // Determine files to add and remove
    const filesToAdd = fileIds.filter((id) => !currentFileIds.includes(id));
    const filesToRemove = currentFileIds.filter((id) => !fileIds.includes(id));

    // Fetch files to add
    if (filesToAdd.length > 0) {
      const newFilePromises = filesToAdd.map((id) =>
        this.fileRepositoryService.findOne(id),
      );
      const newFiles = await Promise.all(newFilePromises);
      const validNewFiles = newFiles.filter((file) => file !== null);

      // Convert to entities and add to article.files
      const newFileEntities = validNewFiles.map((fileDto) => {
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

      // Update isUsed status for previously unused files
      const unusedFiles = validNewFiles.filter((file) => !file.isUsed);
      if (unusedFiles.length > 0) {
        const unusedFileIds = unusedFiles.map((file) => file.id);
        for (const fileId of unusedFileIds) {
          await this.fileRepositoryService.updateUsageStatus(fileId, true);
        }
      }

      // Add new files to the article
      article.files = [
        ...article.files.filter((file) => !filesToRemove.includes(file.id)),
        ...newFileEntities,
      ];
    } else {
      // Just remove files that need to be removed
      article.files = article.files.filter(
        (file) => !filesToRemove.includes(file.id),
      );
    }

    // Save the updated article
    const savedArticle = await this.articleRepository.save(article);

    // Check if removed files are now unused and should be deleted
    if (filesToRemove.length > 0) {
      for (const fileId of filesToRemove) {
        await this.fileRepositoryService.removeCompletely(fileId, false);
      }
    }

    return plainToInstance(ResponseArticleDto, savedArticle, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Checks if the current user is authorized to modify an article
   *
   * This helper method verifies if the user has appropriate permissions
   * to update or delete a specific article.
   *
   * @param articleId - The ID of the article to check permissions for
   * @param userId - The ID of the user requesting the operation
   * @throws ForbiddenException - If the user doesn't have permission
   * @throws NotFoundException - If the article doesn't exist
   */
  async checkArticlePermission(
    articleId: number,
    userId: string,
  ): Promise<void> {
    const article = await this.articleRepository.findOne({
      where: { id: articleId },
    });

    if (!article) {
      throw new NotFoundException(`Article with ID "${articleId}" not found`);
    }

    const ability = await this.caslService.getUserAbility(userId);

    // Check if user can update this specific article
    if (
      ability.cannot(Action.UPDATE, article) &&
      ability.cannot('super-modify', 'Article')
    ) {
      throw new ForbiddenException(
        'You do not have permission to modify this article',
      );
    }
  }

  /**
   * Removes a specific file from an article
   *
   * This method removes the association between an article and a file.
   * If the file is no longer used by any other entity, it will be deleted
   * from storage to prevent orphaned files.
   *
   * @param articleId - The ID of the article
   * @param fileId - The ID of the file to remove from the article
   * @throws NotFoundException - If the article or file doesn't exist
   * @returns A promise that resolves to the updated article
   */
  async removeFileFromArticle(
    articleId: number,
    fileId: string,
  ): Promise<ResponseArticleDto> {
    // First find the article with its files
    const article = await this.articleRepository.findOne({
      where: { id: articleId },
      relations: ['files'],
    });

    if (!article) {
      throw new NotFoundException(`Article with ID "${articleId}" not found`);
    }

    // Check if the file is currently associated with the article
    const fileIndex = article.files.findIndex((file) => file.id === fileId);

    if (fileIndex === -1) {
      throw new NotFoundException(
        `File with ID "${fileId}" is not associated with article ${articleId}`,
      );
    }

    // Remove the file from the article's files array
    article.files.splice(fileIndex, 1);

    // Save the updated article
    const savedArticle = await this.articleRepository.save(article);

    // Now check if the file is still used by other entities
    // If not, we can delete it completely (from storage and database)
    await this.fileRepositoryService.removeCompletely(fileId, false);

    this.logger.log(`Removed file ${fileId} from article ${articleId}`);

    return plainToInstance(ResponseArticleDto, savedArticle, {
      excludeExtraneousValues: true,
    });
  }
}
