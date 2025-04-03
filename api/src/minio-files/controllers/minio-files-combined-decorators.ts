import {
  applyDecorators,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'common/guards/jwt-auth.guard';
import { CheckPolicies } from 'src/casl/check-policies.decorator';
import { PoliciesGuard } from 'src/casl/policies.guard';
import { AppAbility } from 'src/casl/casl-ability.factory/casl-ability.factory';

// controller
export function filesControllerDecorators() {
  return applyDecorators(
    ApiTags('files'),
    Controller('files'),
    UseGuards(JwtAuthGuard, PoliciesGuard),
    ApiBearerAuth(),
  );
}

// upload
export function filesUploadEndpointDecorators() {
  return applyDecorators(
    Post('upload/:bucket'),
    ApiOperation({ summary: 'Upload files to MinIO' }),
    ApiConsumes('multipart/form-data'),
    ApiParam({ name: 'bucket', description: 'The bucket to upload to' }),
    ApiQuery({
      name: 'generateThumbnail',
      required: false,
      description: 'Whether to generate thumbnails for supported files',
    }),
    ApiQuery({
      name: 'maxSizeMB',
      required: false,
      description: 'Maximum file size in MB',
    }),
    ApiQuery({
      name: 'allowedMimeTypes',
      required: false,
      description: 'Comma-separated list of allowed MIME types',
    }),
    ApiResponse({
      status: 200,
      description: 'Files uploaded successfully',
    }),
    ApiResponse({ status: 400, description: 'Bad request' }),
    CheckPolicies(
      (ability: AppAbility) =>
        ability.can('create', 'Files') || ability.can('super-modify', 'Files'),
    ),
  );
}

// download
export function filesDownloadEndpointDecorators() {
  return applyDecorators(
    Get('download/:bucket/:filename'),
    ApiOperation({ summary: 'Get a presigned URL for downloading a file' }),
    ApiParam({ name: 'bucket', description: 'The bucket containing the file' }),
    ApiParam({ name: 'filename', description: 'The filename to download' }),
    ApiQuery({
      name: 'expiry',
      required: false,
      description: 'URL expiry time in seconds (default: 24 hours)',
    }),
    ApiResponse({
      status: 200,
      description: 'Presigned URL generated successfully',
    }),
    ApiResponse({ status: 404, description: 'File not found' }),
    CheckPolicies(
      (ability: AppAbility) =>
        ability.can('read', 'Files') || ability.can('super-modify', 'Files'),
    ),
  );
}

// batch download
export function filesBatchDownloadEndpointDecorators() {
  return applyDecorators(
    Get('batch-download'),
    ApiOperation({ summary: 'Get presigned URLs for multiple files' }),
    ApiQuery({
      name: 'bucket',
      required: true,
      description: 'The bucket containing the files',
    }),
    ApiQuery({
      name: 'filenames',
      required: true,
      description: 'Comma-separated list of filenames',
    }),
    ApiQuery({
      name: 'expiry',
      required: false,
      description: 'URL expiry time in seconds (default: 24 hours)',
    }),
    ApiResponse({
      status: 200,
      description: 'Presigned URLs generated successfully',
    }),
    ApiResponse({ status: 400, description: 'Bad request' }),
    CheckPolicies(
      (ability: AppAbility) =>
        ability.can('read', 'Files') || ability.can('super-modify', 'Files'),
    ),
  );
}

// metadata
export function filesMetadataEndpointDecorators() {
  return applyDecorators(
    Get('metadata/:bucket/:filename'),
    ApiOperation({ summary: 'Get metadata for a file' }),
    ApiParam({ name: 'bucket', description: 'The bucket containing the file' }),
    ApiParam({
      name: 'filename',
      description: 'The filename to get metadata for',
    }),
    ApiResponse({
      status: 200,
      description: 'File metadata retrieved successfully',
    }),
    ApiResponse({ status: 404, description: 'File not found' }),
    CheckPolicies(
      (ability: AppAbility) =>
        ability.can('read', 'Files') || ability.can('super-modify', 'Files'),
    ),
  );
}

// list files
export function filesListEndpointDecorators() {
  return applyDecorators(
    Get('list/:bucket'),
    ApiOperation({ summary: 'List files in a bucket' }),
    ApiParam({ name: 'bucket', description: 'The bucket to list files from' }),
    ApiQuery({
      name: 'prefix',
      required: false,
      description: 'Filter files by prefix',
    }),
    ApiQuery({
      name: 'recursive',
      required: false,
      description: 'Whether to list files recursively',
    }),
    ApiResponse({
      status: 200,
      description: 'Files listed successfully',
    }),
    ApiResponse({ status: 404, description: 'Bucket not found' }),
    CheckPolicies(
      (ability: AppAbility) =>
        ability.can('read', 'Files') || ability.can('super-modify', 'Files'),
    ),
  );
}

// delete file
export function filesDeleteEndpointDecorators() {
  return applyDecorators(
    Delete('delete/:bucket/:filename'),
    ApiOperation({ summary: 'Delete a file from MinIO' }),
    ApiParam({ name: 'bucket', description: 'The bucket containing the file' }),
    ApiParam({ name: 'filename', description: 'The filename to delete' }),
    ApiResponse({
      status: 200,
      description: 'File deleted successfully',
    }),
    ApiResponse({ status: 404, description: 'File not found' }),
    CheckPolicies(
      (ability: AppAbility) =>
        ability.can('delete', 'Files') || ability.can('super-modify', 'Files'),
    ),
  );
}

// list buckets
export function filesBucketsListEndpointDecorators() {
  return applyDecorators(
    Get('buckets'),
    ApiOperation({ summary: 'List all buckets' }),
    ApiResponse({
      status: 200,
      description: 'Buckets listed successfully',
    }),
    CheckPolicies(
      (ability: AppAbility) =>
        ability.can('read', 'Files') || ability.can('super-modify', 'Files'),
    ),
  );
}

// create bucket
export function filesBucketCreateEndpointDecorators() {
  return applyDecorators(
    Post('buckets/:name'),
    ApiOperation({ summary: 'Create a new bucket' }),
    ApiParam({ name: 'name', description: 'The name of the bucket to create' }),
    ApiQuery({
      name: 'region',
      required: false,
      description: 'The region to create the bucket in',
    }),
    ApiQuery({
      name: 'publicPolicy',
      required: false,
      description: 'Whether to set a public policy for the bucket',
    }),
    ApiResponse({
      status: 201,
      description: 'Bucket created successfully',
    }),
    ApiResponse({ status: 400, description: 'Bad request' }),
    CheckPolicies(
      (ability: AppAbility) =>
        ability.can('create', 'Files') || ability.can('super-modify', 'Files'),
    ),
  );
}

// delete bucket
export function filesBucketDeleteEndpointDecorators() {
  return applyDecorators(
    Delete('buckets/:name'),
    ApiOperation({ summary: 'Delete a bucket' }),
    ApiParam({ name: 'name', description: 'The name of the bucket to delete' }),
    ApiQuery({
      name: 'force',
      required: false,
      description: 'Whether to force deletion by removing all objects first',
    }),
    ApiResponse({
      status: 200,
      description: 'Bucket deleted successfully',
    }),
    ApiResponse({ status: 404, description: 'Bucket not found' }),
    CheckPolicies(
      (ability: AppAbility) =>
        ability.can('delete', 'Files') || ability.can('super-modify', 'Files'),
    ),
  );
}
