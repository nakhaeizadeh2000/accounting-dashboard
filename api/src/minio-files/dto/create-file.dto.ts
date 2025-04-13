// src/minio-files/dto/create-file.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class CreateFileDto {
  @ApiProperty({ description: 'Original file name' })
  @IsString()
  @Expose()
  originalName: string;

  @ApiProperty({ description: 'Unique file name in the bucket' })
  @IsString()
  @Expose()
  uniqueName: string;

  @ApiProperty({ description: 'File size in bytes' })
  @IsNumber()
  @Expose()
  size: number;

  @ApiProperty({ description: 'File MIME type' })
  @IsString()
  @Expose()
  mimetype: string;

  @ApiPropertyOptional({ description: 'Thumbnail file name (if available)' })
  @IsOptional()
  @IsString()
  @Expose()
  thumbnailName?: string;

  @ApiPropertyOptional({ description: 'Presigned URL for accessing the file' })
  @IsOptional()
  @IsString()
  @Expose()
  url?: string;

  @ApiPropertyOptional({
    description: 'Presigned URL for accessing the thumbnail (if available)',
  })
  @IsOptional()
  @IsString()
  @Expose()
  thumbnailUrl?: string;

  @ApiProperty({ description: 'Bucket name where the file is stored' })
  @IsString()
  @Expose()
  bucket: string;
}
