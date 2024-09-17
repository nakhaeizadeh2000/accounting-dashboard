import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from 'common/interceptors/response/response-wraper.dto';
import { ResponseLoginDto } from '../response-login.dto';

export class SwaggerLoginResponseDto extends BaseResponseDto {
  @ApiProperty({
    type: ResponseLoginDto,
  })
  data: ResponseLoginDto;
}
