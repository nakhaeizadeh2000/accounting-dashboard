import { Body, Param } from '@nestjs/common';
import { UsersService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import {
  Pagination,
  PaginationParams,
} from 'common/decorators/pagination-params.decorator';
import {
  updateUserRolesEndpointDecorators,
  userDeleteEndpointDecorators,
  userFindAllEndpointDecorators,
  userFindOneEndpointDecorators,
  usersControllerDecorators,
  usersCreateEndpointDecorators,
  userUpdateEndpointDecorators,
} from './combined-decorators';
import { UpdateUserRolesDto } from '../dto/update-user-role.dto';

@usersControllerDecorators()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @usersCreateEndpointDecorators()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @userFindAllEndpointDecorators()
  async findAll(@PaginationParams() paginationParams: Pagination) {
    return this.usersService.findAll(paginationParams);
  }

  @userFindOneEndpointDecorators()
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @userUpdateEndpointDecorators()
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @updateUserRolesEndpointDecorators()
  updateUserRoles(
    @Param('id') targetUserId: string,
    @Body() updateRole: UpdateUserRolesDto,
  ) {
    return this.usersService.updateUserRoles(targetUserId, updateRole.roles);
  }

  @userDeleteEndpointDecorators()
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
