import { Module, forwardRef, Global } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MinioFilesService } from './services/minio-files.service';
import { MinioConfigService } from 'src/config/minio/minio.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MinioFilesController } from './controllers/minio-files.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { FileRepositoryService } from './services/file.repository.service';
import { FilesController } from './controllers/files.controller';
import { CaslModule } from '../casl-legacy/casl.module';

@Module({
  imports: [
    forwardRef(() => CaslModule),
    ConfigModule,
    TypeOrmModule.forFeature([File]),
    // If there's another module that imports FilesModule and is also imported by FilesModule,
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
export class FilesModule {}
