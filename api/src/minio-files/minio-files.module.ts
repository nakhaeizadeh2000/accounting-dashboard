import { Module, forwardRef } from '@nestjs/common';
import { CaslModule } from 'src/casl/casl.module';
import { JwtService } from '@nestjs/jwt';
import { MinioFilesController } from './controllers/minio-files.controller';

@Module({
  imports: [
    // TypeOrmModule.forFeature([Permission]),
    forwardRef(() => CaslModule),
  ],
  controllers: [MinioFilesController],
  providers: [
    // PermissionService,
    JwtService
  ],
  // exports: [PermissionService],
})
export class MinioFilesModule { }
