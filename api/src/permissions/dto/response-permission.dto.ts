import { Expose } from 'class-transformer';
import { IsString, IsUUID, IsOptional, IsNumber } from 'class-validator';

export class ResponsePermissionDto {
  @Expose()
  id: number;

  @Expose()
  action: string;

  @Expose()
  subject: string;

  @Expose()
  fields?: string[];

  @Expose()
  conditions: Object;

  @Expose()
  inverted: boolean;
}
