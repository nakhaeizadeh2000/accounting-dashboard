import { OmitType } from '@nestjs/swagger';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';

export class RegisterDto extends OmitType(CreateUserDto, ['isAdmin']) { }
