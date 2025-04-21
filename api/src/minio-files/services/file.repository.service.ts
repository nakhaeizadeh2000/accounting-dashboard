import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsWhere, In, Repository } from 'typeorm';
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
