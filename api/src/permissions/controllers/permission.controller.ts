import { Body, Param } from '@nestjs/common';
import { PermissionService } from '../services/permission.service';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import {
  permissionControllerDecorators,
  permissionCreateEndpointDecorators,
  permissionDeleteEndpointDecorators,
  permissionFindAllEndpointDecorators,
  permissionFindOneEndpointDecorators,
  permissionUpdateEndpointDecorators,
} from '../decorators/combined-decorators';

@permissionControllerDecorators()
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) { }

  @permissionCreateEndpointDecorators()
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }

  @permissionFindAllEndpointDecorators()
  getAll() {
    return this.permissionService.getAll();
  }
  @permissionFindOneEndpointDecorators()
  findOne(@Param('id') id: string) {
    return this.permissionService.findOne(id);
  }

  @permissionUpdateEndpointDecorators()
  update(
    @Param('id') id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionService.update(id.toString(), updatePermissionDto);
  }

  @permissionDeleteEndpointDecorators()
  remove(@Param('id') id: number) {
    return this.permissionService.remove(id.toString());
  }
}
