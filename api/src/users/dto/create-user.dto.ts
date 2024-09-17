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
  @IsEmail()
  @Expose()
  email: string;

  @ApiProperty({ example: 'amir123amir' })
  @IsString()
  @MinLength(8)
  @Exclude({ toPlainOnly: true })
  password: string;

  @ApiProperty({ example: 'امیرحسین' })
  @IsString()
  @Expose()
  firstName: string;

  @ApiProperty({ example: 'نخعی زاده' })
  @IsString()
  @Expose()
  lastName: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  @IsBoolean()
  @Exclude({ toClassOnly: true })
  isAdmin: boolean;
}
