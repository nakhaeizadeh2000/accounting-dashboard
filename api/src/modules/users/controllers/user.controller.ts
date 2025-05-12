import { Body, Param, Query } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import {
  Pagination,
  PaginationParams,
} from 'src/common/decorators/pagination/pagination-params.decorator';
import {
  updateUserRolesEndpointDecorators,
  userDeleteEndpointDecorators,
  userFindAllEndpointDecorators,
  userFindOneEndpointDecorators,
  usersControllerDecorators,
  usersCreateEndpointDecorators,
  userUpdateEndpointDecorators,
} from '../decorators/combined-decorators';
import { UpdateUserRolesDto } from '../dto/update-user-role.dto';
import { UsersService } from '../services/user.service';

@usersControllerDecorators()
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @usersCreateEndpointDecorators()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @userFindAllEndpointDecorators()
  async findAll(
    @PaginationParams() paginationParams: Pagination,
    @Query('search') search?: string
  ) {
    return this.usersService.findAll(paginationParams, search);
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
