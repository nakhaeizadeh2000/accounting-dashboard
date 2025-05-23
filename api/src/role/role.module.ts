import { Module, forwardRef } from '@nestjs/common';
import { RoleService } from './services/role.service';
import { RoleController } from './controllers/role.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { JwtService } from '@nestjs/jwt';
import { CaslLegacyModule } from 'src/modules/casl-legacy/casl.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role]),
    forwardRef(() => CaslLegacyModule),
  ],
  controllers: [RoleController],
  providers: [RoleService, JwtService],
  exports: [RoleService, TypeOrmModule.forFeature([Role])],
})
export class RoleModule {}
