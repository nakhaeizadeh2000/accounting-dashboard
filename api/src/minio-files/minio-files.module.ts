// src/minio-files/minio-files.module.ts
import { Module, forwardRef, Global } from '@nestjs/common';
import { CaslModule } from 'src/casl/casl.module';
import { JwtService } from '@nestjs/jwt';
import { MinioFilesService } from './services/minio-files.service';
import { MinioConfigService } from 'config/minio/minio.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MinioFilesController } from './controllers/minio-files.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { FileRepositoryService } from './services/file.repository.service';
import { FilesController } from './controllers/files.controller';

@Module({
  imports: [
    forwardRef(() => CaslModule),
    ConfigModule,
    TypeOrmModule.forFeature([File]),
    // If there's another module that imports MinioFilesModule and is also imported by MinioFilesModule,
    // you need to use forwardRef() here as well
  ],
  controllers: [MinioFilesController, FilesController],
  providers: [
    JwtService,
    MinioConfigService,
    MinioFilesService,
    ConfigService,
    FileRepositoryService,
    // Other providers
  ],
  exports: [
    MinioFilesService,
    MinioConfigService,
    FileRepositoryService,
    // Other exports
  ],
})
export class MinioFilesModule { }