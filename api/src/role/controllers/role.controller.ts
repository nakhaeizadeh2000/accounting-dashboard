import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RoleService } from '../services/role.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import {
  roleControllerDecorators,
  roleCreateEndpointDecorators,
  roleDeleteEndpointDecorators,
  roleFindAllEndpointDecorators,
  roleFindOneEndpointDecorators,
  roleUpdateEndpointDecorators,
} from './combined-decorators';

@roleControllerDecorators()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @roleCreateEndpointDecorators()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @roleFindAllEndpointDecorators()
  getAll() {
    return this.roleService.getAll();
  }

  @roleFindOneEndpointDecorators()
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(+id);
  }

  @roleUpdateEndpointDecorators()
  update(@Param('id') id: number, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(id, updateRoleDto);
  }

  @roleDeleteEndpointDecorators()
  remove(@Param('id') id: number) {
    return this.roleService.remove(id);
  }
}
