// src/minio-files/dto/response-file.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Expose } from 'class-transformer';

export class ResponseFileDto {
  @ApiProperty({ description: 'File ID (from database)' })
  @IsUUID()
  @Expose()
  id: string;

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

  @ApiPropertyOptional({ description: 'URL for accessing the file' })
  @IsOptional()
  @IsString()
  @Expose()
  url?: string;

  @ApiPropertyOptional({
    description: 'URL for accessing the thumbnail (if available)',
  })
  @IsOptional()
  @IsString()
  @Expose()
  thumbnailUrl?: string;

  @ApiProperty({ description: 'Bucket name where the file is stored' })
  @IsString()
  @Expose()
  bucket: string;

  @ApiProperty({ description: 'Creation date' })
  @IsDate()
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  @IsDate()
  @Expose()
  updatedAt: Date;
}
