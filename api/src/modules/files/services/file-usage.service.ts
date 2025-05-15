import { Injectable } from '@nestjs/common';
import { FileRepositoryService } from './file.repository.service';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { File } from '../entities/file.entity';

@Injectable()
export class FileUsageService {
  constructor(
    private readonly fileRepository: FileRepositoryService,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) { }

  /**
   * Update the isUsed status for files based on their usage in related entities
   * @param fileIds Array of file IDs to update
   * @param isUsed Boolean indicating whether the files are being used
   */
  async updateFilesUsageStatus(fileIds: string[], isUsed: boolean): Promise<void> {
    if (!fileIds || fileIds.length === 0) return;

    await this.entityManager.update(File, fileIds, { isUsed });
  }

  /**
   * Check if files are being used in any related entities
   * This method can be expanded as more relationships are added
   */
  async refreshFilesUsageStatus(): Promise<void> {
    // Using a raw query for efficiency to update all files at once
    await this.entityManager.query(`
      UPDATE files
      SET "isUsed" = EXISTS (
        SELECT 1 FROM article_files_files
        WHERE article_files_files."filesId" = files.id
      )
    `);
  }

  /**
   * Get all unused files
   * @returns Array of unused files
   */
  async getUnusedFiles() {
    return this.fileRepository.findByQuery({ isUsed: false });
  }
}
