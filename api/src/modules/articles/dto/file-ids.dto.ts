import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';
import { Expose } from 'class-transformer';

export class FileIdsDto {
  @ApiProperty({
    description: 'Array of file IDs to associate with the article',
    type: [String],
    example: [
      'f1e2d3c4-b5a6-7890-abcd-1234567890ab',
      'f9e8d7c6-b5a4-3210-abcd-1234567890ab',
    ],
  })
  @IsArray()
  @IsUUID(undefined, { each: true })
  @Expose()
  fileIds: string[];
}
