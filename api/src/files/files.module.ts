import { Module, forwardRef } from '@nestjs/common';
import { CaslModule } from 'src/casl/casl.module';
import { JwtService } from '@nestjs/jwt';
import { FilesController } from './controllers/files.controller';

@Module({
  imports: [
    // TypeOrmModule.forFeature([Permission]),
    forwardRef(() => CaslModule),
  ],
  controllers: [FilesController],
  providers: [
    // PermissionService,
    JwtService
  ],
  // exports: [PermissionService],
})
export class FilesModule { }
