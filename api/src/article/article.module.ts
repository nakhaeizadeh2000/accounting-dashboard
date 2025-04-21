// src/article/article.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { ArticleController } from './controllers/article.controller';
import { ArticleService } from './services/article.service';
import { CaslModule } from 'src/casl/casl.module';
import { JwtService } from '@nestjs/jwt';
import { MinioFilesModule } from 'src/minio-files/minio-files.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article]),
    forwardRef(() => CaslModule),
    forwardRef(() => MinioFilesModule), // Import MinioFilesModule to use its services
  ],
  controllers: [ArticleController],
  providers: [ArticleService, JwtService],
  exports: [ArticleService], // Export the service in case it's needed elsewhere
})
export class ArticleModule {}
