import { hashSync } from 'bcryptjs';

export const users = [
  {
    email: 'admin@example.com',
    password: hashSync('admin123', 10),
    firstName: 'Admin',
    lastName: 'User',
    isAdmin: true,
  },
  {
    email: 'user@example.com',
    password: hashSync('user123', 10),
    firstName: 'Regular',
    lastName: 'User',
    isAdmin: false,
  },
];
