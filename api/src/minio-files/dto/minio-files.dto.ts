import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  IsDateString,
  Min,
  Max,
  ValidateIf,
  IsUUID,
} from 'class-validator';

export class FileMetadataDto {
  @ApiProperty({ description: 'File ID (from database)' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Original file name' })
  @IsString()
  originalName: string;

  @ApiProperty({ description: 'Unique file name in the bucket' })
  @IsString()
  uniqueName: string;

  @ApiProperty({ description: 'File size in bytes' })
  @IsNumber()
  size: number;

  @ApiProperty({ description: 'File MIME type' })
  @IsString()
  mimetype: string;

  @ApiPropertyOptional({ description: 'Thumbnail file name (if available)' })
  @IsOptional()
  @IsString()
  thumbnailName?: string;

  @ApiPropertyOptional({ description: 'Presigned URL for accessing the file' })
  @IsOptional() // Make URL optional
  @IsString()
  url?: string; // Now optional

  @ApiPropertyOptional({
    description: 'Presigned URL for accessing the thumbnail (if available)',
  })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiProperty({ description: 'Bucket name where the file is stored' })
  @IsString()
  bucket: string;

  @ApiProperty({ description: 'Date when the file was uploaded' })
  @IsDateString()
  uploadedAt: Date;

  @ApiPropertyOptional({ description: 'Error message if upload failed' })
  @IsOptional()
  @IsString()
  error?: string;

  @ApiPropertyOptional({ description: 'Whether the upload was successful' })
  @IsOptional()
  @IsBoolean()
  success?: boolean;
}

export class UploadFileResponseDto {
  @ApiProperty({ description: 'Success message' })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Array of uploaded file metadata',
    type: [FileMetadataDto],
  })
  @IsArray()
  files: FileMetadataDto[];

  @ApiPropertyOptional({
    description: 'Array of failed file uploads with errors',
    type: [FileMetadataDto],
  })
  @IsOptional()
  @IsArray()
  failures?: FileMetadataDto[];
}

export class DownloadUrlResponseDto {
  @ApiProperty({ description: 'Presigned URL for downloading the file' })
  @IsString()
  url: string;
}

export class BatchDownloadUrlResponseDto {
  @ApiProperty({
    description: 'Object mapping filenames to their presigned URLs',
    example: {
      'file1.jpg': 'https://example.com/file1.jpg',
      'file2.pdf': 'https://example.com/file2.pdf',
    },
  })
  urls: Record<string, string>;
}

export class FileMetadataResponseDto {
  @ApiProperty({ description: 'File metadata', type: FileMetadataDto })
  metadata: FileMetadataDto;
}

export class ListFilesResponseDto {
  @ApiProperty({
    description: 'Array of file metadata',
    type: [FileMetadataDto],
  })
  @IsArray()
  files: FileMetadataDto[];
}

export class MessageResponseDto {
  @ApiProperty({ description: 'Success message' })
  @IsString()
  message: string;
}

export class BucketInfoDto {
  @ApiProperty({ description: 'Bucket name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Bucket creation date' })
  @IsDateString()
  creationDate: Date;
}

export class BucketsResponseDto {
  @ApiProperty({
    description: 'Array of bucket information',
    type: [BucketInfoDto],
  })
  @IsArray()
  buckets: BucketInfoDto[];
}

export class BucketConfigDto {
  @ApiPropertyOptional({
    description: 'Region for the bucket',
    default: 'us-east-1',
  })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({
    description: 'Whether to set a public policy for the bucket',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  publicPolicy?: boolean;
}
