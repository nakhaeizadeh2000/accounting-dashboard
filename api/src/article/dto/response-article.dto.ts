import { Expose, Transform, Type } from 'class-transformer';
import { IsDate, IsNumber, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
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
    example: 'Introduction to NestJS',
    minLength: 1,
    maxLength: 255,
  })
  title: string;

  @Expose()
  @IsString()
  @ApiProperty({
    description: 'The main content of the article',
    example: 'NestJS is a progressive Node.js framework...',
  })
  content: string;

  @Expose()
  @IsNumber()
  @ApiProperty({
    description: 'The ID of the author who wrote the article',
    example: 1,
  })
  authorId: string;

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

  constructor(partial: Partial<ResponseArticleDto>) {
    Object.assign(this, partial);
  }
}
