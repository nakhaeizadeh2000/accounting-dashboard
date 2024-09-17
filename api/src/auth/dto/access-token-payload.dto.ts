import { Expose } from 'class-transformer';
import { IsInt, IsUUID } from 'class-validator';

export class AccessTokenPayloadDto {
  @IsInt()
  @Expose()
  user_id: string;

  @IsUUID()
  @Expose()
  refresh_token_id: string;
}
