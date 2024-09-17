import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ResponseLoginDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiODEyMzg3M2UtY2EyMy00NTg4LTllMGEtN2VjYjk4NjQyOGRmIiwicmVmcmVzaF90b2tlbl9pZCI6IjIwNTQ0MDJlLWEzMWQtNGM1MS05NzkxLWFiMWEzMWQxMDM1NSIsImlhdCI6MTcyNjQxODE5NiwiZXhwIjoxNzI2NDE4MjAyfQ.Gs-8JsyUwQkRDUyW-5ikw1PFIvOLRKVmHUm6AYWxMzE',
  })
  @Expose()
  access_token: string;

  @ApiProperty({
    description: 'seconds untill AT cookie expires and browser remove it',
    example: 18000,
  })
  @Expose()
  cookie_expires_in: number;
}
