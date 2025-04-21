// src/article/dto/response-article.dto.ts
import { Expose, Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ResponseFileDto } from 'src/minio-files/dto/response-file.dto';
import { ResponseUserDto } from 'src/users/dto/response-user.dto';

export class ResponseArticleDto {
  @Expose()
  @IsNumber()
  @ApiProperty({
    description: 'The unique identifier of the article',
    example: 1,
  })
  id: number;

  @Expose()
  @IsString()
  @Length(1, 255)
  @ApiProperty({
    description: 'The title of the article',
    example: 'Understanding TypeORM Relationships',
    minLength: 1,
    maxLength: 255,
  })
  title: string;

  @Expose()
  @IsString()
  @ApiProperty({
    description: 'The main content of the article',
    example:
      'TypeORM provides several types of relationships including one-to-one, one-to-many, and many-to-many...',
  })
  content: string;

  @Expose()
  @IsUUID()
  @ApiProperty({
    description: 'The ID of the author who wrote the article',
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
  })
  authorId: string;

  @Expose()
  @Type(() => ResponseUserDto)
  @ApiProperty()
  author: ResponseUserDto;

  @Expose()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  @ApiProperty({
    description: 'The date and time when the article was created',
    example: '2024-08-16T12:00:00Z',
  })
  createdAt: Date;

  @Expose()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  @ApiProperty({
    description: 'The date and time when the article was last updated',
    example: '2024-08-16T14:30:00Z',
  })
  updatedAt: Date;

  @Expose()
  @IsOptional()
  @IsArray()
  @Type(() => ResponseFileDto)
  @ApiPropertyOptional({
    description: 'Files associated with this article',
    type: [ResponseFileDto],
  })
  files?: ResponseFileDto[];

  constructor(partial: Partial<ResponseArticleDto>) {
    Object.assign(this, partial);
  }
}
