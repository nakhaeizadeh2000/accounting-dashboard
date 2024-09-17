import {
  IsString,
  IsOptional,
  IsUUID,
  IsNotEmpty,
  IsNumber,
  IsJSON,
  IsBoolean,
  IsObject,
  IsArray,
} from 'class-validator';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  @Expose()
  @ApiProperty({ name: 'action', example: 'read' })
  action: string;

  @IsString()
  @IsNotEmpty()
  @Expose()
  @ApiProperty({ name: 'subject', example: 'Article' })
  subject: string;

  @IsArray()
  @IsOptional()
  @Expose()
  @ApiProperty({ name: 'fields' })
  fields?: string[];

  @IsObject()
  @IsOptional()
  @Expose()
  @ApiProperty({ name: 'conditions' })
  conditions?: Object;

  @IsBoolean()
  @IsOptional()
  @Expose()
  @ApiProperty({
    name: 'inverted',
    type: Boolean,
    default: false,
    example: false,
  })
  inverted?: boolean;
}
