import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Role } from '../entities/role.entity';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { Permission } from 'src/permissions/entities/permission.entity';
import { plainToInstance } from 'class-transformer';
import { ResponseRoleDto } from '../dto/response-role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<ResponseRoleDto> {
    const role = this.roleRepository.create(createRoleDto);
    const savedRole = await this.roleRepository.save(role);
    const response = plainToInstance(ResponseRoleDto, savedRole, {
      excludeExtraneousValues: true,
    });
    return response;
  }

  async getAll(): Promise<ResponseRoleDto[]> {
    const roles = await this.roleRepository.find();
    const response = plainToInstance(ResponseRoleDto, roles, {
      excludeExtraneousValues: true,
    });
    return response;
  }

  async findOne(id: number): Promise<ResponseRoleDto> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: { permissions: true },
    });
    return plainToInstance(ResponseRoleDto, role, {
      excludeExtraneousValues: true,
    });
  }

  async update(
    id: number,
    updateRoleDto: UpdateRoleDto,
  ): Promise<ResponseRoleDto> {
    const role = await this.roleRepository.findOne({
      where: { id },
    });
    // Use Object.entries to only update the fields that are provided
    Object.entries(updateRoleDto).forEach(([key, value]) => {
      if (value !== undefined) {
        role[key] = value;
      }
    });
    const savedRole = await this.roleRepository.save(role);
    const response = plainToInstance(ResponseRoleDto, savedRole, {
      excludeExtraneousValues: true,
    });

    // TODO: must test to check if role.users exists and this works
    role.users.forEach(async (user) => {
      const refreshTokenCacheKey = `refresh_tokens_by_user_id_${user.id}`;
      await this.cacheManager.del(refreshTokenCacheKey);
      await this.cacheManager.del(`ability_rules_by_user_id_${user.id}`);
    });

    return response;
  }

  async remove(id: number): Promise<void> {
    await this.roleRepository.delete(id);
    const { users, ...roles } = await this.roleRepository.findOne({
      where: { id },
      relations: {
        users: true,
      },
    });
    users.forEach(async (user) => {
      await this.cacheManager.del(`ability_rules_by_user_id_${user.id}`);
      const refreshTokenCacheKey = `refresh_tokens_by_user_id_${user.id}`;
      await this.cacheManager.del(refreshTokenCacheKey);
    });
  }
}
