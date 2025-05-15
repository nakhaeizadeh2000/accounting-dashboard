import { ApiProperty } from '@nestjs/swagger';
import { IsJWT } from 'class-validator';

export class LogoutBodyDto {
  @ApiProperty({ description: 'AT token (JWT)' })
  @IsJWT()
  accessToken: string;
}
