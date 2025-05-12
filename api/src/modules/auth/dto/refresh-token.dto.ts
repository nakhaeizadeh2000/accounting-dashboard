import { Expose, Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { RefreshTokenPayloadDto } from './refresh-token-payload.dto';

export class RefreshTokenDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RefreshTokenPayloadDto)
  @Expose()
  refreshTokens: RefreshTokenPayloadDto[];
}
