import { Inject, Injectable, NotFoundException, Request } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { ResponseUserDto } from '../dto/response-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { compareSync, hashSync } from 'bcryptjs';
import { Pagination } from 'src/common/decorators/pagination/pagination-params.decorator';
import {
  PaginatedResponse,
  paginateResponse,
} from 'src/common/utils/pagination.util';
import { ValidationException } from 'src/common/exceptions/validation.exception';
import { PureRoleDto } from 'src/modules/users/dto/pure-role.dto';
import { ResponseUserRoleDto } from '../dto/response-user-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/role/entities/role.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ResponseRoleDto } from 'src/role/dto/response-role.dto';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UsersService {
  private userRepository: Repository<User>;
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    // get users table repository to interact with the database
    this.userRepository = this.dataSource.getRepository(User);
  }

  async create(createUserDto: CreateUserDto): Promise<ResponseUserDto> {
    const hashedPassword = await hashSync(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    const savedUser = await this.userRepository.save(user);
    return plainToInstance(ResponseUserDto, savedUser, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(
    paginationParams: Pagination,
    search?: string,
  ): Promise<PaginatedResponse<User>> {
    const { page, limit } = paginationParams;

    // Create query builder
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // Add search condition if search term is provided
    if (search && search.trim()) {
      queryBuilder.where(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search.trim()}%` }
      );
    }

    // Add pagination
    const [items, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    return {
      items,
      total,
      currentPage: page,
      pageSize: limit,
      totalPages,
    };
  }

  async findOne(id: string): Promise<ResponseUserRoleDto> {
    const user = await this.userRepository.findOne({
      where: { id },
      cache: 2000,
    });
    return plainToInstance(ResponseUserRoleDto, user, {
      excludeExtraneousValues: true,
    });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: { email },
      relations: { roles: true },
    });
  }

  async update(
    id: string,
    { oldPassword, password, repeatPassword, ...updateUserDto }: UpdateUserDto,
  ): Promise<ResponseUserRoleDto> {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (password) {
      if (await compareSync(oldPassword, user.password)) {
        const hashedNewPassword = await hashSync(password, 10);
        user.password = hashedNewPassword;
      } else {
        throw new ValidationException([
          'oldPassword : Old password is not correct!',
        ]);
      }
    }
    // Use Object.entries to only update the fields that are provided
    Object.entries(updateUserDto).forEach(([key, value]) => {
      if (value !== undefined) {
        user[key] = value;
      }
    });
    const updatedUser = await this.userRepository.save(user);

    const refreshTokenCacheKey = `refresh_tokens_by_user_id_${user.id}`;
    const rtString = await this.cacheManager.get<string>(refreshTokenCacheKey);
    const rt = JSON.parse(rtString);
    await this.cacheManager.del(refreshTokenCacheKey);

    if (password && password !== updatedUser.password) {
      // TODO: must remove users AT cookie
      return;
    }
    const { roles, ...pureResponse } = plainToInstance(
      ResponseUserRoleDto,
      updatedUser,
      {
        excludeExtraneousValues: true,
      },
    );
    const pureRoles = roles.map((role) => {
      const { permissions, ...pureRole } = role;
      return pureRole;
    });
    await this.cacheManager.set(
      refreshTokenCacheKey,
      JSON.stringify({ ...rt, user: { ...pureResponse, roles } }),
    );
    return {
      ...pureResponse,
      roles: pureRoles,
    } as ResponseUserRoleDto;
  }

  async updateUserRoles(
    userId: string,
    roles: PureRoleDto[],
  ): Promise<ResponseUserRoleDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { roles: true },
    });
    if (!user) {
      throw new NotFoundException(`کاربر مورد نظر یافت نشد`);
    }
    // Clear existing roles
    user.roles = [];
    // Find and add new roles
    for (const roleDto of roles) {
      const role = await this.roleRepository.findOne({
        where: { id: roleDto.id },
      });
      if (role) {
        user.roles.push(role);
      }
    }
    // Save the updated user
    const updatedUser = await this.userRepository.save(user);
    // invalidate caches of user rules (ability)
    const abilityCacheKey = `ability_rules_by_user_id_${userId}`;
    await this.cacheManager.del(abilityCacheKey);
    const refreshTokenCacheKey = `refresh_tokens_by_user_id_${userId}`;
    await this.cacheManager.del(refreshTokenCacheKey);
    return plainToInstance(ResponseUserRoleDto, updatedUser, {
      excludeExtraneousValues: true,
    });
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`کاربر مورد نظر یافت نشد`);
    }
    await this.userRepository.remove(user);
    const cacheKey = `ability_rules_by_user_id_${id}`;
    const refreshTokenCacheKey = `refresh_tokens_by_user_id_${id}`;
    await this.cacheManager.del(refreshTokenCacheKey);
    await this.cacheManager.del(cacheKey);
  }

  async RolesOfUserWithItsPermissions(
    userId: string,
  ): Promise<ResponseRoleDto[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    return plainToInstance(ResponseRoleDto, user.roles, {
      excludeExtraneousValues: true,
    });
  }
}
