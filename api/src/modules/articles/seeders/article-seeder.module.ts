import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../entities/article.entity';
import { ArticleSeederService } from './article-seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([Article])],
  providers: [ArticleSeederService],
  exports: [ArticleSeederService],
})
export class ArticleSeederModule { }
