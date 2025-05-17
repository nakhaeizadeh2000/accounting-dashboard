import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Role } from '../entities/role.entity';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { plainToInstance } from 'class-transformer';
import { ResponseRoleDto } from '../dto/response-role.dto';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);
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
      relations: { users: true },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    // Use Object.entries to only update the fields that are provided
    Object.entries(updateRoleDto).forEach(([key, value]) => {
      if (value !== undefined) {
        role[key] = value;
      }
    });

    try {
      const savedRole = await this.roleRepository.save(role);
      const response = plainToInstance(ResponseRoleDto, savedRole, {
        excludeExtraneousValues: true,
      });

      // Properly await all cache invalidation
      if (role.users && role.users.length > 0) {
        await Promise.all(
          role.users.map(async (user) => {
            try {
              await this.cacheManager.del(
                `refresh_tokens_by_user_id_${user.id}`,
              );
              await this.cacheManager.del(
                `ability_rules_by_user_id_${user.id}`,
              );
            } catch (error) {
              this.logger.warn(
                `Failed to invalidate cache for user ${user.id}: ${error.message}`,
              );
            }
          }),
        );
      }

      return response;
    } catch (error) {
      this.logger.error(`Failed to update role: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to update role');
    }
  }

  async remove(id: number): Promise<void> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: { users: true },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    try {
      await this.roleRepository.delete(id);

      if (role.users && role.users.length > 0) {
        await Promise.all(
          role.users.map(async (user) => {
            try {
              await this.cacheManager.del(
                `ability_rules_by_user_id_${user.id}`,
              );
              const refreshTokenCacheKey = `refresh_tokens_by_user_id_${user.id}`;
              await this.cacheManager.del(refreshTokenCacheKey);
            } catch (error) {
              this.logger.warn(
                `Failed to invalidate cache for user ${user.id}: ${error.message}`,
              );
            }
          }),
        );
      }
    } catch (error) {
      this.logger.error(`Failed to remove role: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to remove role');
    }
  }
}
