import { Module, forwardRef } from '@nestjs/common';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory/casl-ability.factory';
import { RoleService } from './services/role.service';
import { RoleController } from './controllers/role.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { CaslModule } from 'src/casl/casl.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Role]), forwardRef(() => CaslModule)],
  controllers: [RoleController],
  providers: [RoleService, JwtService],
  exports: [RoleService, TypeOrmModule.forFeature([Role])],
})
export class RoleModule {}
