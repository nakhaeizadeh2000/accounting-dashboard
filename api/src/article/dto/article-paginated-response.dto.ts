// src/article/dto/article-paginated-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { ResponseArticleDto } from './response-article.dto';
import { IsArray, IsNumber, IsPositive } from 'class-validator';
import { Expose } from 'class-transformer';

export class ArticlePaginatedResponseDto {
  @ApiProperty({
    description: 'List of articles',
    type: [ResponseArticleDto],
  })
  @IsArray()
  @Expose()
  items: ResponseArticleDto[];

  @ApiProperty({
    description: 'Total number of articles available',
    example: 100,
  })
  @IsNumber()
  @IsPositive()
  @Expose()
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  @Expose()
  currentPage: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 10,
  })
  @IsNumber()
  @IsPositive()
  @Expose()
  totalPages: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  @IsNumber()
  @IsPositive()
  @Expose()
  pageSize: number;
}
