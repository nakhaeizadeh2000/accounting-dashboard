import { PartialType } from '@nestjs/swagger';
import { CreateArticleDto } from './create-article.dto';
import { IsArray, IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UpdateArticleDto extends PartialType(CreateArticleDto) {
  // Override fileIds to ensure it's properly documented
  @ApiPropertyOptional({
    description:
      'Array of file IDs to associate with the article (replaces existing files)',
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
