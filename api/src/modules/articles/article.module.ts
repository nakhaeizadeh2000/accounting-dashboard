import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { FilesModule } from 'src/modules/files/files.module';
import { CaslLegacyModule } from 'src/modules/casl-legacy/casl.module';
import { Article } from './entities/article.entity';
import { ArticleController } from './controllers/article.controller';
import { ArticleService } from './services/article.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article]),
    forwardRef(() => CaslLegacyModule),
    forwardRef(() => FilesModule),
  ],
  controllers: [ArticleController],
  providers: [ArticleService, JwtService],
  exports: [ArticleService], // Export the service in case it's needed elsewhere
})
export class ArticleModule {}
