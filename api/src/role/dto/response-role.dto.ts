import { Expose, Type } from 'class-transformer';
import { IsString, IsUUID } from 'class-validator';
import { ResponsePermissionDto } from 'src/permissions/dto/response-permission.dto';

export class ResponseRoleDto {
  @IsUUID()
  @Expose()
  id: number;

  @IsString()
  @Expose()
  name: string;

  @Type(() => ResponsePermissionDto)
  @Expose()
  permissions: ResponsePermissionDto[];
}
