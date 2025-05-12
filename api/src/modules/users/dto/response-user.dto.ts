import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class ResponseUserDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  email: string;

  @IsOptional()
  @ApiProperty()
  @Expose()
  firstName?: string;

  @IsOptional()
  @ApiProperty()
  @Expose()
  lastName?: string;

  @IsBoolean()
  @Exclude({ toClassOnly: true })
  isAdmin: boolean;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<ResponseUserDto>) {
    Object.assign(this, partial);
  }
}
