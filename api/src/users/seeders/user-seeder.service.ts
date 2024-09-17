import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { specificUsers, userData } from './user.factory';
import { hashSync } from 'bcryptjs';

@Injectable()
export class UserSeederService {
  private userRepository: Repository<User>;
  constructor(private dataSource: DataSource) {
    // get users table repository to interact with the database
    this.userRepository = this.dataSource.getRepository(User);
  }

  async create() {
    try {
      const users = await userData(); // Await the user data

      const existSpecificUser = await this.userRepository.findOne({
        where: { email: 'nakhaeizadeh2000@gmail.com' },
      });

      if (!existSpecificUser?.id) {
        users.push(...(specificUsers as User[]));
      }

      const savePromises = users.map(async (user) => {
        try {
          const hashedPassword = await hashSync(user.password, 10);

          const userEntity = this.userRepository.create({
            ...user,
            password: hashedPassword,
          });
          await this.userRepository.save(userEntity);
        } catch (error) {
          console.error('Error saving user:', error);
          throw error; // Rethrow to catch in the outer try-catch
        }
      });

      await Promise.all(savePromises); // Wait for all saves to complete
      return true; // Return true if all saves are successful
    } catch (error) {
      console.error('Error during user creation:', error);
      throw error; // Rethrow the error for handling in the calling method
    }
  }
}
