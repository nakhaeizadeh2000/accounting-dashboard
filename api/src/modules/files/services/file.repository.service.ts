import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsWhere, In, Repository } from 'typeorm';
import { File } from '../entities/file.entity';
import { CreateFileDto } from '../dto/create-file.dto';
import { plainToInstance } from 'class-transformer';
import { ResponseFileDto } from '../dto/response-file.dto';
import { MinioFilesService } from './minio-files.service';

@Injectable()
export class FileRepositoryService {
  private readonly logger = new Logger(FileRepositoryService.name);

  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    @Inject(forwardRef(() => MinioFilesService))
    private minioFilesService: MinioFilesService,
  ) {}

  async createFile(createFileDto: CreateFileDto): Promise<ResponseFileDto> {
    const file = this.fileRepository.create(createFileDto);
    const savedFile = await this.fileRepository.save(file);
    return plainToInstance(ResponseFileDto, savedFile, {
      excludeExtraneousValues: true,
    });
  }

  async createFileWithTransaction(
    createFileDto: CreateFileDto,
    manager: EntityManager,
  ): Promise<ResponseFileDto> {
    const file = this.fileRepository.create(createFileDto);
    const savedFile = await manager.save(file);
    return plainToInstance(ResponseFileDto, savedFile, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(): Promise<ResponseFileDto[]> {
    const files = await this.fileRepository.find();
    return files.map((file) =>
      plainToInstance(ResponseFileDto, file, { excludeExtraneousValues: true }),
    );
  }

  async findOne(id: string): Promise<ResponseFileDto> {
    const file = await this.fileRepository.findOne({ where: { id } });
    return plainToInstance(ResponseFileDto, file, {
      excludeExtraneousValues: true,
    });
  }

  async findByUniqueName(uniqueName: string): Promise<ResponseFileDto> {
    const file = await this.fileRepository.findOne({ where: { uniqueName } });
    return plainToInstance(ResponseFileDto, file, {
      excludeExtraneousValues: true,
    });
  }

  async findByUniqueNames(uniqueNames: string[]): Promise<ResponseFileDto[]> {
    if (uniqueNames.length === 0) return [];
    const files = await this.fileRepository.find({
      where: { uniqueName: In(uniqueNames) },
    });
    return files.map((file) =>
      plainToInstance(ResponseFileDto, file, { excludeExtraneousValues: true }),
    );
  }

  async findByIds(ids: string[]): Promise<ResponseFileDto[]> {
    if (ids.length === 0) return [];
    const files = await this.fileRepository.find({
      where: { id: In(ids) },
    });
    return files.map((file) =>
      plainToInstance(ResponseFileDto, file, { excludeExtraneousValues: true }),
    );
  }

  async findByBucket(bucket: string): Promise<ResponseFileDto[]> {
    const files = await this.fileRepository.find({ where: { bucket } });
    return files.map((file) =>
      plainToInstance(ResponseFileDto, file, { excludeExtraneousValues: true }),
    );
  }

  async findByQuery(query: FindOptionsWhere<File>): Promise<ResponseFileDto[]> {
    const files = await this.fileRepository.find({ where: query });
    return files.map((file) =>
      plainToInstance(ResponseFileDto, file, { excludeExtraneousValues: true }),
    );
  }

  /**
   * Simple database removal - use with caution
   * This only removes the database record, not the actual file
   * @param id ID of the file to remove from database
   */
  async remove(id: string): Promise<void> {
    await this.fileRepository.delete(id);
  }

  async getFilesByArticleId(articleId: number): Promise<ResponseFileDto[]> {
    const files = await this.fileRepository
      .createQueryBuilder('file')
      .innerJoin('file.articles', 'article')
      .where('article.id = :articleId', { articleId })
      .getMany();

    return files.map((file) =>
      plainToInstance(ResponseFileDto, file, { excludeExtraneousValues: true }),
    );
  }

  // This method will associate a file with an article
  async addFileToArticle(fileId: string, articleId: number): Promise<void> {
    await this.fileRepository
      .createQueryBuilder()
      .relation(File, 'articles')
      .of(fileId)
      .add(articleId);
  }

  // Remove a file from an article
  async removeFileFromArticle(
    fileId: string,
    articleId: number,
  ): Promise<void> {
    await this.fileRepository
      .createQueryBuilder()
      .relation(File, 'articles')
      .of(fileId)
      .remove(articleId);
  }

  /**
   * Update the usage status of a file
   * @param fileId ID of the file to update
   * @param isUsed New usage status
   */
  async updateUsageStatus(fileId: string, isUsed: boolean): Promise<void> {
    await this.fileRepository.update(fileId, { isUsed });
  }

  /**
   * Update multiple files as used
   * Convenience method to mark multiple files as used
   * @param fileIds Array of file IDs to mark as used
   */
  async markFilesAsUsed(fileIds: string[]): Promise<void> {
    if (!fileIds || fileIds.length === 0) return;
    await this.fileRepository.update(fileIds, { isUsed: true });
  }

  /**
   * Update the usage status of multiple files
   * @param fileIds Array of file IDs to update
   * @param isUsed New usage status
   */
  async updateMultipleUsageStatus(
    fileIds: string[],
    isUsed: boolean,
  ): Promise<void> {
    if (!fileIds || fileIds.length === 0) return;
    await this.fileRepository.update(fileIds, { isUsed });
  }

  /**
   * Find files by their usage status
   * @param isUsed Usage status to filter by
   */
  async findByUsageStatus(isUsed: boolean): Promise<ResponseFileDto[]> {
    const files = await this.fileRepository.find({ where: { isUsed } });
    return files.map((file) =>
      plainToInstance(ResponseFileDto, file, { excludeExtraneousValues: true }),
    );
  }

  /**
   * Check if a file is used by any entities and update its status accordingly
   *
   * This method examines if a file is referenced by any entities (like articles)
   * and updates its isUsed flag to reflect the current status.
   *
   * @param fileId ID of the file to check
   * @returns True if the file is used by at least one entity, false otherwise
   */
  async checkFileUsageAndUpdate(fileId: string): Promise<boolean> {
    // Check if the file is used by any entities
    const isInUse = await this.isFileInUse(fileId);

    // Update the file's isUsed status to match reality
    await this.updateUsageStatus(fileId, isInUse);

    this.logger.debug(`Updated file ${fileId} usage status to: ${isInUse}`);
    return isInUse;
  }

  /**
   * Remove a file completely - from database and storage
   * This method handles:
   * 1. Checking if the file is used by other entities
   * 2. Removing the file from MinIO storage
   * 3. Removing the file from the database
   *
   * @param id ID of the file to remove
   * @param forceDelete If true, delete even if used by other entities
   * @returns True if file was deleted, false if it's still in use and not force deleted
   */
  async removeCompletely(
    id: string,
    forceDelete: boolean = false,
  ): Promise<boolean> {
    // Find the file with its relations
    const file = await this.fileRepository.findOne({
      where: { id },
      relations: ['articles'], // Add other relations as needed
    });

    if (!file) {
      this.logger.warn(`File with ID ${id} not found, nothing to delete`);
      return true; // Nothing to delete
    }

    // Check if the file is used by any articles
    const isUsedByArticles = file.articles && file.articles.length > 0;

    // If the file is used and we're not forcing deletion, don't delete
    if (isUsedByArticles && !forceDelete) {
      this.logger.log(
        `File ${id} is used by ${file.articles.length} articles, not deleting`,
      );
      return false;
    }

    try {
      // Delete from MinIO
      await this.minioFilesService.deleteFile(file.bucket, file.uniqueName);

      // If there's a thumbnail, delete that too
      if (file.thumbnailName) {
        try {
          await this.minioFilesService.deleteFile(
            file.bucket,
            file.thumbnailName,
          );
        } catch (err) {
          this.logger.warn(`Error deleting thumbnail: ${err.message}`);
          // Continue even if thumbnail deletion fails
        }
      }

      // Delete from database - cascade will handle join tables
      await this.fileRepository.delete(id);

      this.logger.log(`Successfully deleted file ${id} (${file.originalName})`);
      return true;
    } catch (err) {
      this.logger.error(`Error deleting file ${id}: ${err.message}`, err.stack);
      throw err;
    }
  }

  /**
   * Check if a file is used by any entities
   * @param id File ID to check
   * @returns True if the file is used by any entity
   */
  async isFileInUse(id: string): Promise<boolean> {
    const file = await this.fileRepository.findOne({
      where: { id },
      relations: ['articles'], // Add other relations as needed
    });

    if (!file) return false;

    // Check if used by articles
    const isUsedByArticles = file.articles && file.articles.length > 0;

    // Add checks for other entities as needed
    // const isUsedByOtherEntities = ...

    return isUsedByArticles; // || isUsedByOtherEntities || ...
  }
}
