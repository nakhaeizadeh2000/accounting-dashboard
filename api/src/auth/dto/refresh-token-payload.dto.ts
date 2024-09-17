import { Expose, Type } from 'class-transformer';
import { IsInt, IsISO8601, IsUUID } from 'class-validator';
import { ResponseUserRoleDto } from 'src/users/dto/response-user-role.dto';

export class RefreshTokenPayloadDto {
  @IsInt()
  @Expose()
  id: string;

  @IsUUID()
  @Expose()
  userId: string;

  @Type(() => ResponseUserRoleDto)
  @Expose()
  user: ResponseUserRoleDto;

  @IsISO8601()
  @Expose()
  createdAt: string;

  @IsISO8601()
  @Expose()
  expiresAt: string;
}
