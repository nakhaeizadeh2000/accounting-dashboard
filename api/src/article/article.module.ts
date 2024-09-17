import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { ArticleController } from './controllers/article.controller';
import { ArticleService } from './services/article.service';
import { CaslModule } from 'src/casl/casl.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Article]), forwardRef(() => CaslModule)],
  controllers: [ArticleController],
  providers: [ArticleService, JwtService],
})
export class ArticleModule {}
