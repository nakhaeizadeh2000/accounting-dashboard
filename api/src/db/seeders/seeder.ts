import { Injectable, Logger } from '@nestjs/common';
import { UserSeederService } from 'src/users/seeders/user-seeder.service';
import { ArticleSeederService } from '../../article/seeders/article-seeder.service';

@Injectable()
export class Seeder {
  constructor(
    private readonly logger: Logger,
    private readonly userSeederService: UserSeederService,
    private readonly articleSeederService: ArticleSeederService,
  ) {}
  async seed() {
    // seed users
    await this.userSeederService
      .create()
      .then((completed) => {
        this.logger.debug('Successfuly completed seeding users...');
        Promise.resolve(completed);
      })
      .catch((error) => {
        this.logger.error('Failed seeding users...');
        Promise.reject(error);
      });

    // seed articles
    await this.articleSeederService
      .create()
      .then((completed) => {
        this.logger.debug('Successfuly completed seeding articles...');
        Promise.resolve(completed);
      })
      .catch((error) => {
        this.logger.error('Failed seeding articles...');
        Promise.reject(error);
      });
  }
}
