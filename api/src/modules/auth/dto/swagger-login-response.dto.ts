import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from 'src/common/interceptors/response/response-wraper.dto';
import { ResponseLoginDto } from '../../../modules/auth/dto/response-login.dto';

export class SwaggerLoginResponseDto extends BaseResponseDto {
  @ApiProperty({
    type: ResponseLoginDto,
  })
  data: ResponseLoginDto;
}
