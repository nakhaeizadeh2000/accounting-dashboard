import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from '../../permissions/entities/permission.entity';
import { Role } from '../../role/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { CaslAbilityFactory } from './casl-ability.factory';
import { CaslService } from './casl.service';
import { AbilitiesGuard } from './guards/abilities.guard';
import { PermissionQueryBuilder } from './services/permission-query-builder.service';

@Module({})
export class CaslNewModule {
  static register(): DynamicModule {
    return {
      global: true,
      module: CaslNewModule,
      imports: [TypeOrmModule.forFeature([Permission, Role, User])],
      providers: [
        CaslAbilityFactory,
        CaslService,
        PermissionQueryBuilder,
        AbilitiesGuard,
      ],
      exports: [
        CaslAbilityFactory,
        CaslService,
        PermissionQueryBuilder,
        AbilitiesGuard,
      ],
    };
  }
}
