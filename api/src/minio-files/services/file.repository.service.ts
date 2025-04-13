// src/minio-files/services/file.repository.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from '../entities/file.entity';
import { CreateFileDto } from '../dto/create-file.dto';
import { plainToInstance } from 'class-transformer';
import { ResponseFileDto } from '../dto/response-file.dto';

@Injectable()
export class FileRepositoryService {
  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
  ) {}

  async createFile(createFileDto: CreateFileDto): Promise<ResponseFileDto> {
    const file = this.fileRepository.create(createFileDto);
    const savedFile = await this.fileRepository.save(file);
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
}
