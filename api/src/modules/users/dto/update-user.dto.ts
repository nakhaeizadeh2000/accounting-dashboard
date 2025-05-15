import { PartialType, OmitType, ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import {
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Expose } from 'class-transformer';
import { Match } from 'src/common/decorators/validators/match.decorator';
import { NotMatch } from 'src/common/decorators/validators/not-match.decorator';
import { AllowIfPropertyExists } from 'src/common/decorators/validators/allow-if-property-exists.decorator';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['email'] as const),
) {
  @IsOptional()
  @IsString()
  @MinLength(8)
  @NotMatch('password')
  @AllowIfPropertyExists('password')
  @AllowIfPropertyExists('repeatPassword')
  @ApiProperty({ example: 'amir123amir' })
  @Expose()
  oldPassword?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @Match('repeatPassword')
  @AllowIfPropertyExists('oldPassword')
  @AllowIfPropertyExists('repeatPassword')
  @ApiProperty({ example: 'amir123amir2' })
  @Expose()
  password?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @Match('password')
  @AllowIfPropertyExists('oldPassword')
  @AllowIfPropertyExists('password')
  @ApiProperty({ example: 'amir123amir2' })
  @Expose()
  repeatPassword?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'امیرحسین ۲' })
  @Expose()
  firstName?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'نخعی زاده ۲' })
  @Expose()
  lastName?: string;
}
