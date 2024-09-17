import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { Permission } from 'src/permissions/entities/permission.entity';

export class UpdateRoleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsArray()
  @Type(() => Permission)
  permissions?: Permission[];
}
