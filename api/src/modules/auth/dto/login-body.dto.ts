import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginBodyDto {
  @ApiProperty({ example: 'nakhaeizadeh2000@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'amir123amir' })
  @IsString()
  password: string;
}
