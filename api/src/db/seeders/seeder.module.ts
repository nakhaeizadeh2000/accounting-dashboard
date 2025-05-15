import { Logger, Module } from '@nestjs/common';
import { UserSeederModule } from 'src/modules/users/seeders/user-seeder.module';
import { Seeder } from './seeder';
import { SeederController } from './seeder.controller';
import { ArticleSeederModule } from 'src/modules/articles/seeders/article-seeder.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [SeederController],
  imports: [UserSeederModule, ArticleSeederModule],
  providers: [Logger, Seeder, JwtService],
  exports: [],
})
export class SeederModule { }
