import { faker } from '@faker-js/faker';
import { CreateArticleDto } from '../dto/create-article.dto';
// import _ from 'lodash';
const _ = require('lodash');
import { specificUsersId } from 'src/modules/users/seeders/user.factory';

export const createArticleFactory = (): CreateArticleDto => {
  const authorId = _.sample(specificUsersId);
  return {
    title: faker.lorem.word({ length: { min: 3, max: 5 } }),
    content: faker.lorem.paragraphs({ min: 3, max: 8 }),
    authorId,
  };
};

export const articleData = (count: number = 10): CreateArticleDto[] => {
  const articles: CreateArticleDto[] = [];
  for (let i = 0; i < count; i++) {
    const articleData = createArticleFactory();
    articles.push(articleData);
  }
  return articles;
};
