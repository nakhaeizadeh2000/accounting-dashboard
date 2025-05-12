import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { compareSync } from 'bcryptjs';
import { Strategy } from 'passport-local';
import { User } from 'src/modules/users/entities/user.entity';
import { UsersService } from 'src/modules/users/services/user.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      usernameField: 'email', // Specify the field name for the username
      passwordField: 'password', // Specify the field name for the password
    });
  }

  async validate(email: string, password: string): Promise<User> {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user; // the returned value will set as a metadata for each request in its user property.
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await compareSync(password, user.password))) {
      return user;
    } else {
      if (!user) {
        throw new NotFoundException(`کاربری با این مشخصات وجود ندارد!`);
      }
    }
    return null;
  }
}
