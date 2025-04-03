import { Module, forwardRef } from '@nestjs/common';
import { CaslModule } from 'src/casl/casl.module';
import { JwtService } from '@nestjs/jwt';
import { MinioFilesController } from './controllers/minio-files.controller';
import { MinioFilesService } from './services/minio-files.service';
import { MinioConfigService } from 'config/minio/minio-legacy.config';

@Module({
  imports: [
    // TypeOrmModule.forFeature([Permission]),
    forwardRef(() => CaslModule),
  ],
  controllers: [MinioFilesController],
  providers: [
    // PermissionService,
    JwtService,
    MinioConfigService,
    MinioFilesService,
  ],
  // exports: [PermissionService],
})
export class MinioFilesModule {}
