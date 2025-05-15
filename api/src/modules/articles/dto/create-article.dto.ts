import {
  IsNotEmpty,
  IsString,
  IsUUID,
  MinLength,
  IsArray,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CreateArticleDto {
  @ApiProperty({
    description: 'The title of the article',
    example: 'Understanding TypeORM Relationships',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @Expose()
  title: string;

  @ApiProperty({
    description: 'The content of the article',
    example: 'TypeORM provides several types of relationships...',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @Expose()
  content: string;

  @ApiProperty({
    description: 'The ID of the author (user)',
    type: 'uuid',
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
  })
  @IsUUID()
  @IsNotEmpty()
  @Expose()
  authorId: string;

  @ApiPropertyOptional({
    description: 'Array of file IDs to associate with the article',
    type: [String],
    example: [
      'f1e2d3c4-b5a6-7890-abcd-1234567890ab',
      'f9e8d7c6-b5a4-3210-abcd-1234567890ab',
    ],
  })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  @Expose()
  fileIds?: string[];
}
