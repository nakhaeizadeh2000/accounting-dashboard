import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersController } from './controllers/user.controller';
import { RoleModule } from 'src/role/role.module';
import { JwtService } from '@nestjs/jwt';
import { CaslLegacyModule } from '../casl-legacy/casl.module';
import { UsersService } from './services/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => CaslLegacyModule),
    RoleModule,
  ],
  providers: [UsersService, JwtService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
