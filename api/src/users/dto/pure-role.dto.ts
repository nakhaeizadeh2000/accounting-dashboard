import { Expose } from 'class-transformer';
import { IsInt, IsNumber, IsString } from 'class-validator';

export class PureRoleDto {
  @IsInt()
  @Expose()
  id: number;

  @IsString()
  @Expose()
  name: string;
}
