import { CacheModule } from '@nestjs/cache-manager';
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { PermissionService } from './services/permission.service';
import { JwtService } from '@nestjs/jwt';
import { CaslModule } from 'src/modules/casl/casl.module';
import { PermissionController } from './controllers/permission.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission]),
    forwardRef(() => CaslModule),
  ],
  controllers: [PermissionController],
  providers: [PermissionService, JwtService],
  exports: [PermissionService],
})
export class PermissionModule { }
