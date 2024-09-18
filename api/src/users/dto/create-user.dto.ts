// src/users/dto/create-user.dto.ts
import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Expose()
export class CreateUserDto {
  @ApiProperty({ example: 'nakhaeizadeh2000@gmail.com' })
  @IsEmail({}, { message: 'email ایمیل را به شکل صحیح وارد کنید ' })
  @Expose()
  email: string;

  @ApiProperty({ example: 'amir123amir' })
  @IsString({ message: 'password باید شامل کارکتر و حروف و اعداد باشد' })
  @MinLength(8, { message: 'password باید حداقل شامل ۸ کارکتر باشد' })
  @Exclude({ toPlainOnly: true })
  password: string;

  @ApiProperty({ example: 'امیرحسین' })
  @IsString({ message: 'firstName باید شامل کارکتر و حروف باشد' })
  @Expose()
  firstName: string;

  @ApiProperty({ example: 'نخعی زاده' })
  @IsString({ message: 'lastName باید شامل کارکتر و حروف باشد' })
  @Expose()
  lastName: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  @IsBoolean({ message: 'isAdmin باید شامل بلی یا خیر باشد' })
  @Exclude({ toClassOnly: true })
  isAdmin: boolean;
}
