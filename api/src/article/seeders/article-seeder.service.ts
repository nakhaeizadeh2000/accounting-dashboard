import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Article } from '../entities/article.entity';
import { articleData } from './article.factory';

@Injectable()
export class ArticleSeederService {
  private articleRepository: Repository<Article>;

  constructor(private dataSource: DataSource) {
    this.articleRepository = this.dataSource.getRepository(Article);
  }

  async create(count: number = 500) {
    try {
      const articles = articleData(count);

      const savePromises = articles.map(async (article) => {
        try {
          const articleEntity = this.articleRepository.create(article);
          await this.articleRepository.save(articleEntity);
        } catch (error) {
          console.error('Error saving article:', error);
          throw error;
        }
      });

      await Promise.all(savePromises);
      return true;
    } catch (error) {
      console.error('Error during article creation:', error);
      throw error;
    }
  }
}
