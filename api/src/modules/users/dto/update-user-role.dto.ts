import { Expose, Type } from 'class-transformer';
import {
  ValidateNested,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { PureRoleDto } from 'src/modules/users/dto/pure-role.dto';

export class UpdateUserRolesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(0)
  @ArrayMaxSize(100)
  @Type(() => PureRoleDto)
  @Expose()
  roles: PureRoleDto[];
}
