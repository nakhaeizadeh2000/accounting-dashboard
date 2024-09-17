import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsArray,
  IsEmail,
  IsBoolean,
} from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';
import { ResponseRoleDto } from 'src/role/dto/response-role.dto';

export class ResponseUserRoleDto {
  @Expose()
  @ApiProperty()
  id: string;

  @IsEmail()
  @ApiProperty()
  @Expose()
  email: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  @Expose()
  firstName?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  @Expose()
  lastName?: string;

  @IsBoolean()
  @Exclude({ toClassOnly: true })
  isAdmin: boolean;

  @IsOptional()
  @ApiProperty()
  @IsArray()
  @Type(() => ResponseRoleDto)
  @Expose()
  roles?: ResponseRoleDto[];

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
