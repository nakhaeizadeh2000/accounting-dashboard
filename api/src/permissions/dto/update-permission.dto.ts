import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreatePermissionDto } from './create-permission.dto';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePermissionDto extends CreatePermissionDto {}
