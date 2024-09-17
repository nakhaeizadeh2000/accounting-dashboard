import { User } from '../entities/user.entity';
import { faker } from '@faker-js/faker';

export const specificUsersId: string[] = [
  'feffbd36-bec1-43aa-9711-dd96d36210c3',
  '87e03477-3084-4a7f-93b6-7ee8a60450fa',
  'f8c868bb-1d1a-4012-b441-811142f7ee32',
  '081c2609-6992-42cd-bdd8-3bf7294e6b7d',
];

export const specificUsers: Partial<User>[] = [
  {
    id: 'feffbd36-bec1-43aa-9711-dd96d36210c3',
    firstName: 'امیرحسین',
    lastName: 'نخعی زاده',
    email: 'nakhaeizadeh2000@gmail.com',
    password: 'amir123amir',
    isAdmin: true,
  },
  {
    id: '87e03477-3084-4a7f-93b6-7ee8a60450fa',
    firstName: 'احمد',
    lastName: 'اقبالی',
    email: 'admin1@gmail.com',
    password: 'admin1admin',
    isAdmin: true,
  },
  {
    id: 'f8c868bb-1d1a-4012-b441-811142f7ee32',
    firstName: 'حسین',
    lastName: 'شریعتی',
    email: 'admin2@gmail.com',
    password: 'admin2admin',
    isAdmin: true,
  },
  {
    id: '081c2609-6992-42cd-bdd8-3bf7294e6b7d',
    firstName: 'یاسین',
    lastName: 'تنومند',
    email: 'admin3@gmail.com',
    password: 'admin3admin',
    isAdmin: true,
  },
];

export const createUserFactory = async (): Promise<Partial<User>> => {
  return {
    email: faker.internet.email(),
    password: faker.lorem.word(10),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    isAdmin: false,
  };
};

export const userData = async (count: number = 10) => {
  const users: User[] = [];
  for (let i = 0; i < count; i++) {
    const userData = await createUserFactory();
    users.push(userData as User);
  }
  return users;
};
