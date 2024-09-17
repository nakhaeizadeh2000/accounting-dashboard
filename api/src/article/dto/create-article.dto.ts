import { IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CreateArticleDto {
  @ApiProperty({ description: 'The title of the article' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @Expose()
  title: string;

  @ApiProperty({ description: 'The content of the article' })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @Expose()
  content: string;

  @ApiProperty({
    description: 'The ID of the author (user)',
    type: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  authorId: string;
}
