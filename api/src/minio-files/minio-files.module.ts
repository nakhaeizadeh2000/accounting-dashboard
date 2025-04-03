import { Module, forwardRef, Global } from '@nestjs/common';
import { CaslModule } from 'src/casl/casl.module';
import { JwtService } from '@nestjs/jwt';
import { MinioFilesService } from './services/minio-files.service';
import { MinioConfigService } from 'config/minio/minio.config';
import { ConfigModule } from '@nestjs/config';
import { MinioFilesController } from './controllers/minio-files.controller';

@Module({
  imports: [forwardRef(() => CaslModule), ConfigModule],
  controllers: [MinioFilesController],
  providers: [JwtService, MinioConfigService, MinioFilesService],
  exports: [MinioFilesService, MinioConfigService],
})
export class MinioFilesModule {}
