import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  @Expose()
  name: string;
}
